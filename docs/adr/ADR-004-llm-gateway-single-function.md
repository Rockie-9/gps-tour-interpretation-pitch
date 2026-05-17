# ADR-004: LLM Gateway is a single function; do not extend into a framework

- Status: accepted (retrospective per spec v0.4 §8 Phase 0)
- Date: 2026-05-17
- Spec ref: §6.3

## Context

Phase 3 may require TSMC IT to route LLM calls through Azure OpenAI / Vertex / Bedrock instead of Anthropic direct. If `Anthropic` is imported in twenty files, that's a twenty-file refactor at the worst time.

The corresponding overreaction is to introduce LangChain / a "policy enforcement layer" / a generic LLM client abstraction. The v0.4 §0 diff explicitly warns against this ("Accidental Platform Engineering").

## Decision

- The Anthropic SDK is imported in **exactly one file**: `lib/llm/gateway.ts`.
- That file exports **one function**: `runTriageInference(input) → TriageInferenceResult`.
- Function name uses domain vocabulary (`TriageInference`), not provider vocabulary (renamed from v0.3 `runClaudeJudgment` per v0.4 §0).
- The file stays at roughly 30-60 lines of orchestration — no framework, no abstract base classes, no provider registry.

## Consequences

### Good
- Phase 3 swap is a single-file rewrite. Function signature is the contract.
- Caller code reads as domain code, not glue code.
- No dependency tree of LLM-framework transitive deps to audit.

### Bad / tradeoffs
- If we ever need multi-provider routing for cost/latency reasons inside Phase 1-2, we'll be tempted to grow this file. Don't — open a new ADR first.

### Neutral
- The `LLM_PROVIDER` env var is reserved but not yet branched on. Phase 3 will add the branch.

## Alternatives considered

### A. LangChain / LlamaIndex
Rejected — they bring their own conventions and we'd inherit upgrade churn.

### B. Provider plugin interface in Phase 1
Premature abstraction. The interface costs more than the swap it would save.

## How to revisit

If we genuinely need two providers in production at the same time (A/B test, fallback for outage), open a new ADR. Until then this stays as one function.
