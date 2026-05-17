# GPS Issue & Management Center

OSINT-driven issue detection and case management for the TSMC GPS team.
Spec **v0.4** · Phase **0** scaffold.

> README quality bar (spec §14.5.1): assume Rockie is not in the room.
> A new developer should be able to start the system locally in 30 minutes
> using only this file.

## What this system does

Public-source articles are fetched on schedule, run through a structured
triage model with a 4-dimension pragmatic rubric, surfaced as **Issues**,
and managed through a lightweight case workflow. Human-in-the-loop
correction is required for any judgment that goes out the door. Five
categories: `geopolitical`, `physical_security`, `supply_chain`,
`regulatory`, `hostile_narrative`.

## Architecture in one paragraph

Two independent crons. **Ingestion** (hourly) fetches articles from
configured sources into a Postgres `ingest_queue` as `pending`. **Inference**
(every 5 minutes) claims pending rows with `FOR UPDATE SKIP LOCKED`, calls
`runTriageInference()` (the single Anthropic-SDK entry point in
`lib/llm/gateway.ts`), and writes Issues + audit history. Postgres is the
only datastore. A daily **budget cron** sums yesterday's token cost; if it
exceeds 1.5× the daily cap, it flips the global `ingestion_paused` flag and
emails Rockie. Inference keeps draining the queue.

```
Sources ─► ingest_queue ─► [SKIP LOCKED] ─► runTriageInference ─► issues
                                                ▼
                                           cost_log + correlations
```

Full spec lives in `/spec/v0.4.md`. The high-leverage decisions are in
`/docs/adr/`. Don't change architecture without writing the ADR first
(spec §14.5.2).

## 30-minute local start

### 1. Prerequisites
- Node 20+
- A Postgres 14+ database (local Docker, Supabase, or Neon)
- Anthropic API key with a billing alert configured

### 2. Install
```bash
npm install
cp .env.example .env.local
# Edit .env.local — at minimum: DATABASE_URL, DIRECT_URL, ANTHROPIC_API_KEY, CRON_SECRET
```

### 3. Initialize the database
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the eval (do this **before** any code change)
```bash
npm run eval
```
This runs the Phase 0 ground-truth set against your pinned model.
Phase 0 gate per spec §8: ≥ 80% accuracy on the seed set.

### 5. Boot the app
```bash
npm run dev
# open http://localhost:3000
```

### 6. Manually trigger a cron (since Vercel Cron isn't running locally)
```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/ingest
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/infer
```

You should see new rows in `/health` and new issues in `/issues`.

### 7. (Optional) Open Prisma Studio
```bash
npm run db:studio
```
The spec calls Prisma Studio out as a real solo-dev productivity tool
(ADR-006). Use it during incident response.

## Where things live

| Path | What it is |
| --- | --- |
| `app/api/cron/ingest` | Ingestion cron (hourly). Calls each connector. |
| `app/api/cron/infer` | Inference cron (5 min). SKIP LOCKED queue claim → Claude. |
| `app/api/cron/budget-check` | Daily budget cron. Trips ingestion kill-switch. |
| `app/(app)/issues` | Issue list, detail, HITL correction pages. |
| `app/(app)/dashboard` | The four §6.9 metrics. Don't add more without ADR. |
| `app/(app)/sources` | Per-source health + paused status. |
| `app/(app)/health` | Queue counts + system flags. |
| `lib/llm/gateway.ts` | **The only file allowed to import the Anthropic SDK.** |
| `lib/llm/schema.ts` | `TriageResult` Zod schema + `store_judgment` tool definition. |
| `lib/queue/queue.ts` | `claimPending()` with FOR UPDATE SKIP LOCKED. |
| `lib/sources/types.ts` | `SourceConnector` interface — every connector implements this. |
| `lib/sources/*.ts` | Connectors: NewsAPI, Google News RSS, ACLED. |
| `lib/correlation/fingerprint.ts` | §6.7 geo+actor+window heuristic. Never auto-merges. |
| `lib/auth/authorize.ts` | §6.8 authz matrix; `requireRole()` is the single gate. |
| `lib/cost/budget.ts` | §9.2 daily circuit-breaker. |
| `prompts/system.md`, `prompts/rubric.md` | Versioned prompts. Bump = PR + eval regression. |
| `eval/run-eval.ts` | Phase 0 ground-truth harness. |
| `prisma/schema.prisma` | All persistent state. |
| `docs/adr/` | Architecture decisions. New decision = new ADR. |
| `docs/runbook.md` | What to do when things break. |
| `docs/data-retention.md` | §14.2 retention policy. |
| `docs/prompt-injection-policy.md` | §14.3 five policies. |
| `docs/slo.md` | §14.1 service-level objectives. |

## Hard rules (don't trip over these)

1. **Anthropic SDK is imported in `lib/llm/gateway.ts` and nowhere else.** Spec §6.3 + ADR-004.
2. **Inference claims rows with `FOR UPDATE SKIP LOCKED`.** ADR-003.
3. **HITL correction must record a reason classification.** Spec §7. Don't make `reason` optional.
4. **Auto-merge of Issues is forbidden.** §6.7. Correlation suggests; HITL decides.
5. **Architectural changes require a new ADR before the PR lands.** §14.5.2.
6. **`LLM_MODEL_ID` is a pinned dated identifier.** Never `-latest`. ADR-007.
7. **Suspicious-flagged inferences (§14.3.5) never auto-promote to Issues.** They go to a HITL review queue.

## When things break

See `docs/runbook.md`. The page covers the realistic Phase 0/1 incidents:
LLM down, cron failed, queue stuck, parse-failure rate spike, budget
circuit-breaker tripped.

## Phase 0 → Phase 1 → Phase 3 in three lines

- **Phase 0** (this scaffold): evaluation harness, prompts, ADRs, schema, gateway, queue, sources, dashboard skeleton.
- **Phase 1**: real ingestion at hourly cadence, dashboards live, predicate accuracy ≥ 80% on the seed set.
- **Phase 3**: TSMC IT-dictated deployment target; the only code that changes is `lib/llm/gateway.ts` (provider) and `lib/auth/auth.ts` (SSO).

## Phase 1 prerequisites (not yet satisfied)

- **Vercel Pro plan.** Hobby caps cron jobs at daily cadence; the spec
  requires hourly ingestion and 5-minute inference (§6.2, §14.1). The
  cron route handlers (`app/api/cron/*`) are checked in and work, but
  `vercel.json` does **not** declare the crons today — adding them on
  Hobby breaks the deploy. When Pro is enabled, restore this block:
  ```json
  {
    "crons": [
      { "path": "/api/cron/ingest",       "schedule": "0 * * * *" },
      { "path": "/api/cron/infer",        "schedule": "*/5 * * * *" },
      { "path": "/api/cron/budget-check", "schedule": "0 9 * * *" }
    ]
  }
  ```
- **Anthropic API key** with billing alert (daily reminder + monthly cap).
- **Postgres** (Supabase or Neon — free tier is fine for Phase 1).
- **Resend API key** for §9.2 budget-circuit-breaker emails.

Until cron is declared, trigger handlers manually for local dev:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/ingest
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/infer
```
