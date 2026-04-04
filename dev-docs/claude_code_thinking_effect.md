# Claude Code CLI 思考效果复现指南

> 目标：完整复现 Claude Code CLI 的思考（thinking）展示效果，包括 API 对接、流式处理、UI 渲染三层实现。

---

## 一、整体架构

```
用户输入
  ↓
Anthropic API  ←── thinking: {type: "adaptive"}
  ↓
Server-Sent Events 流式响应
  ├── thinking_delta  → 思考内容（灰色斜体）
  └── text_delta      → 正式回答（正常文字）
  ↓
终端 UI（Claude Code 用 Ink/React，Web 可用 React）
  ├── 思考块：灰色 + 斜体 + 折叠/展开
  └── 正文块：正常白色文字，逐字流式渲染
```

---

## 二、API 层：开启 Adaptive Thinking

### 关键参数

Claude Code 当前（2026年）使用的是 **Adaptive Thinking**，不是旧版固定 budget 的方式。

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-6",       # 或 claude-sonnet-4-6
    max_tokens=16000,
    thinking={"type": "adaptive"}, # ✅ 自适应，模型自己决定思考多少
    # thinking={"type": "enabled", "budget_tokens": 10000}  # ❌ 旧方式，已废弃
    messages=[
        {"role": "user", "content": "请分析这段代码的性能瓶颈..."}
    ]
)

for block in response.content:
    if block.type == "thinking":
        print(f"[思考] {block.thinking}")  # 这是思考摘要，非完整内容
    elif block.type == "text":
        print(f"[回答] {block.text}")
```

### 流式模式（核心）

Claude Code 用的是流式，这样才能实现"边想边显示"：

```python
with client.messages.stream(
    model="claude-opus-4-6",
    max_tokens=16000,
    thinking={"type": "adaptive"},
    messages=[{"role": "user", "content": "..."}]
) as stream:
    current_block_type = None
    
    for event in stream:
        if event.type == "content_block_start":
            current_block_type = event.content_block.type
            # "thinking" 或 "text"
            
        elif event.type == "content_block_delta":
            if event.delta.type == "thinking_delta":
                # 思考内容流式到来
                print(event.delta.thinking, end="", flush=True)
            elif event.delta.type == "text_delta":
                # 正文内容流式到来
                print(event.delta.text, end="", flush=True)
```

### TypeScript 版本

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const stream = await client.messages.stream({
  model: "claude-opus-4-6",
  max_tokens: 16000,
  thinking: { type: "adaptive" },
  messages: [{ role: "user", content: "..." }],
});

for await (const event of stream) {
  if (event.type === "content_block_delta") {
    if (event.delta.type === "thinking_delta") {
      process.stdout.write(event.delta.thinking); // 思考内容
    } else if (event.delta.type === "text_delta") {
      process.stdout.write(event.delta.text);     // 正文
    }
  }
}
```

### 思考内容说明

| 字段 | 说明 |
|------|------|
| `block.thinking` | 思考**摘要**（Claude 4 默认返回摘要，非完整推理） |
| `block.signature` | 加密的完整思考，用于多轮对话上下文延续 |
| `display: "omitted"` | 可设置完全不返回思考文字（降低延迟，但仍计费） |

> **关键细节**：Claude 4 模型（Opus 4.6, Sonnet 4.6）返回的 thinking 是**摘要版本**，由另一个模型生成。完整思考内容被加密存储在 `signature` 中，如需完整版需联系 Anthropic 销售团队。

### 多轮对话：保留 thinking blocks

```python
# 多轮对话必须把 thinking blocks 原样传回
messages = [
    {"role": "user", "content": "第一个问题"},
    {
        "role": "assistant",
        "content": [
            # ✅ 必须保留 thinking block，不能修改或删除
            {"type": "thinking", "thinking": "...", "signature": "..."},
            {"type": "text", "text": "第一个回答"}
        ]
    },
    {"role": "user", "content": "继续追问..."}
]
```

---

## 三、UI 层：终端效果复现

