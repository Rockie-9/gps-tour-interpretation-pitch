# M8 · 校準與評估 · Calibration & Assessment · 校正と評価

## Phase
Architect (Phase 3).

## Time budget
- Content: 20 hours theory + practice.
- Validation: facilitate ≥ 2 calibration sessions; rater drift < 0.3 across sessions.

## Learning outcome
Trainee facilitates BARS calibration sessions; can detect inter-rater disagreement, lead to consensus, document outcome as a `CALIBRATE_QUARTERLY` audit event.

## Maps to capabilities
Layer 02 capability **04 Narrative Design** (advanced; facilitating others), and all 12 capabilities at meta-level (what does L3 vs L4 LOOK like for each?).

## Sample artifact (v0.1)
- Trainee facilitates 2 real calibration sessions (region-internal or pilot cross-region).
- Each session produces a `CALIBRATE_QUARTERLY` audit event per `/spec/payloads.md`.
- Drift metric calculated post-session.

**SME-pending**: facilitation playbook + drift calculation method.

## Validation rubric
- **Present**: 2 sessions facilitated; both produce valid audit events; rater drift < 0.3 within session; observer scores facilitation as "competent."
- **Partial**: 1 session OR drift 0.3–0.5 → second session attempt.
- **Absent**: Cannot facilitate, drift > 0.5, OR cannot produce a valid audit event.

## Dependencies
M2 (voice — facilitating requires steady audible delivery), M6 (recovery — disagreement is its own kind of incident), M7 (micro-experience — facilitator needs to BE an experienced designer).

## SME content still needed
- ⛔ Facilitation playbook (agenda template, intervention scripts when disagreement persists, escalation criteria).
- ⛔ Drift calculation method (statistical — fleiss-kappa or simpler? document the choice).
- ⛔ Calibration-session debrief template.
- ⛔ Cross-region calibration coordination protocol (when JP / DE / CN / US-AZ join).

Owner: NAI SME + assessment specialist + (if available) statistician for drift method.

## State
🚧 v0.1 outline.

## Cross-reference
- `CALIBRATE_QUARTERLY` audit event: `/spec/payloads.md`
- `DRIFT_15` trigger rule: `/spec/audit-events.json`
- Roadmap Q3 2026 + 2027 calibration steps: `/index.html` Slide 20 (Roadmap)
