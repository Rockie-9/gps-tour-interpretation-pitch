# CLAUDE.md

Guidance for AI coding assistants working in this repository. Read this **before** editing. It complements `README.md` (developer onboarding) and `spec/v0.4.md` (full specification) — it does not replace either.

## What this repo is

**GPS Issue & Management Center** — OSINT-driven issue detection and case management for the TSMC GPS team. Spec **v0.4**, currently in **Phase 0** scaffold. Public-source articles are ingested on a cron, run through a 4-dimension structured triage with Claude, surfaced as **Issues**, and managed through a human-in-the-loop (HITL) workflow. Five categories: `geopolitical`, `physical_security`, `supply_chain`, `regulatory`, `hostile_narrative`.

This is a **spec-first** codebase. Nontrivial decisions cite a section of `spec/v0.4.md` and an ADR. Match that style — cite, don't invent.

## Architecture in one paragraph

Two independent crons. **Ingestion** (hourly) fetches articles from configured sources into Postgres `ingest_queue` as `pending`. **Inference** (every 5 min) claims rows with `FOR UPDATE SKIP LOCKED`, calls `runTriageInference()` (the single Anthropic-SDK entry point in `lib/llm/gateway.ts`), and writes Issues + audit history. A daily **budget cron** sums yesterday's token cost; if it exceeds 1.5× the daily cap, it flips the `ingestion_paused` system flag and emails the on-call.

```
Sources ─► ingest_queue ─► [SKIP LOCKED] ─► runTriageInference ─► issues
                                                ▼
                                           cost_log + correlations
```

## Hard rules (do not violate without an ADR)

1. **Anthropic SDK is imported in `lib/llm/gateway.ts` and nowhere else.** Spec §6.3 + ADR-004. The gateway is intentionally 30–60 lines — do not grow it into a framework.
2. **Inference claims rows with `FOR UPDATE SKIP LOCKED`** via raw SQL in `lib/queue/queue.ts`. ADR-003. Do not replace with a Prisma-only equivalent — Prisma cannot express SKIP LOCKED.
3. **HITL correction `reason` is mandatory.** Spec §7. Never make `reason` optional or auto-fill it.
4. **Auto-merge of Issues is forbidden.** §6.7. `lib/correlation/fingerprint.ts` suggests; HITL decides.
5. **Architectural changes require a new ADR before the PR lands.** §14.5.2. ADRs live in `docs/adr/` — copy `template.md` and increment the number.
6. **`LLM_MODEL_ID` is a pinned dated identifier** (e.g. `claude-sonnet-4-20250514`). Never `-latest`. ADR-007. Bumping requires an ADR + eval regression.
7. **Suspicious-flagged inferences (§14.3.5) never auto-promote to Issues.** They go to a HITL review queue. See `docs/prompt-injection-policy.md`.
8. **Bumping `prompts/system.md` or `prompts/rubric.md` requires re-running the eval** and noting the result in the PR. `prompts/CHANGELOG.md` tracks versions.

## Where things live

| Path | What it is |
| --- | --- |
| `app/api/cron/ingest/` | Hourly ingestion cron. Iterates enabled source connectors. |
| `app/api/cron/infer/` | 5-min inference cron. SKIP LOCKED claim → gateway → Issues. |
| `app/api/cron/budget-check/` | Daily budget cron. Trips `ingestion_paused` flag. |
| `app/(app)/issues/` | Issue list, detail, HITL correction pages + server actions. |
| `app/(app)/dashboard/` | The four §6.9 metrics. Don't add more without an ADR. |
| `app/(app)/sources/` | Per-source health + paused status. |
| `app/(app)/health/` | Queue counts + system flags. |
| `lib/llm/gateway.ts` | **Sole** Anthropic SDK import. `runTriageInference()`. |
| `lib/llm/schema.ts` | `TriageResult` Zod schema + `store_judgment` tool definition. |
| `lib/queue/queue.ts` | `claimPending()` with raw `FOR UPDATE SKIP LOCKED`. |
| `lib/sources/types.ts` | `SourceConnector` interface. All connectors implement it. |
| `lib/sources/*.ts` | NewsAPI, Google News RSS, ACLED connectors. |
| `lib/correlation/fingerprint.ts` | §6.7 geo + actor + window heuristic. Never auto-merges. |
| `lib/auth/authorize.ts` | §6.8 RBAC matrix. `requireRole()` is the single gate. |
| `lib/cost/budget.ts` | §9.2 daily circuit-breaker; token-cost estimation. |
| `lib/observability/` | Parse-failure rate, queue backlog, fingerprint hit-rate metrics. |
| `lib/db/` | Prisma client singleton. |
| `prisma/schema.prisma` | All persistent state. Single source of truth for the data model. |
| `prompts/system.md`, `prompts/rubric.md` | Versioned prompts. Bump → PR + eval regression. |
| `eval/run-eval.ts` | Phase 0 ground-truth harness. ≥80% gate per §8. |
| `docs/adr/` | ADR-001..ADR-007 + `template.md`. New decision = new ADR. |
| `docs/runbook.md` | What to do when things break (LLM down, queue stuck, etc.). |
| `docs/architecture.md`, `docs/slo.md`, `docs/observability.md` | System docs. |
| `docs/data-retention.md`, `docs/prompt-injection-policy.md`, `docs/authorization-matrix.md` | Policy docs (§14.2, §14.3, §6.8). |
| `spec/v0.4.md` | Full spec. Cite section numbers when changing behavior. |

## Common commands

