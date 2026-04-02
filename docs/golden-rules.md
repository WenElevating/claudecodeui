# Golden Rules

> These rules are mechanically enforced where possible. Violations trigger lint errors or pre-commit failures. Where not yet mechanically enforced, treat them as inviolable constraints.

## Architecture

- **Forward-only dependency flow**: `shared/` ← `server/` ← API routes. `src/` never imports from `server/`. `server/` never imports from `src/`.
- **No circular imports between modules**: If A imports B, B must not import A. Use dependency inversion (shared interfaces) to break cycles.
- **Provider registry pattern**: All provider lookups go through `server/providers/registry.js`. Never import a provider adapter directly.
- **ESM module system**: All imports use `.js` extensions on the server. The project uses `"type": "module"`.

## Code Structure

- **Files under 800 lines**: If a file exceeds 800 lines, extract utilities or sub-modules. Current exceptions are tracked in the [entropy baseline](entropy-baseline.md).
- **Functions under 50 lines**: Extract helper functions when logic exceeds 50 lines.
- **No deep nesting**: Maximum 4 levels of indentation. Extract early returns or helper functions.
- **Immutable data patterns**: Create new objects with spread syntax, never mutate existing state. Especially critical in React state updates.

## Frontend Rules

- **React Context for global state**: Auth, WebSocket, Plugins, Theme — use existing contexts. Do not create new contexts without justification.
- **Feature-based component organization**: New components go in `src/components/<feature>/`. Each feature directory may contain `hooks/`, `view/`, and co-located types.
- **Tailwind utility classes only**: No CSS modules, no inline styles for layout. Use CSS variables for theme colors defined in `tailwind.config.js`.
- **TypeScript strict**: Frontend code is TypeScript. Use named interfaces for component props. Avoid `any` — use `unknown` and narrow.

## Backend Rules

- **JavaScript with JSDoc**: Server code uses plain `.js` with JSDoc type annotations. Do not convert to TypeScript.
- **Express route files**: One file per route domain in `server/routes/`. Route handlers delegate to services/utilities, not inline logic.
- **SQLite parameterized queries**: All database queries use parameterized statements. Never concatenate user input into SQL.
- **JWT auth middleware**: Protected routes use auth middleware from `server/middleware/`. Never roll your own auth check.

## Internationalization

- **No hardcoded user-facing strings**: All UI text must use i18n keys. Add keys to all 6 locale files: en, ko, zh-CN, ja, ru, de.
- **Namespace organization**: Use appropriate namespaces (common, chat, auth, etc.) for translation keys.

## Commit Discipline

- **Conventional commits**: `<type>(scope): <description>` enforced by commitlint.
- **One feature per PR**: Keep PRs focused. Avoid unrelated changes.
