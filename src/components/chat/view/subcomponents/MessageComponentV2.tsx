import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SessionProviderLogo from '../../../llm-logo-provider/SessionProviderLogo';
import type {
  ChatMessage,
  ClaudePermissionSuggestion,
  PermissionGrantResult,
  Provider,
} from '../../types/types';
import { formatUsageLimitText } from '../../utils/chatFormatting';
import { getClaudePermissionSuggestion } from '../../utils/chatPermissions';
import type { Project } from '../../../../types/app';
import { ToolRenderer, shouldHideToolResult } from '../../tools';
import { cn } from '../../../../lib/utils';
import { Markdown } from './Markdown';
import MessageCopyControl from './MessageCopyControl';
import { THINKING_STREAM_PREFIX, THINKING_FINAL_PREFIX } from '../../../../shared/messageIdPrefixes';

type DiffLine = {
  type: string;
  content: string;
  lineNum: number;
};

type MessageComponentProps = {
  message: ChatMessage;
  prevMessage: ChatMessage | null;
  createDiff: (oldStr: string, newStr: string) => DiffLine[];
  onFileOpen?: (filePath: string, diffInfo?: unknown) => void;
  onShowSettings?: () => void;
  onGrantToolPermission?: (suggestion: ClaudePermissionSuggestion) => PermissionGrantResult | null | undefined;
  autoExpandTools?: boolean;
  showRawParameters?: boolean;
  showThinking?: boolean;
  selectedProject?: Project | null;
  provider: Provider | string;
  liveStatusText?: string | null;
};

type InteractiveOption = {
  number: string;
  text: string;
  isSelected: boolean;
};

type PermissionGrantState = 'idle' | 'granted' | 'error';
const COPY_HIDDEN_TOOL_NAMES = new Set(['Bash', 'Edit', 'Write', 'ApplyPatch']);

const THINKING_VERBS = [
  'Thinking',
  'Processing',
  'Analyzing',
  'Computing',
  'Reasoning',
  'Synthesizing',
  'Deliberating',
  'Reflecting',
];

const THINKING_ICONS = ['✻', '✦', '✧', '★', '✶', '✷'];

function getThinkingProviderLabel(provider: string): string {
  switch (provider) {
    case 'cursor': return 'Cursor';
    case 'codex': return 'Codex';
    case 'gemini': return 'Gemini';
    default: return 'Claude';
  }
}

function formatThinkingElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes < 1 ? `${seconds}s` : `${minutes}m ${seconds}s`;
}

/**
 * Inline thinking block rendered within the message stream.
 * Layout:
 *   [Avatar] ProviderName  Live          30s · 189 tokens
 *   ┌──────────────────────────────────────────────┐
 *   │  Thinking... (shimmer gradient text)          │
 *   │  (real thinking content scrolls here)         │
 *   └──────────────────────────────────────────────┘
 */
