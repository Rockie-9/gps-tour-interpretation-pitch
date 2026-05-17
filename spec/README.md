# Spec — Substrate

This directory is the contract that Slide 14 (Substrate · 工具、日誌、稽核 / 基盤：ツール、ログ、監査) of `/index.html` promises. The deck is the narrative; the files here are the source of truth. When the deck and the files disagree, the files win — and the deck is updated.

## Files

- [`logging.md`](./logging.md) — log-entry schema, retention tiers, PII rules, and one realistic sample entry per `action_type`.
- [`audit-events.json`](./audit-events.json) — machine-readable taxonomy: 4 audit domains × 14 action types × 4 trigger rules × evidence schema.

## Trace table — deck claim ↔ spec field

The deck's Slide 14 makes promises about the substrate. Each promise must trace to a concrete field below; each field traces back to a promise.

| Slide 14 claim                                                       | Spec field                                                   |
|----------------------------------------------------------------------|--------------------------------------------------------------|
| 5W1H schema (who/when/what/on which/from where/why)                  | `logging.md` → *Log entry schema* (rows: actor, ts, action_type, target, surface, context_tag) |
| Retention: hot 90d, warm 1y, cold 3y                                 | `logging.md` → *Retention tiers* · `audit-events.json` → `retention_alignment` |
| 14 action types                                                      | `audit-events.json` → `action_types[]` (length must equal 14) |
| 4 audit domains (ASSESS · RECOGNIZE · TRAIN · RECOVER)               | `audit-events.json` → `audit_domains[]` (length must equal 4) |
| Drift > 15% → recalibration                                          | `audit-events.json` → `trigger_rules[DRIFT_15]`               |
| Missing evidence chain freezes promotion                             | `audit-events.json` → `trigger_rules[CHAIN_MISSING]`          |
| Module validation absent → certification void                        | `audit-events.json` → `trigger_rules[MODULE_VOID]`            |
| Recurring incident class → architecture recall                       | `audit-events.json` → `trigger_rules[RECURRING_INCIDENT]`     |
| PII handling: visitor opt-in, staff name visible, salary never logged | `logging.md` → *PII handling* |
| Tooling: LINE-mobile + Web console (staff-only, no visitor surface)   | `logging.md` → schema `surface` enum (`line \| web \| console \| system`) — no `visitor` value defined |
| Spec links inside the deck                                            | `/index.html` Slide 14 → `<a class="substrate-spec-link" href="spec/logging.md">` and `href="spec/audit-events.json"` |

## Out of scope (for this iteration)

These items are explicitly future work. They are listed here so that anyone picking up the spec knows where the line is.

- Implementation code (no tool is built in this iteration).
- Database schema, migrations, or storage choice.
- API contracts; no service is exposed.
- Visitor-facing surfaces — a visitor LINE Official Account, a public dashboard, a public-API integration. The current iteration is **staff workflow only**.
- Cross-organisation data sharing beyond the quarterly drift metric.

## Trilingual alignment

The deck is trilingual (TC · EN · JP). The audit taxonomy mirrors that intent: every `audit_domain` and `action_type` in `audit-events.json` carries `name_tc` / `name_en` / `name_jp` (or `tc` / `description` / `jp`) so that staff in any region can read the same machine-readable definition without translation drift between the deck and the spec.

## Versioning

- `audit-events.json` carries a `version` string at the root. Bump it on any schema change.
- `logging.md` references the same `version` when its schema is touched.
- When the schema breaks backward compatibility, create `/spec/CHANGELOG.md` with the migration record. (Not present until the first such migration.)
