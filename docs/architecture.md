# Architecture

This is the ten-thousand-foot view. For decisions and tradeoffs see
the ADRs in `/docs/adr/`; for the full requirement context see
`/spec/v0.4.md` in the parent directory.

## Layers

```
Sources ──► Queue ──► Inference ──► Correlation ──► Storage ──► Management ──► Delivery
```

Each arrow is a process boundary or a status transition, not a network
hop. The whole system runs as one Next.js deployment plus a Postgres.

### 1. Sources (`lib/sources/`)

`SourceConnector` interface (`types.ts`). Concrete connectors for
NewsAPI, Google News RSS, ACLED. Registry assembles enabled ones based
on env. Each connector implements `parseStatus()` for the degraded-mode
policy.

### 2. Queue (`prisma/schema.prisma` → `ingest_queue`, `lib/queue/queue.ts`)

Postgres table. Statuses: `pending → processing → done | failed | suspicious`.
Inference workers claim with `FOR UPDATE SKIP LOCKED` (ADR-003).

### 3. Inference (`lib/llm/gateway.ts`)

`runTriageInference()`. Single Anthropic-SDK entry point. Loads
system prompt + rubric from disk, wraps article in `<external_article>`,
forces a `store_judgment` tool call, validates against `TriageResultSchema`,
returns a discriminated union.

### 4. Correlation (`lib/correlation/fingerprint.ts`)

Right after a new Issue is inserted, fingerprint heuristic looks for
geo + actor overlap within ±3 day window across existing Issues.
Writes suggestions to `correlation_suggestions`. **Never auto-merges.**

### 5. Storage (`prisma/schema.prisma`)

`issues`, `issue_history`, `correlation_suggestions`, `system_metrics`,
`cost_log`, `system_flags`, `source_state`, `source_health_snapshots`,
NextAuth tables. Postgres only.

### 6. Management (`app/(app)/issues/...`)

Issue list, detail, HITL correction, status workflow. Server Actions
in `app/(app)/issues/actions.ts` enforce authz via `requireRole()`.

### 7. Delivery

Phase 1: email alerts via Resend on high-urgency issues (`urgencyScore ≥ 4`).
Phase 2: Teams or LINE channel. Weekly digest is a Phase 2 deliverable.

## Cross-cutting concerns

- **Observability** (`lib/observability/metrics.ts`) — writes to
  `system_metrics`. Four indicators only (§6.9).
- **Cost / budget** (`lib/cost/budget.ts`) — daily circuit-breaker
  (§9.2). Flips `system_flags.ingestion_paused`.
- **Authorization** (`lib/auth/authorize.ts`) — application-layer
  matrix (§6.8, ADR-002).
- **Prompt-injection** — five policies (§14.3, `docs/prompt-injection-policy.md`).

## Deployment

Phase 1-2: Vercel + Supabase or Neon + Anthropic API.
Phase 3: TSMC-internal Postgres + LLM provider chosen by TSMC IT.
The Phase 3 cutover changes two files: `lib/llm/gateway.ts`
(provider) and `lib/auth/auth.ts` (SSO).

## Cron schedule

| Cron | Schedule | Purpose |
| --- | --- | --- |
| `/api/cron/ingest` | hourly | Pull from sources, enqueue |
| `/api/cron/infer` | every 5 min | Drain queue via SKIP LOCKED |
| `/api/cron/budget-check` | daily 09:00 | Evaluate yesterday's spend |
