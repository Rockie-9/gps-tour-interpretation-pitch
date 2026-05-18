# Artifact 11 — Phase 3 Migration Plan

**Status**: ⬛ Phase 2 Week 11-12 deliverable (per spec §8 / §10)
**Spec ref**: §10 item 11, §4.2

## What this artifact will document

The technical and operational plan for moving the system from the
external Phase 1-2 prototype (Vercel + Supabase/Neon + Anthropic)
to the TSMC-internal Phase 3 deployment.

## What we know today

Per spec §4.2 and the ADRs:

| Concern | Phase 1-2 | Phase 3 (target) |
|---|---|---|
| Hosting              | Vercel (US) | TSMC IT-specified (container or VM) |
| Database             | Supabase / Neon | TSMC-internal Postgres |
| LLM provider         | Anthropic direct | A) TSMC AI Gateway (Azure OpenAI / Vertex) **or** B) Bedrock / Anthropic Enterprise |
| Auth                 | NextAuth + Credentials/Email | NextAuth + TSMC SSO (§Artifact 7) |
| Secrets              | Vercel Env | TSMC secret manager |
| Crons                | Vercel Cron (Pro) | TSMC scheduler (cron / Airflow / etc.) |
| Source connectors    | identical contract | identical contract (§6.6) |
| Issue + audit data   | Postgres | Postgres (same schema) |
| Eval harness         | local + workflow_dispatch | TSMC CI/CD |

## Code surface that changes

Per ADR-004, by design, the Phase 3 cutover should touch a small,
known set of files:

- `lib/llm/gateway.ts` — provider client + endpoint
- `lib/auth/auth.ts` — provider list (SSO)
- `prisma/schema.prisma` — possibly nothing
- `lib/db/prisma.ts` — connection params
- `vercel.json` or its replacement — cron schedule moved to TSMC scheduler
- `.env` keys — renamed / re-pointed

Everything else (queue, correlation, observability, authz matrix,
Issue management, dashboard, eval) should be untouched. Any
deviation from that list is an ADR moment.

## Data migration

- Issues + audit history: pg_dump → restore. Schema is identical.
- Queue rows in `pending` at cutover: drain on the old system, then
  cut.
- Cost-log + system metrics: copy as historical reference; expect
  TSMC IT may want metrics in a different observability stack — keep
  the Postgres tables anyway.

## Sign-off prerequisites (must be ✅ before cutover PR)

- Artifact 4 — Anthropic vendor risk ✅
- Artifact 5 — encryption section ✅
- Artifact 7 — SSO protocol ✅
- Artifact 8 — DPIA ✅ (legal sign-off)
- Artifact 10 — backup plan with at least one successful drill ✅
- All ADRs reviewed and current

## Open questions for Phase 2 informal IT contact

- Is Bedrock acceptable, or must everything go through the TSMC
  AI gateway?
- Container vs. VM? K8s available?
- Internal Postgres version + extensions (`pgcrypto`, `uuid-ossp`)?
- TSMC scheduler — what's available for sub-hourly cron?
- TSMC observability platform (Datadog / Splunk / internal)? Do we
  ship metrics out of Postgres into that platform?

Capture each answer in this file as the conversation happens.
