<div align="center">
  <img src="public/logo.svg" alt="CloudCLI UI" width="64" height="64">
  <h1>Cloud CLI (Claude Code UI)</h1>
  <p><a href="https://docs.anthropic.com/en/docs/claude-code">Claude Code</a>, <a href="https://docs.cursor.com/en/cli/overview">Cursor CLI</a>, <a href="https://developers.openai.com/codex">Codex</a>, <a href="https://geminicli.com/">Gemini-CLI</a>를 위한 데스크톱 및 모바일 UI입니다.<br>로컬 또는 원격으로 사용하여 어디서나 활성 프로젝트와 세션을 확인하세요.</p>
</div>

<p align="center">
  <a href="https://cloudcli.ai">CloudCLI Cloud</a> · <a href="https://cloudcli.ai/docs">문서</a> · <a href="https://discord.gg/buxwujPNRE">Discord</a> · <a href="https://github.com/siteboon/claudecodeui/issues">버그 리포트</a> · <a href="CONTRIBUTING.md">기여하기</a>
</p>

<p align="center">
  <a href="https://cloudcli.ai"><img src="https://img.shields.io/badge/☁️_CloudCLI_Cloud-Try_Now-0066FF?style=for-the-badge" alt="CloudCLI Cloud"></a>
  <a href="https://discord.gg/buxwujPNRE"><img src="https://img.shields.io/badge/Discord-Join%20Community-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord 참여"></a>
  <br><br>
  <a href="https://trendshift.io/repositories/15586" target="_blank"><img src="https://trendshift.io/api/badge/repositories/15586" alt="siteboon%2Fclaudecodeui | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>
</p>

<div align="right"><i><a href="./README.md">English</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.de.md">Deutsch</a> · <b>한국어</b> · <a href="./README.zh-CN.md">中文</a> · <a href="./README.ja.md">日本語</a></i></div>

---

## 스크린샷

<div align="center">

<table>
<tr>
<td align="center">
<h3>데스크톱 화면</h3>
<img src="public/screenshots/desktop-main.png" alt="데스크톱 인터페이스" width="400">
<br>
<em>Claude Code 스타일 테마 메인 인터페이스</em>
</td>
<td align="center">
<h3>모바일 환경</h3>
<img src="public/screenshots/mobile-chat.png" alt="모바일 인터페이스" width="250">
<br>
<em>터치 내비게이션을 갖춘 반응형 모바일 디자인</em>
</td>
</tr>
<tr>
<td align="center" colspan="2">
<h3>CLI 선택</h3>
<img src="public/screenshots/cli-selection.png" alt="CLI 선택" width="400">
<br>
<em>Claude Code, Gemini, Cursor CLI, Codex 중 선택</em>
</td>
</tr>
</table>

</div>

## 기능

