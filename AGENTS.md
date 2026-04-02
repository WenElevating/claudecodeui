# CloudCLI UI

> Web-based UI for Claude Code CLI, Cursor CLI, OpenAI Codex, and Gemini CLI.

## Quick Start

| Action | Command |
|--------|---------|
| Install | `npm install` |
| Dev | `npm run dev` (Vite :5173 + Express :3001) |
| Build | `npm run build` |
| Lint | `npm run lint` / `npm run lint:fix` |
| Type Check | `npm run typecheck` |
| Start | `npm run start` (build + server) |

**Prerequisites**: Node.js 22+. No test framework configured.

## Architecture

| Directory | Purpose | Details |
|-----------|---------|---------|
| `src/components/` | Feature-organized React components | [src/components/AGENTS.md](src/components/AGENTS.md) |
| `src/contexts/` | React Context providers (auth, websocket, plugins, theme) | |
| `src/i18n/` | react-i18next; locales: en, ko, zh-CN, ja, ru, de | |
| `src/types/` | Shared TypeScript definitions | |
| `src/hooks/` | Custom React hooks | |
| `src/utils/` | Frontend utilities | |
| `server/providers/` | AI provider adapters (registry pattern) | [server/providers/AGENTS.md](server/providers/AGENTS.md) |
| `server/routes/` | Express REST endpoints | |
| `server/database/` | SQLite via better-sqlite3 | |
| `server/middleware/` | Auth and validation middleware | |
| `shared/` | Constants shared between client and server | |

## Key Patterns

- **Provider Registry**: `server/providers/registry.js` — all provider lookups via `getProvider()`
- **WebSocket**: `src/contexts/WebSocketContext.tsx` — real-time message streaming with reconnect
- **ESM throughout**: `"type": "module"`, server uses `.js` extension in imports
- **Frontend TS, Backend JS**: TypeScript on client, JSDoc-typed JavaScript on server
- **Tailwind + CSS vars**: theming via CSS variables, dark mode via class strategy

## Constraints

These are mechanically enforced. Violations = lint/pre-commit errors.

- [Golden Rules](docs/golden-rules.md) — inviolable project patterns
- [Architecture Constraints](docs/constraints.md) — dependency flow, module boundaries
- ESLint config: `eslint.config.js` (React hooks, unused imports, import order, Tailwind classnames)
- Pre-commit: lint-staged + commitlint (conventional commits)

## Agent Guidelines

- [CLAUDE.md](CLAUDE.md) — full project context for Claude Code
- [CONTRIBUTING.md](CONTRIBUTING.md) — commit conventions, PR process
- [Entropy Baseline](docs/entropy-baseline.md) — codebase health metrics
