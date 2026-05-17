# Authorization Matrix

Direct transcription of spec §6.8. The matrix is enforced by
`lib/auth/authorize.ts:can()`; every server-side mutation calls
`requireRole()`.

## Roles

- `viewer` — read-only access. Phase 1 default for invited testers
  before they're upgraded.
- `analyst` — the GPS team's day-to-day role.
- `admin` — Rockie and any designated co-administrator.

## Matrix

| Role | Resource | Action | Scope |
| --- | --- | --- | --- |
| viewer | issues | read | all |
| analyst | issues | read | all |
| analyst | issues | update_status | all |
| analyst | issues | comment | all |
| analyst | issues | hitl_correct | all |
| analyst | issues | reassign | self_owned |
| analyst | correlation_suggestions | decide_correlation | all |
| admin | issues | all | all |
| admin | sources | manage | all |
| admin | prompts | manage | all |
| admin | users | manage | all |
| admin | correlation_suggestions | decide_correlation | all |

## Implementation rules

1. Add a row to `AUTHZ_MATRIX` (`lib/auth/authorize.ts`); don't branch
   in callers.
2. Server actions must call `requireRole()` **before** any database
   mutation, not after. If `requireRole()` throws, no side effect has
   occurred.
3. The `self_owned` scope reads `ownerId` from the action input. If
   you forget to pass it, `can()` returns false — fail closed.
4. Phase 1 runs everyone as `admin` (spec §6.8). Phase 2 starts the
   real distinction.
