# Artifact 10 — Backup and Recovery Plan

**Status**: 🔲 todo — needs provider RPO/RTO numbers and a tested restore drill
**Spec ref**: §10 item 10

## What this artifact is

A statement of backup frequency, retention, and tested recovery
procedure. The TSMC reviewer wants numbers, not "we use a managed
provider".

## Targets (proposed; confirm with TSMC IT)

| Metric | Target |
|---|---|
| RPO (max acceptable data loss) | 1 hour |
| RTO (max acceptable downtime)  | 24 hours |
| Backup retention                | 30 days rolling |
| Cross-region backup             | not required Phase 1-2; required for Phase 3 if TSMC mandates |

## Backup mechanisms by data class

| Data | Mechanism | Frequency | Retention | Tested? |
|---|---|---|---|---|
| Postgres (all tables) | Provider-managed automated snapshots | daily + WAL streaming | 7-30d depending on provider tier | 🔲 todo: monthly restore drill |
| Eval ground truth + audit-runs | Git (GitHub) | every commit | permanent | yes (clone = restore) |
| Prompts | Git (GitHub) | every commit | permanent | yes |
| Secrets (Vercel env) | Vercel-managed; **not backed up by us** | n/a | n/a | regenerate from source-of-truth |

## What's not backed up (and why)

- `ingest_queue` `done` rows older than 30 days — purged per retention
  policy. Re-fetching from sources would re-create the data.
- Vercel secret values — these are the source of truth. Document
  out-of-band where the originating credential lives (e.g. Anthropic
  console for the API key).

## Recovery procedure (skeleton)

1. **Identify** scope: which tables, which time window.
2. **Stop writes** — flip `system_flags.ingestion_paused = true`.
3. **Restore** from provider snapshot (Supabase / Neon UI).
4. **Verify** — run a small set of read queries against known
   reference rows (audit history is the best canary).
5. **Resume writes** — clear the flag.
6. **Post-mortem** per Artifact 9.

## Restore-drill cadence

Monthly during Phase 1-2 may be excessive; quarterly is fine for an
internal tool. **One drill must happen before Phase 2 user
testing.** Record the drill outcome in this file, dated.

## Drill log

| Date | Operator | Outcome | Notes |
|---|---|---|---|
| — | — | — | first drill scheduled for Phase 1 Week 6 |
