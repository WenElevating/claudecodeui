# src/components/

> Feature-organized React UI components. Each subdirectory is a self-contained feature domain.

## What Belongs Here

- React components organized by feature domain
- Each feature may contain: `hooks/`, `view/`, co-located types
- Component files use PascalCase names (e.g., `ChatPanel.tsx`)
- Hook files use camelCase with `use` prefix (e.g., `useChatState.ts`)

## What Does NOT Belong Here

- Shared utilities → `src/utils/`
- Type definitions → `src/types/`
- Global state → `src/contexts/`
- Non-React code → `src/lib/`

## Key Feature Directories

| Directory | Purpose |
|-----------|---------|
| `chat/` | Chat interface, messages, tool configs |
| `code-editor/` | CodeMirror editor wrapper |
| `file-tree/` | File explorer with syntax highlighting |
| `git-panel/` | Git integration UI |
| `sidebar/` | Navigation sidebar |
| `settings/` | App settings UI |
| `auth/` | Authentication forms |
| `plugins/` | Plugin system UI |
| `shell/` | Terminal integration |

## Rules

- Components use TypeScript (`.tsx`)
- Props defined with named `interface`
- Tailwind CSS only — no CSS modules or inline layout styles
- Extract hooks from components when state logic is complex
