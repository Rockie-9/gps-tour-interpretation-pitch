# Observability

Spec §6.9 — **four indicators only**. Don't add more without an ADR and
a real reason. The spec's §0 "Accidental Platform Engineering" warning
applies directly to observability sprawl.

## The four

| Key | Frequency | Purpose | Read at |
| --- | --- | --- | --- |
| `queue_backlog_size` | 5 min | Detect inference falling behind ingestion | `/health` + `/dashboard` |
| `ingestion_success_rate` | hourly | Detect source failure (drives degraded mode) | `/sources` |
| `inference_parse_failure_rate` | 5 min | Detect prompt drift or schema mismatch | `/dashboard` |
| `monthly_token_cost_usd` | daily | Drive budget circuit-breaker (§9.2) | `/dashboard` |

## What we don't measure (yet)

- Retry distribution
- Failed-source distribution
- Hallucinated-schema rate (separate from parse failure)
- Latency p50/p99

All of these are Phase 3 operational concerns — not adding them now per
the spec.

## Where the metrics live

`system_metrics` table. Schema in `prisma/schema.prisma` under
`SystemMetric`. Writes via `lib/observability/metrics.ts`.

## Dashboards

There is one dashboard page (`/dashboard`). It is intentionally plain.
If you want Grafana, write an ADR justifying why one page won't do.