- **반응형 디자인** - 데스크톱, 태블릿, 모바일에서 원활하게 작동하여 언제 어디서나 Agents 사용 가능
- **Claude Code 스타일 테마** - Claude Code CLI 미학에서 영감을 받은 아름다운 앰버 톤 디자인
- **인터랙티브 채팅 인터페이스** - Agents와 원활한 소통을 위한 내장 채팅 UI
- **통합 셸 터미널** - 내장 셸 기능을 통해 Agents CLI에 직접 접근
- **파일 탐색기** - 구문 강조 및 실시간 편집이 가능한 인터랙티브 파일 트리
- **Git 탐색기** - 변경 사항을 확인하고, 스테이지하고, 커밋할 수 있습니다. 브랜치 전환도 가능
- **유연한 워크스페이스 선택** - 제한 없이 모든 드라이브나 디렉토리에서 워크스페이스 선택 가능
- **세션 관리** - 대화 재개, 여러 세션 관리, 기록 추적
- **플러그인 시스템** - 커스텀 플러그인으로 CloudCLI 확장 — 새 탭, 백엔드 서비스, 통합 추가. [직접 만들기 →](https://github.com/cloudcli-ai/cloudcli-plugin-starter)
- **TaskMaster AI 통합** *(선택)* - AI 기반 작업 계획, PRD 파싱, 워크플로우 자동화로 고급 프로젝트 관리
- **모델 호환성** - Claude, GPT, Gemini 모델 패밀리 지원 (전체 지원 목록은 [`shared/modelConstants.js`](shared/modelConstants.js) 참조)

## 빠른 시작

### CloudCLI Cloud (권장)

로컬 설정 없이 가장 빠르게 시작하는 방법. 웹, 모바일 앱, API, 또는 좋아하는 IDE에서 접근 가능한 완전 관리형 컨테이너화 개발 환경.

**[CloudCLI Cloud 시작하기](https://cloudcli.ai)**

### 셀프 호스팅 (오픈 소스)

**npx**로 즉시 CloudCLI UI 실행 (Node.js v22+ 필요):

```
npx @siteboon/claude-code-ui
```

또는 정기 사용을 위해 **글로벌 설치**:

```
npm install -g @siteboon/claude-code-ui
cloudcli
```

`http://localhost:3001` 열기 — 모든 기존 세션이 자동으로 발견됩니다.

더 많은 구성 옵션, PM2, 원격 서버 설정 등은 **[문서 →](https://cloudcli.ai/docs)** 참조

---

## 어떤 옵션이 적합한가요?

CloudCLI UI는 CloudCLI Cloud를 구동하는 오픈 소스 UI 레이어입니다. 자체 머신에서 셀프 호스팅하거나, 완전 관리형 클라우드 환경, 팀 기능, 더 깊은 통합을 제공하는 CloudCLI Cloud를 사용할 수 있습니다.

| | CloudCLI UI (셀프 호스팅) | CloudCLI Cloud |
|---|---|---|
| **적합 대상** | 자체 머신에서 로컬 에이전트 세션을 위한 완전한 UI를 원하는 개발자 | 클라우드에서 실행되는 에이전트를 어디서나 접근하고 싶은 팀과 개발자 |
| **접속 방법** | `[yourip]:port`로 브라우저에서 접속 | 브라우저, 모든 IDE, REST API, n8n |
| **설정** | `npx @siteboon/claude-code-ui` | 설정 불필요 |
| **머신 켜져 있어야 함** | 예 | 아니오 |
| **모바일 접속** | 네트워크상 모든 브라우저 | 모든 기기, 네이티브 앱 출시 예정 |
| **사용 가능 세션** | `~/.claude`에서 모든 세션 자동 발견 | 클라우드 환경 내 모든 세션 |
| **지원 Agents** | Claude Code, Cursor CLI, Codex, Gemini CLI | Claude Code, Cursor CLI, Codex, Gemini CLI |
| **파일 탐색기 및 Git** | UI에 내장 | UI에 내장 |
| **MCP 구성** | UI로 관리, 로컬 `~/.claude` config와 동기화 | UI로 관리 |
| **IDE 접속** | 로컬 IDE | 클라우드 환경에 연결된 모든 IDE |
| **REST API** | 예 | 예 |
| **n8n 노드** | 아니오 | 예 |
| **팀 공유** | 아니오 | 예 |
| **플랫폼 비용** | 무료, 오픈 소스 | $7/월부터 |

> 두 옵션 모두 자신의 AI 구독(Claude, Cursor 등)을 사용합니다 — CloudCLI는 환경을 제공하며, AI가 아닙니다.

---

## 보안 및 도구 구성

**🔒 중요 공지**: 모든 Claude Code 도구는 기본적으로 **비활성화**되어 있습니다. 이는 잠재적으로 유해한 작업이 자동으로 실행되는 것을 방지합니다.

### 도구 활성화

Claude Code의 전체 기능을 사용하려면 도구를 수동으로 활성화해야 합니다:

1. **도구 설정 열기** - 사이드바의 기어 아이콘 클릭
2. **선택적 활성화** - 필요한 도구만 켜기
3. **설정 적용** - 환경설정은 로컬에 저장됩니다

<div align="center">

![도구 설정 모달](public/screenshots/tools-modal.png)
*도구 설정 인터페이스 - 필요한 것만 활성화*

</div>

**권장 방식**: 기본 도구부터 활성화하고 필요에 따라 추가하세요. 언제든지 조정할 수 있습니다.

---

## 플러그인

CloudCLI에는 커스텀 프론트엔드 UI와 선택적 Node.js 백엔드가 있는 탭을 추가할 수 있는 플러그인 시스템이 있습니다. **Settings > Plugins**에서 git 저장소에서 직접 플러그인을 설치하거나 직접 만드세요.

### 사용 가능한 플러그인

| 플러그인 | 설명 |
|---|---|
| **[Project Stats](https://github.com/cloudcli-ai/cloudcli-plugin-starter)** | 현재 프로젝트의 파일 수, 코드 라인 수, 파일 타입 분포, 가장 큰 파일, 최근 수정된 파일 표시 |
| **[Web Terminal](https://github.com/cloudcli-ai/cloudcli-plugin-terminal)** | 멀티탭 지원을 갖춘 완전한 xterm.js 터미널 |

### 직접 만들기

**[플러그인 스타터 템플릿 →](https://github.com/cloudcli-ai/cloudcli-plugin-starter)** — 이 저장소를 포크하여 자신만의 플러그인 생성. 프론트엔드 렌더링, 라이브 컨텍스트 업데이트, 백엔드 서버와의 RPC 통신 예제 포함.

**[플러그인 문서 →](https://cloudcli.ai/docs/plugin-overview)** — 플러그인 API, 매니페스트 형식, 보안 모델 등에 대한 전체 가이드.

---
## FAQ

<details>
<summary>Claude Code Remote Control과 어떻게 다른가요?</summary>

Claude Code Remote Control을 사용하면 로컬 터미널에서 이미 실행 중인 세션에 메시지를 보낼 수 있습니다. 머신이 켜져 있어야 하고, 터미널이 열려 있어야 하며, 네트워크 연결 없이 약 10분 후 세션이 시간 초과됩니다.

CloudCLI UI와 CloudCLI Cloud는 Claude Code 옆에 있는 것이 아니라 Claude Code를 확장합니다 — MCP 서버, 권한, 설정, 세션은 Claude Code가 기본적으로 사용하는 것과 정확히 동일합니다. 아무것도 복제되거나 별도로 관리되지 않습니다.

실제로 이것이 의미하는 바:

- **모든 세션, 하나뿐만 아니라** — CloudCLI UI는 `~/.claude` 폴더에서 모든 세션을 자동으로 발견합니다. Remote Control은 Claude 모바일 앱에서 사용할 수 있도록 단일 활성 세션만 노출합니다.
- **설정은 설정입니다** — CloudCLI UI에서 변경한 MCP 서버, 도구 권한, 프로젝트 구성은 Claude Code 구성에 직접 작성되어 즉시 적용되며, 그 반대도 마찬가지입니다.
- **더 많은 에이전트 지원** — Claude Code뿐만 아니라 Cursor CLI, Codex, Gemini CLI.
- **완전한 UI, 채팅 창만이 아닌** — 파일 탐색기, Git 통합, MCP 관리, 셸 터미널이 모두 내장되어 있습니다.
- **CloudCLI Cloud는 클라우드에서 실행** — 노트북을 닫아도 에이전트가 계속 실행됩니다. 관리할 터미널도, 켜져 있어야 할 머신도 없습니다.

</details>

<details>
<summary>AI 구독을 별도로 결제해야 하나요?</summary>

네. CloudCLI는 환경을 제공하며, AI가 아닙니다. 자신의 Claude, Cursor, Codex 또는 Gemini 구독을 가져오세요. CloudCLI Cloud는 그 위에 월 $7부터 호스팅 환경을 제공합니다.

</details>

<details>
<summary>휴대폰에서 CloudCLI UI를 사용할 수 있나요?</summary>

네. 셀프 호스팅의 경우, 머신에서 서버를 실행하고 네트워크의 모든 브라우저에서 `[yourip]:port`를 엽니다. CloudCLI Cloud의 경우, 어떤 기기에서도 열 수 있습니다 — VPN 없음, 포트 포워딩 없음, 설정 없음. 네이티브 앱도 개발 중입니다.

</details>

<details>
<summary>UI에서 변경한 사항이 로컬 Claude Code 설정에 영향을 주나요?</summary>

네, 셀프 호스팅의 경우. CloudCLI UI는 Claude Code가 기본적으로 사용하는 것과 동일한 `~/.claude` 구성에서 읽고 씁니다. UI를 통해 추가한 MCP 서버는 Claude Code에 즉시 표시되며 그 반대도 마찬가지입니다.

</details>

---

## 커뮤니티 및 지원

- **[문서](https://cloudcli.ai/docs)** — 설치, 구성, 기능, 문제 해결
- **[Discord](https://discord.gg/buxwujPNRE)** — 도움을 받고 다른 사용자와 소통
- **[GitHub Issues](https://github.com/siteboon/claudecodeui/issues)** — 버그 리포트 및 기능 요청
- **[기여 가이드](CONTRIBUTING.md)** — 프로젝트에 기여하는 방법

## 라이선스

GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later) — 전체 텍스트는 [LICENSE](LICENSE)를 참조하세요.

이 프로젝트는 AGPL-3.0-or-later 라이선스에 따라 자유롭게 사용, 수정, 배포할 수 있는 오픈 소스입니다. 이 소프트웨어를 수정하여 네트워크 서비스로 실행하는 경우, 해당 서비스 사용자에게 수정된 소스 코드를 제공해야 합니다.

## 감사의 말

### 구축에 사용된 기술
- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** - Anthropic의 공식 CLI
- **[Cursor CLI](https://docs.cursor.com/en/cli/overview)** - Cursor의 공식 CLI
- **[Codex](https://developers.openai.com/codex)** - OpenAI Codex
- **[Gemini-CLI](https://geminicli.com/)** - Google Gemini CLI
- **[React](https://react.dev/)** - 사용자 인터페이스 라이브러리
- **[Vite](https://vitejs.dev/)** - 빠른 빌드 도구 및 개발 서버
- **[Tailwind CSS](https://tailwindcss.com/)** - 유틸리티 퍼스트 CSS 프레임워크
- **[CodeMirror](https://codemirror.net/)** - 고급 코드 에디터
- **[TaskMaster AI](https://github.com/eyaltoledano/claude-task-master)** *(선택)* - AI 기반 프로젝트 관리 및 작업 계획


### 스폰서
- [Siteboon - AI powered website builder](https://siteboon.ai)
---

<div align="center">
  <strong>Claude Code, Cursor, Codex 커뮤니티를 위해 정성껏 제작.</strong>
</div>