### 3.1 Claude Code 的技术栈

Claude Code CLI 本质上是一个用 **Ink**（React for Terminal）构建的 React 应用：

- **框架**：[Ink](https://github.com/vadimdemedes/ink) — 把 React 组件渲染成终端 UI
- **状态管理**：React hooks（useState、useEffect）
- **流式渲染**：接收 SSE 事件 → setState → Ink 重新渲染受影响的组件
- **Diff 渲染**：`CLAUDE_CODE_NO_FLICKER=1` 模式下，维护虚拟终端状态，只更新变化的字符（类似 React 的 Virtual DOM diff）

### 3.2 思考块的视觉设计

Claude Code 的思考效果核心视觉规则：

| 元素 | 样式 |
|------|------|
| 思考文字 | 灰色（`#666` 或 `dim`）+ 斜体 |
| 思考状态指示符 | `∴`（数学"因此"符号，不是 `...` 或 spinner） |
| 折叠状态 | 显示 stub：`∴ Thinking...`，点击/按键展开 |
| 展开状态 | 完整思考文字，灰色斜体，流式逐字出现 |
| 正文 | 正常亮色，Markdown 渲染 |
| 过渡 | 思考结束 → 正文开始，无跳跃感 |

**状态指示符选择原因**：`∴` 是数学符号"因此"，因为模型字面上就是在推理走向结论。这不是 PM 需求，是团队某人认为符号应该有意义的设计决策。

### 3.3 连接质量的渐变反馈

Claude Code 的一个精妙设计：连接延迟不是二元状态（正常/超时），而是**渐变**：

```javascript
// 用指数移动平均，而非阈值判断
stalledIntensity += (target - stalledIntensity) * 0.1;
// spinner 颜色平滑从正常色渐变到红色
// 让你在系统告诉你之前就"感受到"连接在退化
```

### 3.4 加载文案设计

Claude Code 有 190 个不同的加载动词（不是反复显示"Loading..."）：
- `Flibbertigibbeting`
- `Recombobulating`  
- `Lollygagging`
- `Prestidigitating`
- `Shenaniganing`
- `Wibbling`

这些是可配置的，背后有一套 spinner verb 的 config API。

---

## 四、Web 端复现方案（React）

如果你不是做终端应用，而是 Web 应用，以下是完整的 React 复现方案。

### 4.1 组件结构

```
<ChatInterface>
  ├── <MessageList>
  │   └── <Message>
  │       ├── <ThinkingBlock>   ← 核心：思考展示
  │       └── <TextBlock>       ← 正文展示
  └── <InputArea>
```

### 4.2 ThinkingBlock 组件

```tsx
import { useState } from "react";

interface ThinkingBlockProps {
  content: string;        // 思考内容（流式累积）
  isStreaming: boolean;   // 是否还在思考中
}

export function ThinkingBlock({ content, isStreaming }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="thinking-block">
      {/* 头部：可点击折叠/展开 */}
      <button
        className="thinking-header"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="thinking-symbol">∴</span>
        <span className="thinking-label">
          {isStreaming ? "Thinking..." : "Thought process"}
        </span>
        {isStreaming && <span className="thinking-spinner" />}
        <span className="thinking-toggle">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* 内容：展开时显示 */}
      {expanded && (
        <div className="thinking-content">
          <pre>{content}</pre>
          {isStreaming && <span className="cursor-blink">▍</span>}
        </div>
      )}
    </div>
  );
}
```

### 4.3 CSS 样式

```css
/* 思考块整体 */
.thinking-block {
  margin: 8px 0;
  border-left: 2px solid #3a3a3a;
  border-radius: 4px;
  overflow: hidden;
}

/* 头部按钮 */
.thinking-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 12px;
  background: #1a1a1a;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
}

.thinking-header:hover {
  background: #222;
}

/* ∴ 符号 */
.thinking-symbol {
  color: #666;
  font-size: 14px;
  font-style: normal;
}

/* 标签文字 */
.thinking-label {
  color: #666;
  font-size: 13px;
  font-style: italic;  /* ← 斜体，这是关键 */
  flex: 1;
}

/* 流式 spinner */
.thinking-spinner {
  width: 12px;
  height: 12px;
  border: 1.5px solid #444;
  border-top-color: #666;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 展开后的思考内容 */
.thinking-content {
  padding: 10px 16px;
  background: #111;
  border-top: 1px solid #2a2a2a;
}

.thinking-content pre {
  margin: 0;
  color: #555;           /* ← 灰色，这是关键 */
  font-style: italic;    /* ← 斜体 */
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

/* 光标闪烁 */
.cursor-blink {
  color: #555;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* 折叠/展开按钮 */
.thinking-toggle {
  color: #444;
  font-size: 10px;
}
```

### 4.4 流式状态管理

```tsx
import { useState, useCallback } from "react";

interface StreamingState {
  thinkingContent: string;
  textContent: string;
  isThinking: boolean;
  isStreaming: boolean;
}

export function useChatStream() {
  const [state, setState] = useState<StreamingState>({
    thinkingContent: "",
    textContent: "",
    isThinking: false,
    isStreaming: false,
  });

  const startStream = useCallback(async (userMessage: string) => {
    setState({ thinkingContent: "", textContent: "", isThinking: false, isStreaming: true });

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    let currentBlockType: "thinking" | "text" | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = JSON.parse(line.slice(6));

        if (data.type === "content_block_start") {
          currentBlockType = data.content_block.type;
          if (currentBlockType === "thinking") {
            setState(prev => ({ ...prev, isThinking: true }));
          }
        }

        if (data.type === "content_block_stop") {
          if (currentBlockType === "thinking") {
            setState(prev => ({ ...prev, isThinking: false }));
          }
          currentBlockType = null;
        }

        if (data.type === "content_block_delta") {
          if (data.delta.type === "thinking_delta") {
            setState(prev => ({
              ...prev,
              thinkingContent: prev.thinkingContent + data.delta.thinking,
            }));
          } else if (data.delta.type === "text_delta") {
            setState(prev => ({
              ...prev,
              textContent: prev.textContent + data.delta.text,
            }));
          }
        }
      }
    }

    setState(prev => ({ ...prev, isStreaming: false }));
  }, []);

  return { state, startStream };
}
```

### 4.5 后端 SSE 接口（Node.js/Express）

```typescript
import Anthropic from "@anthropic-ai/sdk";
import express from "express";

const app = express();
const client = new Anthropic();

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  // 设置 SSE 响应头
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: message }],
  });

  // 把 Anthropic SSE 事件转发给前端
  for await (const event of stream) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  res.end();
});
```

---

## 五、终端端复现方案（Node.js + Ink）

如果你要复现的是真正的终端应用，使用 Ink：

```tsx
import React, { useState, useEffect } from "react";
import { render, Box, Text } from "ink";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

function ThinkingDisplay({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  return (
    <Box flexDirection="column" borderLeft={1} borderStyle="single" borderColor="gray" paddingLeft={1}>
      <Box>
        {/* ∴ 符号 + 状态 */}
        <Text color="gray" italic>∴ </Text>
        <Text color="gray" italic>
          {isStreaming ? "Thinking..." : "Thought process"}
        </Text>
      </Box>
      {content.length > 0 && (
        <Box marginTop={1}>
          {/* 思考内容：灰色斜体 */}
          <Text color="gray" italic dimColor>
            {content}
            {isStreaming && "▍"}
          </Text>
        </Box>
      )}
    </Box>
  );
}

function TextDisplay({ content }: { content: string }) {
  return (
    <Box marginTop={1}>
      <Text>{content}</Text>
    </Box>
  );
}

function App({ prompt }: { prompt: string }) {
  const [thinkingContent, setThinkingContent] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function run() {
      const stream = await client.messages.stream({
        model: "claude-opus-4-6",
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        messages: [{ role: "user", content: prompt }],
      });

      for await (const event of stream) {
        if (event.type === "content_block_start") {
          if (event.content_block.type === "thinking") setIsThinking(true);
          else setIsThinking(false);
        }
        if (event.type === "content_block_delta") {
          if (event.delta.type === "thinking_delta") {
            setThinkingContent(prev => prev + event.delta.thinking);
          } else if (event.delta.type === "text_delta") {
            setTextContent(prev => prev + event.delta.text);
          }
        }
      }
      setIsThinking(false);
      setDone(true);
    }
    run();
  }, [prompt]);

  return (
    <Box flexDirection="column" padding={1}>
      {/* 思考块 */}
      {(thinkingContent.length > 0 || isThinking) && (
        <ThinkingDisplay content={thinkingContent} isStreaming={isThinking} />
      )}
      {/* 正文 */}
      {textContent.length > 0 && (
        <TextDisplay content={textContent} />
      )}
      {done && <Text color="green">✓ Done</Text>}
    </Box>
  );
}

// 启动
render(<App prompt={process.argv[2] || "分析这段代码的性能瓶颈"} />);
```

---

## 六、细节还原清单

以下是从源码分析中得出的、值得复现的细节：

### ✅ 必须实现
- [ ] 思考内容用灰色（`#555` ~ `#666`）
- [ ] 思考内容用斜体（`font-style: italic`）
- [ ] 状态符号用 `∴` 而非 `...` 或旋转 spinner
- [ ] 流式逐字渲染（不是等全部生成再显示）
- [ ] 思考块和正文块分离，有视觉层级
- [ ] 思考完成后平滑过渡到正文

### 🎯 加分项
- [ ] 折叠/展开思考块（默认折叠）
- [ ] 思考中显示流式光标（`▍` 闪烁）
- [ ] 连接延迟时用渐变色（而非突然变红）
- [ ] 加载文案随机化（不止"Loading..."）
- [ ] 进度条用 Unicode 方块字符表示亚像素精度：`▏▎▍▌▋▊▉█`

### ⚠️ 常见误区
- ❌ 不要用 `think`、`think hard`、`ultrathink` 等 prompt 词语触发思考（这些只在 Claude Code 交互模式下有效，不等于 API 层的 thinking 参数）
- ❌ 不要在 Claude 4 模型上期望获得完整思考内容（API 返回的是摘要）
- ❌ 多轮对话不要丢弃 thinking blocks，否则上下文会断裂
- ❌ 不要用旧的 `budget_tokens` 方式（Opus 4.6/Sonnet 4.6 已废弃，推荐 `adaptive`）

---

## 七、快速验证

最简单的验证脚本：

```python
import anthropic

client = anthropic.Anthropic()

with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=8000,
    thinking={"type": "adaptive"},
    messages=[{"role": "user", "content": "用一句话解释量子纠缠，然后给我一个类比"}]
) as stream:
    current = None
    for event in stream:
        if event.type == "content_block_start":
            current = event.content_block.type
            if current == "thinking":
                print("\n\033[2m\033[3m∴ Thinking...\033[0m")
            elif current == "text":
                print("\n")
        elif event.type == "content_block_delta":
            if event.delta.type == "thinking_delta":
                print(f"\033[2m\033[3m{event.delta.thinking}\033[0m", end="", flush=True)
            elif event.delta.type == "text_delta":
                print(event.delta.text, end="", flush=True)

print("\n")
```

终端转义码说明：
- `\033[2m` = dim（变暗）
- `\033[3m` = italic（斜体）
- `\033[0m` = reset（重置）

---

## 参考资料

- [Adaptive Thinking 官方文档](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking)
- [Extended Thinking 官方文档](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)
- [Claude Code 源码分析（Ink/React 架构）](https://gist.github.com/Haseeb-Qureshi/d0dc36844c19d26303ce09b42e7188c1)
- [Ink - React for CLIs](https://github.com/vadimdemedes/ink)
- [Claude Code Verbose Mode 说明](https://code.claude.com/docs/en/common-workflows)
