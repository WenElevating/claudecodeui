# Entropy Baseline

Generated: 2026-04-02

## Metrics

| Metric | Value |
|--------|-------|
| Total source files | 377 (330 frontend, 45 backend, 2 shared) |
| Total source lines | 63,347 |
| Average file length | ~168 lines |
| Files > 800 lines | 8 |
| Files > 500 lines | 20 |
| Structural test failures | 12 |
| Test framework | None configured |
| Test coverage | 0% |

## Files Exceeding 800-Line Limit

| File | Lines | Priority | Notes |
|------|-------|----------|-------|
| `server/projects.js` | 2562 | HIGH | Core project management — needs module extraction |
| `server/index.js` | 2554 | HIGH | Main server entry — needs route/service extraction |
| `server/routes/taskmaster.js` | 1964 | MEDIUM | TaskMaster route — extract service layer |
| `server/routes/git.js` | 1489 | MEDIUM | Git route — extract service layer |
| `server/routes/agent.js` | 1246 | MEDIUM | Agent route — extract service layer |
| `src/components/chat/hooks/useChatComposerState.ts` | 1008 | LOW | Chat composer hook — complex state logic |
| `src/components/settings/hooks/useSettingsController.ts` | 952 | LOW | Settings controller hook |
| `server/claude-sdk.js` | 835 | LOW | Claude SDK wrapper — barely over limit |

## Direct Provider Imports (should use registry)

| File | Provider |
|------|----------|
| `server/claude-sdk.js` | claude |
| `server/cursor-cli.js` | cursor |
| `server/gemini-response-handler.js` | gemini |
| `server/openai-codex.js` | codex |

These are legacy files that coexist alongside the newer provider registry. Migration tracked as MEDIUM priority.

## Watch List

Files approaching limits or with growing complexity:

- `src/components/chat/hooks/useChatSessionState.ts` (750 lines)
- `src/components/git-panel/hooks/useGitPanelController.ts` (749 lines)
- `src/components/settings/view/tabs/agents-settings/sections/content/PermissionsContent.tsx` (702 lines)
- `src/components/sidebar/hooks/useSidebarController.ts` (645 lines)
- `src/components/chat/tools/configs/toolConfigs.ts` (606 lines)

## Remediation Priority

### Priority 1 (HIGH)
- [ ] Extract modules from `server/projects.js` (2562 lines)
- [ ] Extract modules from `server/index.js` (2554 lines)

### Priority 2 (MEDIUM)
- [ ] Extract service layer from `server/routes/taskmaster.js`
- [ ] Extract service layer from `server/routes/git.js`
- [ ] Extract service layer from `server/routes/agent.js`
- [ ] Migrate direct provider imports to registry pattern

### Priority 3 (LOW)
- [ ] Refactor `useChatComposerState.ts` into smaller hooks
- [ ] Refactor `useSettingsController.ts` into smaller hooks
- [ ] Trim `server/claude-sdk.js` under 800 lines