const ThinkingBlock = memo(function ThinkingBlock({
  content,
  isStreaming,
  statusText,
  provider,
}: {
  content: string;
  isStreaming: boolean;
  statusText?: string;
  provider: string;
}) {
  const { t } = useTranslation('chat');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [verbIndex, setVerbIndex] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);
  const [dotCount, setDotCount] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStreaming) return;
    const start = Date.now();
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [isStreaming]);

  useEffect(() => {
    if (!isStreaming) return;
    const timer = setInterval(() => {
      setVerbIndex((p) => (p + 1) % THINKING_VERBS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isStreaming]);

  useEffect(() => {
    if (!isStreaming) return;
    const timer = setInterval(() => {
      setIconIndex((p) => (p + 1) % THINKING_ICONS.length);
    }, 400);
    return () => clearInterval(timer);
  }, [isStreaming]);

  useEffect(() => {
    if (!isStreaming) return;
    const timer = setInterval(() => {
      setDotCount((p) => (p + 1) % 4);
    }, 350);
    return () => clearInterval(timer);
  }, [isStreaming]);

  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  const providerLabel = getThinkingProviderLabel(provider);
  const displayStatus = statusText || THINKING_VERBS[verbIndex];
  const dots = '.'.repeat(dotCount);
  const elapsedLabel = elapsedTime > 0 ? formatThinkingElapsed(elapsedTime) : '';

  // Collapsed state for finished thinking
  if (!isStreaming && !content) {
    return null;
  }

  // Finished thinking with content: show collapsible
  if (!isStreaming && content) {
    return (
      <details className="v2-thinking">
        <summary className="v2-thinking-header">
          <svg className="v2-thinking-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="v2-thinking-title">{t('thinking.emoji')}</span>
        </summary>
        <div className="v2-thinking-content">
          <Markdown className="prose prose-sm max-w-none dark:prose-invert">
            {content}
          </Markdown>
        </div>
      </details>
    );
  }

  // Streaming: full inline thinking block
  return (
    <div className="thinking-inline-block">
      {/* Header row */}
      <div className="thinking-inline-header">
        <div className="thinking-inline-header-left">
          <div className="thinking-inline-avatar">
            <SessionProviderLogo provider={provider as any} className="thinking-inline-logo" />
            <span className="thinking-inline-animated-icon">
              {THINKING_ICONS[iconIndex]}
            </span>
          </div>
          <span className="thinking-inline-provider">{providerLabel}</span>
          <span className="thinking-inline-badge-live">
            <span className="thinking-inline-pulse-dot" />
            Live
          </span>
        </div>
        <div className="thinking-inline-header-stats">
          {elapsedLabel && (
            <span className="thinking-inline-stat-chip">{elapsedLabel}</span>
          )}
        </div>
      </div>

      {/* Content box */}
      <div className="thinking-inline-content-box">
        <div className="thinking-inline-status-line">
          <span className="thinking-inline-shimmer">
            {displayStatus}{dots}
          </span>
        </div>
        {content && (
          <div className="thinking-inline-content-scroll" ref={contentRef}>
            <pre className="thinking-inline-content-text">{content}</pre>
          </div>
        )}
      </div>
    </div>
  );
});

const MessageComponentV2 = memo(({ message, prevMessage, createDiff, onFileOpen, onShowSettings, onGrantToolPermission, autoExpandTools, showRawParameters, showThinking, selectedProject, provider, liveStatusText }: MessageComponentProps) => {
  const { t } = useTranslation('chat');
  const isGrouped = prevMessage && prevMessage.type === message.type &&
    ((prevMessage.type === 'assistant') ||
      (prevMessage.type === 'user') ||
      (prevMessage.type === 'tool') ||
      (prevMessage.type === 'error'));
  const messageRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const permissionSuggestion = getClaudePermissionSuggestion(message, provider);
  const [permissionGrantState, setPermissionGrantState] = useState<PermissionGrantState>('idle');
  const userCopyContent = String(message.content || '');
  const formattedMessageContent = useMemo(
    () => formatUsageLimitText(String(message.content || '')),
    [message.content]
  );
  const assistantCopyContent = message.isToolUse
    ? String(message.displayText || message.content || '')
    : formattedMessageContent;
  const isCommandOrFileEditToolResponse = Boolean(
    message.isToolUse && COPY_HIDDEN_TOOL_NAMES.has(String(message.toolName || ''))
  );
  const shouldShowUserCopyControl = message.type === 'user' && userCopyContent.trim().length > 0;
  const shouldShowAssistantCopyControl = message.type === 'assistant' &&
    assistantCopyContent.trim().length > 0 &&
    !isCommandOrFileEditToolResponse;

  useEffect(() => {
    setPermissionGrantState('idle');
  }, [permissionSuggestion?.entry, message.toolId]);

  useEffect(() => {
    const node = messageRef.current;
    if (!autoExpandTools || !node || !message.isToolUse) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isExpanded) {
            setIsExpanded(true);
            const details = node.querySelectorAll<HTMLDetailsElement>('details');
            details.forEach((detail) => {
              detail.open = true;
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.unobserve(node);
  }, [autoExpandTools, isExpanded, message.isToolUse]);

  const formattedTime = useMemo(() => new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), [message.timestamp]);
  // Streaming thinking (__thinking_ prefix) always shows regardless of showThinking toggle.
  // Completed thinking (thinking_ prefix) respects showThinking toggle.
  const isStreamingThinking = Boolean(
    message.isThinking &&
    message.id?.startsWith(THINKING_STREAM_PREFIX)
  );
  const shouldHideThinkingMessage = Boolean(
    message.isThinking && !isStreamingThinking && !showThinking
  );

  if (shouldHideThinkingMessage) {
    return null;
  }

  // Claude Code Mobile style: Avatar left, content right
  return (
    <div
      ref={messageRef}
      data-message-timestamp={message.timestamp || undefined}
      className={cn('v2-message', isGrouped && 'grouped')}
    >
      {message.type === 'user' ? (
        /* User Message - Right aligned, mirrored layout */
        <div className="v2-message-user-wrapper">
          <div className="v2-avatar v2-avatar-user">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="v2-message-content">
            <div className="v2-message-header">
              <span className="v2-message-sender">{t('messageTypes.user', { defaultValue: 'You' })}</span>
              <span className="v2-message-time">{formattedTime}</span>
            </div>
            <div className="v2-message-body">
              <p className="m-0">{message.content}</p>
              {message.images && message.images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {message.images.map((img, idx) => (
                    <img
                      key={img.name || idx}
                      src={img.data}
                      alt={img.name}
                      className="h-auto max-w-full cursor-pointer rounded-lg transition-opacity hover:opacity-90"
                      onClick={() => window.open(img.data, '_blank')}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : message.isTaskNotification ? (
        /* Task notification */
        <div className="flex items-center gap-2 px-4 py-1">
          <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${message.taskStatus === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-xs text-gray-500">{message.content}</span>
        </div>
      ) : (
        /* AI/Error/Tool Messages - Avatar + Content */
        <div className={`flex max-w-full gap-3 overflow-hidden ${message.isThinking ? 'w-full' : ''}`}>
          {/* Avatar */}
          {!isGrouped && (
            message.type === 'error' ? (
              <div className="v2-avatar bg-red-100 text-red-500 dark:bg-red-900/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
            ) : message.type === 'tool' ? (
              <div className="v2-avatar bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
            ) : (
              <div className="v2-avatar v2-avatar-assistant">
                <SessionProviderLogo provider={provider} className="h-full w-full" />
              </div>
            )
          )}
          {isGrouped && <div className="w-9 flex-shrink-0" />}

          {/* Content */}
          <div className={message.isThinking ? "w-full flex-1" : "min-w-0 flex-1"}>
            {!isGrouped && (
              <div className="v2-message-header">
                <span className="v2-message-sender">
                  {message.type === 'error' ? t('messageTypes.error') : message.type === 'tool' ? t('messageTypes.tool') : (provider === 'cursor' ? t('messageTypes.cursor') : provider === 'codex' ? t('messageTypes.codex') : provider === 'gemini' ? t('messageTypes.gemini') : t('messageTypes.claude'))}
                </span>
                <span className="v2-message-time">{formattedTime}</span>
              </div>
            )}

            {message.isToolUse ? (
              <>
                <div className="v2-message-body mb-2">
                  <Markdown className="prose prose-sm max-w-none dark:prose-invert">
                    {String(message.displayText || '')}
                  </Markdown>
                </div>

                {message.toolInput && (
                  <ToolRenderer
                    toolName={message.toolName || 'UnknownTool'}
                    toolInput={message.toolInput}
                    toolResult={message.toolResult}
                    toolId={message.toolId}
                    mode="input"
                    onFileOpen={onFileOpen}
                    createDiff={createDiff}
                    selectedProject={selectedProject}
                    autoExpandTools={autoExpandTools}
                    showRawParameters={showRawParameters}
                    rawToolInput={typeof message.toolInput === 'string' ? message.toolInput : undefined}
                    isSubagentContainer={message.isSubagentContainer}
                    subagentState={message.subagentState}
                    useV2Style={true}
                  />
                )}

                {message.toolResult && !shouldHideToolResult(message.toolName || 'UnknownTool', message.toolResult) && (
                  message.toolResult.isError ? (
                    <div id={`tool-result-${message.toolId}`} className="v2-tool-call mt-2">
                      <div className="v2-tool-header">
                        <svg className="v2-tool-icon text-red-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        <span className="v2-tool-name">{t('messageTypes.error')}</span>
                      </div>
                      <div className="p-3 text-sm text-red-700 dark:text-red-200">
                        <Markdown className="prose prose-sm prose-red max-w-none dark:prose-invert">
                          {String(message.toolResult.content || '')}
                        </Markdown>
                        {permissionSuggestion && (
                          <div className="mt-3 border-t border-red-200/60 pt-3 dark:border-red-800/60">
                            <button
                              type="button"
                              onClick={() => {
                                if (!onGrantToolPermission) return;
                                const result = onGrantToolPermission(permissionSuggestion);
                                if (result?.success) {
                                  setPermissionGrantState('granted');
                                } else {
                                  setPermissionGrantState('error');
                                }
                              }}
                              disabled={permissionSuggestion.isAllowed || permissionGrantState === 'granted'}
                              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${permissionSuggestion.isAllowed || permissionGrantState === 'granted'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                                : 'border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-gray-900 dark:text-red-200'
                              }`}
                            >
                              {permissionSuggestion.isAllowed || permissionGrantState === 'granted'
                                ? t('permissions.added')
                                : t('permissions.grant', { tool: permissionSuggestion.toolName })}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div id={`tool-result-${message.toolId}`} className="scroll-mt-4">
                      <ToolRenderer
                        toolName={message.toolName || 'UnknownTool'}
                        toolInput={message.toolInput}
                        toolResult={message.toolResult}
                        toolId={message.toolId}
                        mode="result"
                        onFileOpen={onFileOpen}
                        createDiff={createDiff}
                        selectedProject={selectedProject}
                        autoExpandTools={autoExpandTools}
                        useV2Style={true}
                      />
                    </div>
                  )
                )}
              </>
            ) : message.isInteractivePrompt ? (
              <div className="v2-tool-call">
                <div className="v2-tool-header bg-amber-50 dark:bg-amber-900/20">
                  <svg className="v2-tool-icon text-amber-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span className="v2-tool-name">{t('interactive.title')}</span>
                </div>
                <div className="p-3 text-sm">
                  {(() => {
                    const lines = (message.content || '').split('\n').filter((line) => line.trim());
                    const questionLine = lines.find((line) => line.includes('?')) || lines[0] || '';
                    const options: InteractiveOption[] = [];
                    lines.forEach((line) => {
                      const optionMatch = line.match(/[❯\s]*(\d+)\.\s+(.+)/);
                      if (optionMatch) {
                        options.push({
                          number: optionMatch[1],
                          text: optionMatch[2].trim(),
                          isSelected: line.includes('❯')
                        });
                      }
                    });
                    return (
                      <>
                        <p className="mb-3">{questionLine}</p>
                        <div className="space-y-2">
                          {options.map((option) => (
                            <div
                              key={option.number}
                              className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${option.isSelected
                                ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20'
                                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                              }`}
                            >
                              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${option.isSelected ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                                {option.number}
                              </span>
                              <span className="flex-1 text-sm">{option.text}</span>
                              {option.isSelected && <span className="text-amber-500">❯</span>}
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : message.isThinking ? (
              <ThinkingBlock
                content={message.content || ''}
                isStreaming={isStreamingThinking}
                statusText={isStreamingThinking ? liveStatusText || undefined : undefined}
                provider={provider}
              />
            ) : (
              <div className="v2-message-body">
                {showThinking && message.reasoning && (
                  <details className="v2-thinking mb-3">
                    <summary className="v2-thinking-header">
                      <svg className="v2-thinking-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                      <span className="v2-thinking-title">{t('thinking.emoji')}</span>
                    </summary>
                    <div className="v2-thinking-content italic">
                      {message.reasoning}
                    </div>
                  </details>
                )}

                {(() => {
                  const content = formattedMessageContent;
                  const trimmedContent = content.trim();
                  if ((trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) &&
                    (trimmedContent.endsWith('}') || trimmedContent.endsWith(']'))) {
                    try {
                      const parsed = JSON.parse(trimmedContent);
                      return (
                        <div className="v2-code-block">
                          <div className="v2-code-header">
                            <span className="v2-code-lang">JSON</span>
                          </div>
                          <pre className="overflow-x-auto p-4 font-mono text-sm">
                            {JSON.stringify(parsed, null, 2)}
                          </pre>
                        </div>
                      );
                    } catch {
                      // Fall through
                    }
                  }
                  return (
                    <Markdown className="prose prose-sm max-w-none dark:prose-invert">
                      {content}
                    </Markdown>
                  );
                })()}
              </div>
            )}

            {(!message.isThinking && (shouldShowAssistantCopyControl || !isGrouped)) && (
              <div className="mt-2 flex items-center gap-2">
                {shouldShowAssistantCopyControl && (
                  <MessageCopyControl content={assistantCopyContent} messageType="assistant" />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default MessageComponentV2;
