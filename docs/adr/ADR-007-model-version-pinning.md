# ADR-007: Pin Claude model identifier; bump only after ground-truth regression test

- Status: accepted
- Date: 2026-05-17
- Spec ref: §14.4

## Context

Triage quality is sensitive to model behavior. Anthropic ships periodic improvements, but "improvement" on aggregate benchmarks doesn't guarantee no regression on our specific judgment task — and the spec's whole point is to be calibrated.

Using `claude-sonnet-4-latest` would auto-upgrade us, with unknown effects on existing prompt + rubric. Worse: it would happen between weekly check-ins, so we'd discover the regression days late via HITL correction-rate spikes.

## Decision

- Production `LLM_MODEL_ID` is a **specific dated identifier** (e.g. `claude-sonnet-4-20250514`), stored in `.env`.
- No use of `*-latest` aliases anywhere.
- Upgrade flow (spec §14.4):
  1. Run `npm run eval` on dev with the new identifier against the existing ground truth.
  2. If classification agreement ≥ 95% **and** false-escalation rate isn't materially worse, write a new ADR documenting the bump.
  3. Update `.env` in production and tag the deployment.
  4. If agreement < 95%, stay on the old model until prompt/rubric adapt; track Anthropic's deprecation timeline.

## Consequences

### Good
- Zero surprise regressions on quiet weekends.
- Bumps are intentional, documented, and reversible.

### Bad / tradeoffs
- We won't get free-quality-bumps from minor Anthropic model updates without doing the eval.
- If Anthropic deprecates the pinned model on a short timeline, we have to react. Mitigation: Anthropic typically gives 6-12 months.

### Neutral
- The model identifier sits in `lib/llm/gateway.ts` via `process.env.LLM_MODEL_ID` — single source of truth.

## Alternatives considered

### A. `claude-sonnet-4-latest`
Rejected per the spec rationale above.

### B. Multiple-model A/B for cost
Rejected for Phase 1-2. Spec §3 says "全 Sonnet" through Phase 1-2; revisit in Phase 3 only.

## How to revisit

Anthropic announces deprecation, or our eval suite consistently shows the pinned model has degraded relative to a newer one.