```bash
npm install
cp .env.example .env.local       # fill DATABASE_URL, DIRECT_URL, ANTHROPIC_API_KEY, CRON_SECRET
npx prisma migrate dev --name init
npm run eval                      # run BEFORE any code change (Phase 0 gate)
npm run dev                       # http://localhost:3000

npm run lint                      # next lint
npm run typecheck                 # tsc --noEmit
npm run db:generate               # prisma generate
npm run db:migrate                # prisma migrate dev
npm run db:deploy                 # prisma migrate deploy (production)
npm run db:studio                 # Prisma Studio GUI (use during incidents)
npm run eval:report               # eval with full report output
```

Vercel Cron is not running locally — trigger handlers manually:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/ingest
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/infer
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/budget-check
```

## Tech stack

- **Next.js 14.2** App Router (TypeScript, React 18).
- **Postgres 14+** via **Prisma 5.22** (`prisma/schema.prisma` is the source of truth).
- **NextAuth v5 beta** (`@auth/prisma-adapter`); session strategy `database`.
- **Anthropic SDK 0.30** — gated to `lib/llm/gateway.ts` only.
- **Zod 3.23** for input validation and the `TriageResult` schema.
- **rss-parser** for RSS sources; **Resend** for budget-alert emails.
- **tsx** for the eval harness. Node 20+.
- No test framework configured (Phase 0 — the eval harness is the regression gate).

## Conventions

- TypeScript `strict` + `noUncheckedIndexedAccess`. Imports use the `@/*` path alias (e.g. `@/lib/llm/gateway`).
- **Prisma everywhere** except `lib/queue/queue.ts` (raw SQL for SKIP LOCKED).
- Mutations are **server actions** (`"use server"`). After a HITL correction, call `revalidatePath()`.
- Errors use the result pattern: `{ ok: true, result }` or `{ ok: false, reason, message }`. Failed inferences classify the reason (`parse_failure`, `schema_violation`, `api_error`, `timeout`, `suspicious_content_rejected`) — that classification feeds the `inference_parse_failure_rate` metric.
- Comments are sparse and pragmatic. When non-obvious, cite the spec/ADR inline: `// SPEC §6.3`, `// ADR-004`.
- DB columns are snake_case (`source_url`), TS fields are camelCase (`sourceUrl`). Don't add bridging helpers — Prisma maps these.
- No `/components` directory; UI is kept inline in pages. Resist refactoring this without an ADR — the spec values minimal scaffolding in Phase 0.
- Env vars are read at runtime, never baked in at build time.

## What is intentionally missing

Don't "helpfully" add these without asking — they are deliberate Phase 0 omissions:

- **No unit or integration tests, no Jest/Vitest config.** The eval harness is the regression gate; add tests only when the spec mandates them.
- **No CI/CD pipelines.** No `.github/workflows`, no GitLab CI.
- **No git hooks, no Husky, no pre-commit.**
- **No `vercel.json` cron declarations.** Crons are checked in as routes but the `crons` block is **intentionally omitted** because the Hobby tier breaks the deploy when daily-cap crons are declared at hourly cadence. The README documents the exact block to restore once Vercel Pro is enabled — do not restore it preemptively.
- **No `/components`, `/scripts`, or `/tools` directories.** Pages keep UI inline.
- **No ESLint or Prettier overrides.** Defaults from `eslint-config-next` are intentional.

## Workflow for changes

1. **Run `npm run eval` first.** Confirms the model + prompts are passing the seed set before you touch anything.
2. **Check the ADRs.** If your change touches the gateway, queue locking, correlation strategy, ORM choice, auth, or model pinning — there is already an ADR. Read it before proposing changes.
3. **Cite the spec.** PRs should reference `spec/v0.4.md §X.Y` for the behavior they implement or amend.
4. **Architectural change → write the ADR first.** Copy `docs/adr/template.md`, increment the number, land it in the same PR or earlier (§14.5.2).
5. **Prompt or model change → re-run eval, post the diff in the PR.** Bump version in `prompts/CHANGELOG.md`.
6. **Keep `lib/llm/gateway.ts` 30–60 lines.** If your change makes it longer, you are probably building a framework — reconsider.
7. **HITL paths must record audit trail.** Writes go through `HitlAuditLog`.

## Environment variables (from `.env.example`)

`ANTHROPIC_API_KEY`, `LLM_MODEL_ID` (pinned dated), `LLM_PROVIDER` (Phase 3),
`DATABASE_URL`, `DIRECT_URL` (unpooled for migrations),
`AUTH_SECRET`, `NEXTAUTH_URL`,
`NEWSAPI_KEY`, `ACLED_EMAIL`, `ACLED_KEY`,
`RESEND_API_KEY`, `ALERT_EMAIL_TO`, `ALERT_EMAIL_FROM`,
`CRON_SECRET`,
`MONTHLY_BUDGET_USD` (default 500; daily = monthly × 1.1 ÷ 30).

## Pointers to deeper docs

- `README.md` — 30-minute local start, hard rules, file map.
- `spec/v0.4.md` — full specification. Cite section numbers in PRs.
- `docs/architecture.md` — system architecture overview.
- `docs/adr/` — ADR-001 (Postgres over Elasticsearch), ADR-002 (NextAuth over Supabase Auth), ADR-003 (decoupled ingestion/inference + SKIP LOCKED), ADR-004 (gateway is a single function), ADR-005 (fingerprint correlation), ADR-006 (Prisma over Drizzle), ADR-007 (dated model IDs).
- `docs/runbook.md` — incident response (LLM down, cron failed, queue stuck, parse-failure rate spike, budget circuit-breaker tripped).
- `docs/slo.md` — service-level objectives (§14.1).
- `docs/observability.md` — metrics catalog.
- `docs/authorization-matrix.md` — RBAC matrix (§6.8).
- `docs/prompt-injection-policy.md` — five mitigation policies (§14.3).
- `docs/data-retention.md` — retention rules (§14.2; `raw_content` nulled after window).
