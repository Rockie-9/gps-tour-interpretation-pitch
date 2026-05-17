# ADR-001: Postgres for all storage; no Elasticsearch / vector store

- Status: accepted (retrospective per spec v0.4 §8 Phase 0)
- Date: 2026-05-17
- Deciders: Rockie Lin
- Spec ref: §6.2, §6.4, §6.7

## Context

A search-heavy OSINT system invites a reflex toward Elasticsearch for full-text and a vector store for embeddings-based correlation. With solo-dev maintenance burden and the §3 "每週 2 小時維運" constraint, every additional managed service is a tax we pay weekly.

Phase 1 data volume is small (single thousands of articles/day across all sources). Phase 3 may grow but not beyond what Postgres can comfortably index for our query shape.

## Decision

Postgres is the **only** durable store. Specifically:

- Queue lives in Postgres (`ingest_queue` table) with `FOR UPDATE SKIP LOCKED` (§6.2).
- Full-text search is deferred — Phase 1 lists are filtered by category + status + urgency, not text. If we need it in Phase 2, we use Postgres `tsvector` + GIN index, not a separate service.
- Correlation uses fingerprint heuristics (geo + actor + event window) — no embeddings, no vector store (§6.7).

## Consequences

### Good
- Single managed service; one backup story; one set of credentials; one IAM model in Phase 3.
- Existing Prisma model covers all data; no second ORM or client library.
- Phase 3 cutover to TSMC internal Postgres is a connection string change.

### Bad / tradeoffs
- No fuzzy text dedupe; near-duplicate articles with different URLs and slightly different wording will produce multiple Issues. §6.7 fingerprint heuristic + HITL merge are the mitigation.
- No semantic similarity. If two articles describe the same event with no actor or geo overlap (rare), we won't suggest correlation.

### Neutral
- We could add `pgvector` later inside the same Postgres if §6.7 fingerprint hit rate drops below 70% per the spec's revisit clause.

## Alternatives considered

### A. Elasticsearch + Postgres
Standard OSINT stack. Rejected — operationally heavy for one person, and the search use case is thin in Phase 1-2.

### B. Postgres + pgvector + embedding pipeline
Defensible upgrade path. Rejected for now because §6.7 explicitly says "永不自動合併, 只 suggest" — even with embeddings the human still decides, so embedding cost adds little until heuristic fails.

## How to revisit

Revisit if: (1) §6.7 fingerprint hit rate < 70% measured over 14 days of HITL decisions (already exposed on dashboard), or (2) GPS analysts complain of duplicate fatigue in Phase 2.
