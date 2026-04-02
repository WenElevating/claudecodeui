# Architecture Constraints

> These constraints are mechanically enforced by `npm run test:structure`.
> Run `node tests/structure/architecture.test.js` to verify.

## Enforced by Structural Tests

| Constraint | Check | Fix |
|-----------|-------|-----|
| src/ must not import server/ | Scan all frontend imports | Move shared code to `shared/` |
| server/ must not import src/ | Scan all backend imports | Move shared code to `shared/` |
| Files must not exceed 800 lines | Count lines in all source files | Extract sub-modules or utilities |
| Provider imports via registry only | Check for direct adapter imports | Use `getProvider()` from `registry.js` |
| No hardcoded secrets | Pattern match for API key formats | Use environment variables |

## Enforced by ESLint

| Constraint | Rule |
|-----------|------|
| React hooks rules | `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps` |
| No unused imports | `unused-imports/no-unused-imports` |
| Import ordering | `import-x/order` (builtin → external → internal → relative) |
| Tailwind class ordering | `tailwindcss/classnames-order` |
| No contradictory Tailwind classes | `tailwindcss/no-contradicting-classname` |

## Enforced by Pre-Commit Hooks

| Constraint | Tool |
|-----------|------|
| Lint-staged files pass | lint-staged via Husky |
| Conventional commit messages | commitlint via Husky |

## Known Violations (tracked in entropy baseline)

Files exceeding 800-line limit — see [entropy-baseline.md](entropy-baseline.md) for the full list and remediation priority.
