# Substrate · Logging Specification

> Companion to Slide 14 (Substrate · 工具、日誌、稽核 / 基盤：ツール、ログ、監査) of the pitch deck.
> This file is the contract; the deck is the narrative. When they disagree, this file is the source of truth.

## Purpose

Every operational act on the GPS information-desk capability platform is traceable: who did what to which entity, from which surface, why, and in what chain of prior events. Without retrievability, no audit; without audit, no recognition; without recognition, the system is administered on belief rather than evidence.

## Log entry schema

Append-only. JSON Lines. One event per line.

| Field             | Type                              | Required | Description                                                                 |
|-------------------|-----------------------------------|----------|-----------------------------------------------------------------------------|
| `entry_id`        | string (uuid v4)                  | yes      | Globally unique.                                                            |
| `ts`              | string (ISO 8601 + timezone)      | yes      | e.g. `2026-05-17T09:14:22+08:00`.                                            |
| `actor.id`        | string                            | yes      | Internal staff identifier; never personal phone or email.                   |
| `actor.tier`      | enum `L0 \| L1 \| L2 \| L3 \| L4 \| L5` | yes  | Tier at time of action.                                                     |
| `actor.role`      | string                            | yes      | e.g. `reception_lead`, `training_lead`, `peer_observer`.                     |
| `action_type`     | enum (14 values)                  | yes      | See `audit-events.json#action_types[].code`.                                 |
| `target.id`       | string                            | yes      | Identifier of the entity acted on.                                          |
| `target.type`     | enum                              | yes      | `assessment \| observation \| script \| scenario \| certification \| kpi \| calibration \| recognition \| recovery \| handover \| wayfinding \| feedback \| brief \| other` |
| `target.version`  | string                            | no       | When the target has revisions.                                              |
| `surface`         | enum `line \| web \| console \| system` | yes | Where the action was performed.                                             |
| `device_class`    | enum `phone \| tablet \| desktop \| system` | yes | Coarse device class only; never device identifiers.                        |
| `context_tag`     | string (≤ 240 chars)              | no       | Free text for situational context; never PII.                               |
| `prior_event_id`  | string (uuid v4)                  | no       | Pointer to the immediate prior event in the same chain (e.g. observation → verification → promotion). |
| `pii_flag`        | boolean                           | yes      | True if the entry references a visitor; triggers stricter retention.        |

## Retention tiers

| Tier        | Window       | Storage         | Access                              |
|-------------|--------------|-----------------|-------------------------------------|
| Hot         | 0 – 90 days  | online primary  | self-serve query for any staff      |
| Warm        | 90d – 1y     | online index    | role ≥ L3 query                     |
| Cold        | 1y – 3y      | offline archive | audit role only, with logged access |
| Beyond 3y   | —            | purged (PII) / hashed (non-PII) | not directly retrievable |

## PII handling

- **Visitor PII**: opt-in only; deleted on `visit_end + 24h` unless the visitor explicitly opts to be remembered (e.g., VIP follow-up).
- **Staff PII**: name + role visible; salary band, performance ratings, and disciplinary outcomes are **never** written to this log.
- **Anonymisation**: on transition to Warm tier, visitor identifiers are replaced with non-reversible hashes. Cold tier carries no visitor identifier at all.
- **Right to access / erasure**: visitor erasure request triggers a `RIGHT_TO_ERASURE` action_type that purges Hot entries and tombstones the hashed Warm entries.

## Sample entries (one per action_type)

