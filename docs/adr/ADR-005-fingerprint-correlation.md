# ADR-005: Issue correlation by fingerprint heuristic; not embeddings

- Status: accepted (retrospective per spec v0.4 §8 Phase 0)
- Date: 2026-05-17
- Spec ref: §6.7

## Context

OSINT systems hit duplicate fatigue on day one — fifty articles describe the same event. The standard sophisticated approach is to embed articles and cluster by cosine similarity. The standard naive approach is to do nothing and let analysts drown.

The middle path: extract structured features the triage model is already producing (geo, primary actors, keywords) and group by feature overlap inside a time window.

## Decision

The fingerprint comprises four features the model populates during triage:

1. `geo.country` (and optionally region)
2. `primaryActors` (case-insensitive set intersection)
3. Event window: ±3 days from `publishedAt`
4. `keywordCluster` (3-5 noun phrases per article)

Merge rules:

- All three of {geo, actor-overlap, in-window} → suggest **merge** (write to `correlation_suggestions` with `kind = merge`).
- {geo, actor-overlap, but out-of-window} → suggest **link**.
- Otherwise → new Issue, no suggestion.

Critical: **HITL accepts or rejects every suggestion**. We never auto-merge primary Issue records.

## Consequences

### Good
- Zero new infrastructure; runs inside the existing Prisma client.
- Suggestions are explainable — the `fingerprint` JSON column shows which features overlapped.
- Cheap to roll back (set status = pending; ignore suggestions table).

### Bad / tradeoffs
- Misses paraphrased reports without entity overlap. Mitigation: spec §6.7 explicitly says revisit if Phase 2 hit rate < 70%.
- Sensitive to actor-name normalization (e.g. "DOC" vs "Department of Commerce"). Phase 2 may need an alias table.

### Neutral
- We can layer `pgvector` later without changing the suggestion table schema.

## Alternatives considered

### A. Auto-merge above similarity threshold
Rejected — false positives lose analyst trust and are operationally expensive to undo.

### B. Embeddings + clustering from day one
Rejected as premature complexity per §3 and §6.7 explicit guidance.

## How to revisit

§6.7 sets the revisit trigger explicitly: if Phase 2 fingerprint hit rate falls below 70%, upgrade. The dashboard (`/dashboard`) exposes that ratio.
