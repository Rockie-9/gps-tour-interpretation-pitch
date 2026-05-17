# Substrate · Storage specification

V2 step C9 (item 10). Closes the gap Sara (#9) flagged: the deck claims retention tiers (hot 90d / warm 1y / cold 3y) but doesn't say WHERE the cold-tier archive lives. This document answers.

---

## 1. Retention tiers — physical placement

| Tier | Window | Storage | Format | Access | Cost-class |
|---|---|---|---|---|---|
| **Hot** | 0–90 days | Same-region object store (S3 Standard, MinIO, or equivalent) | JSON Lines, gzipped, partitioned by `YYYY/MM/DD/actor_region/` | Self-serve console query for any staff role | $$ |
| **Warm** | 90 days – 1 year | Same-region cool-tier object store (S3 Standard-IA, MinIO with lower replication) | Same JSON Lines, gzipped, monthly-rollup tarballs | Console query for L3+ staff (`assess.read.warm` role) | $ |
| **Cold** | 1 year – 3 years | Cross-region archive object store (S3 Glacier Deep Archive, Tape via offsite vendor) | Same JSON Lines, with an additional sidecar index per month (`yyyy-mm.index.parquet`) | Audit role only (`audit.read.cold`); 12–48 hour retrieval SLA acceptable | ¢ |
| **Beyond 3y** | > 3 years | — | — | PII: purged. Non-PII (action_type + ts + aggregate): hashed and retained indefinitely as anonymous aggregates for trend analysis. | — |

Each region (HQ-TW, JP, DE, CN, US-AZ) operates its own hot+warm+cold pipeline. Cross-region queries are limited to the quarterly drift metric (one aggregated number, not raw events).

---

## 2. Storage choice rationale

- **Object store over RDBMS** — events are append-only, immutable, and queried more often by time-range than by individual fields. JSON Lines on object storage scales to millions of events/desk/year without operational overhead.
- **Region-local hot/warm tiers** — data sovereignty (GDPR for DE, PIPL for CN, etc.) requires that PII does not cross borders without explicit transfer agreements.
- **Cold tier may be cross-region** — only if PII is anonymised before archival; otherwise cold is also region-local.

Concrete choice per region — finance / IT decision, not specified here. Each region documents its own choice in a region-config file (TBD, V3 territory).

---

## 3. Migration on read

When the catalogue MAJOR-bumps (per `versioning.md`), historical events in cold tier do NOT get rewritten. Instead:

1. The reader knows its target schema version.
2. Each event carries `_schema_version`.
3. A migration adapter chain (one per MAJOR delta) transforms an older event into the current schema *on read*, in memory.
4. Original event is never overwritten.

This means cold-tier archives are immutable and auditable as captured. Migration is a consumer-side concern.

---

## 4. PII handling

| PII class | Hot | Warm | Cold | Beyond 3y |
|---|---|---|---|---|
| **Visitor PII** (name, email, phone if collected) | Stored only with opt-in; auto-deleted 24h post-visit unless visitor opts to be remembered | Anonymised — `visitor_id` replaced with `sha256(salt + original_id)` | Anonymised before transfer | Purged |
| **Staff PII** (name, employee_id, tier) | Stored as-is | Stored as-is | Stored as-is | Purged on staff departure + 7 years |
| **Salary band** | NEVER logged in any tier. Period. | — | — | — |

---

## 5. Backup + disaster recovery

- Hot tier: replicated across 3 AZs within the region (provider default).
- Warm tier: replicated across 2 AZs within the region.
- Cold tier: replicated across 2 geographic locations (cross-region acceptable only for non-PII).
- Backup of backup: monthly snapshot of indices (not data) shipped to a separate vendor for ransomware recovery.

Recovery time objective:
- Hot tier failure: < 1 hour (auto failover).
- Warm tier failure: < 4 hours.
- Cold tier failure: < 48 hours (acceptable; cold is for audit, not operations).

---

## 6. Cost ceiling

Order-of-magnitude:
- One desk emits ~200 events/day average → 73K events/year → ~3 MB/desk/year uncompressed JSON.
- 200 desks × 3 MB = 600 MB/year hot tier. Negligible. Cold tier is even smaller (gzipped + minus PII).

Storage cost is not a constraint. The constraint is **query latency** in cold tier (Glacier 12-48h SLA) and **operational overhead** in maintaining cross-region pipelines (the V3 problem).

---

## 7. Out of scope

- Concrete cloud provider selection (region-specific decision).
- Backup tooling selection.
- Encryption-at-rest configuration (assumed; provider-default sufficient).
- Implementation code — V3.

---

## Cross-reference

- Retention windows: `logging.md` → *Retention tiers*
- What can be queried where: this doc → Section 1
- PII rules: `logging.md` → *PII handling* and this doc → Section 4
- Schema migration: this doc → Section 3 and `versioning.md`
