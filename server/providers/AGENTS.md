# server/providers/

> AI provider adapters with registry pattern. All provider lookups go through `registry.js`.

## What Belongs Here

- Provider adapter implementations (one directory per provider)
- The provider registry (`registry.js`)
- Shared provider types (`types.js`) and utilities (`utils.js`)

## Provider Adapter Structure

Each provider directory must contain an `adapter.js` that implements `ProviderAdapter` from `types.js`:

```
server/providers/
  registry.js    → Central lookup (use getProvider())
  types.js       → ProviderAdapter interface (JSDoc)
  utils.js       → Shared provider utilities
  claude/
    adapter.js   → Claude adapter implementation
  cursor/
    adapter.js   → Cursor adapter implementation
  codex/
    adapter.js   → Codex adapter implementation
  gemini/
    adapter.js   → Gemini adapter implementation
```

## Rules

- **Always import via registry**: `import { getProvider } from './providers/registry.js'`
- **Never import adapters directly**: The structural test will catch this
- **New providers**: Create adapter, then register in `registry.js`
- **Server code is JavaScript with JSDoc**: Do not convert to TypeScript