```jsonl
{"entry_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c001","ts":"2026-05-17T09:14:22+08:00","actor":{"id":"staff_4421","tier":"L3","role":"peer_observer"},"action_type":"OBSERVE_BARS","target":{"id":"obs_8821","type":"observation","version":"1"},"surface":"line","device_class":"phone","context_tag":"A2 full companion tour, group of 4, CN family","prior_event_id":null,"pii_flag":false}
{"entry_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c002","ts":"2026-05-17T09:20:11+08:00","actor":{"id":"staff_3310","tier":"L4","role":"training_lead"},"action_type":"DOUBLE_VERIFY","target":{"id":"obs_8821","type":"observation","version":"1"},"surface":"web","device_class":"desktop","context_tag":"second observer for promotion review","prior_event_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c001","pii_flag":false}
{"entry_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c003","ts":"2026-06-30T17:00:00+08:00","actor":{"id":"staff_2210","tier":"L5","role":"calibration_steward"},"action_type":"CALIBRATE_QUARTERLY","target":{"id":"cal_q2_2026","type":"calibration"},"surface":"console","device_class":"desktop","context_tag":"2026Q2 cross-region; drift 0.08","prior_event_id":null,"pii_flag":false}
{"entry_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c004","ts":"2026-07-02T11:42:00+08:00","actor":{"id":"staff_2210","tier":"L5","role":"calibration_steward"},"action_type":"PROMOTE_TIER","target":{"id":"staff_4421","type":"recognition","version":"L3->L4"},"surface":"web","device_class":"desktop","context_tag":"3-evidence chain met; mentor sign-off staff_3310","prior_event_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c002","pii_flag":false}
{"entry_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c005","ts":"2026-07-02T11:43:05+08:00","actor":{"id":"staff_2210","tier":"L5","role":"calibration_steward"},"action_type":"AWARD_INSIGNIA","target":{"id":"staff_4421","type":"recognition","version":"L4-copper-dot"},"surface":"system","device_class":"system","context_tag":"insignia issuance follows promotion","prior_event_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c004","pii_flag":false}
{"entry_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c006","ts":"2026-11-15T10:00:00+08:00","actor":{"id":"staff_2210","tier":"L5","role":"calibration_steward"},"action_type":"REVOKE_TIER","target":{"id":"staff_5512","type":"recognition","version":"L3->L2"},"surface":"web","device_class":"desktop","context_tag":"evidence chain failure on 2 of 3 audited scenarios","prior_event_id":null,"pii_flag":false}
{"entry_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c007","ts":"2026-04-01T08:00:00+08:00","actor":{"id":"staff_4421","tier":"L2","role":"reception"},"action_type":"ENROLL_MODULE","target":{"id":"M5","type":"certification","version":"2026"},"surface":"line","device_class":"phone","context_tag":"cross-cultural sensitivity, Builder phase","prior_event_id":null,"pii_flag":false}
{"entry_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c008","ts":"2026-05-20T16:30:00+08:00","actor":{"id":"staff_4421","tier":"L2","role":"reception"},"action_type":"COMPLETE_MODULE","target":{"id":"M5","type":"certification","version":"2026"},"surface":"web","device_class":"desktop","context_tag":"validation submission","prior_event_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c007","pii_flag":false}
{"entry_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c009","ts":"2026-05-22T10:00:00+08:00","actor":{"id":"staff_3310","tier":"L4","role":"training_lead"},"action_type":"VALIDATE_MODULE","target":{"id":"M5","type":"certification","version":"2026"},"surface":"console","device_class":"desktop","context_tag":"simulation zero infractions","prior_event_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c008","pii_flag":false}
{"entry_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c010","ts":"2026-05-18T14:22:00+08:00","actor":{"id":"staff_4421","tier":"L3","role":"reception"},"action_type":"LOG_INCIDENT","target":{"id":"inc_2026_0042","type":"recovery"},"surface":"line","device_class":"phone","context_tag":"C1 service recovery, exhibit closed early without signage","prior_event_id":null,"pii_flag":false}
{"entry_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c011","ts":"2026-05-18T14:55:00+08:00","actor":{"id":"staff_3310","tier":"L4","role":"training_lead"},"action_type":"RESOLVE_INCIDENT","target":{"id":"inc_2026_0042","type":"recovery"},"surface":"web","device_class":"desktop","context_tag":"signage placed; D3 loop-back scheduled","prior_event_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c010","pii_flag":false}
{"entry_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c012","ts":"2026-05-19T09:10:00+08:00","actor":{"id":"staff_4421","tier":"L3","role":"reception"},"action_type":"SCRIPT_UPDATE","target":{"id":"script_A1_004","type":"script","version":"2.1"},"surface":"web","device_class":"desktop","context_tag":"added JP register variant","prior_event_id":null,"pii_flag":false}
{"entry_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c013","ts":"2026-06-15T11:00:00+08:00","actor":{"id":"staff_3310","tier":"L4","role":"training_lead"},"action_type":"SCENARIO_REVISE","target":{"id":"B1","type":"scenario","version":"2.0"},"surface":"web","device_class":"desktop","context_tag":"added 'Register' meta row per cross-region feedback","prior_event_id":null,"pii_flag":false}
{"entry_id":"e1f3c5a0-4dde-4a40-8a3c-1a18d6f9c014","ts":"2026-05-17T18:00:00+08:00","actor":{"id":"visitor_hash_8a1d","tier":"L0","role":"visitor"},"action_type":"FEEDBACK_INTAKE","target":{"id":"fb_2026_2210","type":"feedback"},"surface":"line","device_class":"phone","context_tag":"D3 post-visit survey; visitor opted to be remembered","prior_event_id":null,"pii_flag":true}
```

## Out of scope

- Visitor-facing analytics or marketing attribution.
- Cross-organisation log sharing. Each region runs its own logs; only quarterly drift metrics are shared with the Global Training Council.
- Implementation code, database migrations, and API contracts. This document is the *contract*; the implementation is future work.

## Versioning

- This file: see `version` in `audit-events.json`. Bump on schema change.
- Backward compatibility: new optional fields are additive; existing fields are never removed without a major version bump and a migration record in `/spec/CHANGELOG.md` (created when the first migration occurs).
