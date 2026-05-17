# SLO

Direct transcription of spec §14.1. Wide targets — appropriate for a
10-person internal tool, not for a public API.

| Indicator | Target | How measured |
| --- | --- | --- |
| Ingestion freshness | Articles enter the queue within 6 hours of `publishedAt` | `created_at − published_at` percentile |
| Inference completion | Queue rows reach `done` within 24 hours of `created_at` | `processed_at − created_at` percentile |
| Monthly availability | > 99% (UI loads + at least one daily ingestion success) | Vercel + cron-success counter |
| HITL correction rate | < 15% by Phase 2 end; < 10% by Phase 3 | `issue_history` rows with `action='hitl_correction'` over total triaged |

## What "missing SLO" means

This is **not** a contract with paying users. Missing an SLO doesn't
mean the system is broken; it means an incident gets logged in
`docs/runbook.md` (or the equivalent) and reviewed at the next weekly
check-in.

## Not measured (intentionally)

Latency p99, request error rates per endpoint, queue depth at p99 —
all Phase 3 internal-operations concerns. Phase 1-2 does not need them
and adding them adds maintenance burden without informing decisions.
