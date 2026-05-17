# ADR-003: Ingestion and inference decoupled via Postgres queue with SKIP LOCKED

- Status: accepted (retrospective per spec v0.4 §8 Phase 0)
- Date: 2026-05-17
- Spec ref: §6.2

## Context

Two failure modes are guaranteed if ingestion and inference run synchronously:

1. **Ingestion timeout cascades into inference loss.** Vercel serverless functions have hard timeouts. If we call Claude inside the ingest handler and any source is slow, we lose both the article and the judgment.
2. **Re-runs double-process.** If the inference cron overruns (5-min interval, occasional 6-min run), two workers grab the same row and produce duplicate Issues. The Postgres standard fix is `FOR UPDATE SKIP LOCKED`, which is free if you use it and a guaranteed incident if you don't.

## Decision

- `ingest_queue` is a Postgres table with statuses `pending | processing | done | failed | suspicious`.
- Ingestion Cron (hourly) fetches articles, writes them to the queue as `pending`. **It never calls Claude.**
- Inference Cron (5-minute) claims rows with `FOR UPDATE SKIP LOCKED` (`lib/queue/queue.ts:claimPending`), calls `runTriageInference`, writes the judgment, marks done.
- Suspicious content (§14.3.5) goes to a separate `suspicious` status — never auto-promoted to an Issue.

## Consequences

### Good
- A single bad source can't block judgment of articles already in queue.
- Overlapping inference crons are safe; no application-level locks needed.
- Retry policy (`retry_count < 3`) lives in one place — the queue worker.
- Reprocessing for prompt rollback (§8 Phase 1) is "set rows to `pending`"; no special infrastructure.

### Bad / tradeoffs
- Two crons to monitor instead of one (mitigated by `/health` page).
- One-row-at-a-time inference is slower than batching, but we batch implicitly by claiming 10 rows per invocation.

### Neutral
- We're not using SQS/Redis. Spec §6.5 explicitly forbids it.

## Alternatives considered

### A. Synchronous fetch → infer in a single cron
Rejected per §6.2 failure mode (1) above.

### B. Redis Streams or BullMQ
Rejected per §3 portability principle. Phase 3 cutover should not require operating a queue broker.

### C. Postgres queue without SKIP LOCKED
Rejected — the v0.4 §0 diff explicitly added SKIP LOCKED as the v0.4 fix. Without it, overlap = double-processing.

## How to revisit

If batch throughput becomes the bottleneck (Phase 3 with high-volume commercial feeds), revisit batching inside `runTriageInference` (multi-message-per-call) before reintroducing a broker.
