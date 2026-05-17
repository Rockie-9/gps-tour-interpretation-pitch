# ADR-002: NextAuth + application-layer authz; no Supabase Auth or RLS

- Status: accepted (retrospective per spec v0.4 §8 Phase 0)
- Date: 2026-05-17
- Spec ref: §6.4, §6.5, §6.8

## Context

We host Phase 1-2 on Supabase Postgres. The platform offers Supabase Auth + Row Level Security (RLS) for free; using them would seemingly save work. The cost is twofold:

1. Phase 3 moves to TSMC-internal Postgres which won't have Supabase Auth — a hard rip-out at the worst time.
2. RLS expresses authz inside SQL policies; the language is different from our application code and harder to audit during the TSMC security review (§10).

The spec's §6.4 table explicitly disables every Supabase-specific feature.

## Decision

- Auth: **NextAuth (Auth.js v5)** with the Prisma adapter. Phase 1 = email magic link (Resend). Phase 3 = TSMC SSO provider drop-in.
- Authz: **application-layer matrix** (`lib/auth/authorize.ts`) implementing §6.8 verbatim. Every Server Action calls `requireRole()` before mutation.
- Supabase usage scope: Postgres connection string only. No `@supabase/supabase-js` SDK in the codebase.

## Consequences

### Good
- Phase 3 cutover is one PR: swap provider list, point at SSO.
- Authz logic is in TypeScript, version-controlled, reviewable in PRs, and uniform across HTTP handlers and Server Actions.
- TSMC security review (§10) sees one authz story, not two.

### Bad / tradeoffs
- RLS would give defense-in-depth — if app code forgets to authz, RLS still blocks. With application-layer only, an omission is a real bug.
- Mitigation: §6.8 matrix is small enough to memorize; PRs adding new mutations are reviewed against the matrix.

### Neutral
- Initial dev velocity is slightly slower than `@supabase/supabase-js` magic.

## Alternatives considered

### A. Supabase Auth + RLS
Faster start. Rejected per §6.4 — Phase 3 forcing function dominates.

### B. NextAuth + RLS as belt-and-suspenders
Considered. Rejected for Phase 1-2 — RLS adds review surface area we don't need yet. Can be revisited in Phase 3 if TSMC IT prefers it.

## How to revisit

If TSMC IT review requires RLS as defense-in-depth, layer it on top — don't replace the application-layer matrix. The matrix is the source of truth.
