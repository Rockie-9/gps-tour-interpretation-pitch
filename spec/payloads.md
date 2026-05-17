# Substrate · Sample event payloads

V2 step C9 (item 10). One realistic JSON example per `action_type` in `audit-events.json`. Schema version pinned. PII rules applied. Field types match `audit-events.json` after C9 type-annotation pass.

All examples emit `_schema_version: "1.0.0"`.

---

## ASSESS domain

### `OBSERVE_BARS`

```json
{
  "_schema_version": "1.0.0",
  "entry_id": "01HVT5R7K8X9Y0Z1A2B3C4D5E6",
  "ts": "2026-05-17T14:32:18+08:00",
  "actor": { "id": "staff_TW_0142", "tier": "L2", "role": "guide" },
  "action_type": "OBSERVE_BARS",
  "target": {
    "id": "obs_2026-05-17_0142_05_L3",
    "type": "observation",
    "version": "1.0.0",
    "fields": {
      "observed_actor_id": "staff_TW_0084",
      "capability_id": "05",
      "anchor_level": "L3",
      "scenario_code": "B2",
      "observation_text": "Inferred dwell-time interest; deepened ceramic-glaze segment without prompt.",
      "evidence_quality": "clear"
    }
  },
  "surface": "console",
  "device_class": "desktop",
  "context_tag": "calibration-cycle-Q2-2026",
  "prior_event_id": null,
  "pii_flag": false
}
```

### `DOUBLE_VERIFY`

```json
{
  "_schema_version": "1.0.0",
  "entry_id": "01HVT6S8L9Y0A1B2C3D4E5F6G7",
  "ts": "2026-05-17T14:35:00+08:00",
  "actor": { "id": "staff_TW_0091", "tier": "L4", "role": "designer" },
  "action_type": "DOUBLE_VERIFY",
  "target": {
    "id": "obs_2026-05-17_0142_05_L3",
    "type": "observation",
    "version": "1.0.0",
    "fields": { "verified": true, "verifier_note": "Confirmed; same anchor observed in B2 myself." }
  },
  "surface": "console", "device_class": "desktop",
  "context_tag": "calibration-cycle-Q2-2026",
  "prior_event_id": "01HVT5R7K8X9Y0Z1A2B3C4D5E6",
  "pii_flag": false
}
```

### `CALIBRATE_QUARTERLY`

```json
{
  "_schema_version": "1.0.0",
  "entry_id": "01HVZ8X3M4N5P6Q7R8S9T0U1V2",
  "ts": "2026-06-30T16:00:00+08:00",
  "actor": { "id": "council_GLOBAL", "tier": "L5", "role": "calibration_steward" },
  "action_type": "CALIBRATE_QUARTERLY",
  "target": {
    "id": "cal_Q2_2026",
    "type": "calibration",
    "version": "1.0.0",
    "fields": {
      "regions": ["HQ-TW", "JP-pilot"],
      "capabilities_audited": ["04", "05"],
      "drift_pct": 0.08,
      "outcome": "passed",
      "next_review": "2026-09-30"
    }
  },
  "surface": "console", "device_class": "desktop",
  "context_tag": "quarterly-2026Q2",
  "prior_event_id": null,
  "pii_flag": false
}
```

---

## RECOGNIZE domain

### `PROMOTE_TIER`

```json
{
  "_schema_version": "1.0.0",
  "entry_id": "01HW1Y4N5O6P7Q8R9S0T1U2V3W4",
  "ts": "2026-07-15T10:00:00+08:00",
  "actor": { "id": "staff_TW_0091", "tier": "L4", "role": "designer" },
  "action_type": "PROMOTE_TIER",
  "target": {
    "id": "promo_staff_TW_0084_L2_to_L3",
    "type": "recognition",
    "version": "1.0.0",
    "fields": {
      "promoted_actor_id": "staff_TW_0084",
      "from_tier": "L2",
      "to_tier": "L3",
      "evidence_event_ids": [
        "01HVT5R7K8X9Y0Z1A2B3C4D5E6",
        "01HVT6S8L9Y0A1B2C3D4E5F6G7",
        "01HVW7T8U9V0W1X2Y3Z4A5B6C7"
      ],
      "scenarios_covered": ["B2", "A2"]
    }
  },
  "surface": "console", "device_class": "desktop",
  "context_tag": "quarterly-promotion-cycle",
  "prior_event_id": null,
  "pii_flag": false
}
```

### `AWARD_INSIGNIA`

```json
{
  "_schema_version": "1.0.0",
  "entry_id": "01HW1Z5O6P7Q8R9S0T1U2V3W4X5",
  "ts": "2026-07-15T10:01:00+08:00",
  "actor": { "id": "council_TW", "tier": "L5", "role": "calibration_steward" },
  "action_type": "AWARD_INSIGNIA",
  "target": {
    "id": "insignia_staff_TW_0084_L3",
    "type": "recognition",
    "version": "1.0.0",
    "fields": {
      "recipient_actor_id": "staff_TW_0084",
      "insignia": "small-turquoise-dot-lapel",
      "desk_plate_update": "解説者 / Interpreter"
    }
  },
  "surface": "console", "device_class": "desktop",
  "context_tag": "quarterly-promotion-cycle",
  "prior_event_id": "01HW1Y4N5O6P7Q8R9S0T1U2V3W4",
  "pii_flag": false
}
```

### `REVOKE_TIER`

```json
{
  "_schema_version": "1.0.0",
  "entry_id": "01HX5A6B7C8D9E0F1G2H3J4K5L6",
  "ts": "2026-09-01T14:00:00+08:00",
  "actor": { "id": "council_TW", "tier": "L5", "role": "calibration_steward" },
  "action_type": "REVOKE_TIER",
  "target": {
    "id": "revoke_staff_TW_0067_L3_to_L2",
    "type": "recognition",
    "version": "1.0.0",
    "fields": {
      "actor_id": "staff_TW_0067",
      "from_tier": "L3",
      "to_tier": "L2",
      "reason_code": "MODULE_VOID",
      "evidence_event_ids": ["01HX4Z5N6O7P8Q9R0S1T2U3V4W5", "01HX4Z5N6O7P8Q9R0S1T2U3V4W6"]
    }
  },
  "surface": "console", "device_class": "desktop",
  "context_tag": "trigger-rule-fired-MODULE_VOID",
  "prior_event_id": "01HX4Z5N6O7P8Q9R0S1T2U3V4W6",
  "pii_flag": false
}
```

---

## TRAIN domain

### `ENROLL_MODULE`

```json
{
  "_schema_version": "1.0.0",
  "entry_id": "01HW8B9C0D1E2F3G4H5J6K7L8M9",
  "ts": "2026-04-01T09:00:00+08:00",
  "actor": { "id": "staff_TW_0084", "tier": "L1", "role": "explainer" },
  "action_type": "ENROLL_MODULE",
  "target": { "id": "enroll_staff_TW_0084_M4", "type": "training", "version": "1.0.0",
    "fields": { "module_code": "M4", "phase": "builder" } },
  "surface": "line", "device_class": "phone",
  "context_tag": "self-enrolled",
  "prior_event_id": null, "pii_flag": false
}
```

### `COMPLETE_MODULE`

```json
{
  "_schema_version": "1.0.0",
  "entry_id": "01HW9C0D1E2F3G4H5J6K7L8M9N0",
  "ts": "2026-04-29T17:30:00+08:00",
  "actor": { "id": "staff_TW_0084", "tier": "L1", "role": "explainer" },
  "action_type": "COMPLETE_MODULE",
  "target": { "id": "complete_staff_TW_0084_M4", "type": "training", "version": "1.0.0",
    "fields": { "module_code": "M4", "self_assessment": "ready_for_validation" } },
  "surface": "line", "device_class": "phone",
  "context_tag": null,
  "prior_event_id": "01HW8B9C0D1E2F3G4H5J6K7L8M9", "pii_flag": false
}
```

### `VALIDATE_MODULE`

```json
{
  "_schema_version": "1.0.0",
  "entry_id": "01HWA0D1E2F3G4H5J6K7L8M9N0P1",
  "ts": "2026-05-02T11:00:00+08:00",
  "actor": { "id": "staff_TW_0091", "tier": "L4", "role": "designer" },
  "action_type": "VALIDATE_MODULE",
  "target": { "id": "validate_staff_TW_0084_M4", "type": "training", "version": "1.0.0",
    "fields": {
      "module_code": "M4",
      "candidate_actor_id": "staff_TW_0084",
      "outcome": "passed",
      "validation_artifact_uri": "internal://train/validations/2026-05-02/staff_TW_0084_M4_theme_sentence.txt",
      "reviewers": ["staff_TW_0091", "staff_TW_0103", "staff_TW_0028"]
    } },
  "surface": "console", "device_class": "desktop",
  "context_tag": "monthly-validation-batch",
  "prior_event_id": "01HW9C0D1E2F3G4H5J6K7L8M9N0", "pii_flag": false
}
```

---

## RECOVER domain

### `LOG_INCIDENT`

```json
{
  "_schema_version": "1.0.0",
  "entry_id": "01HXY3A4B5C6D7E8F9G0H1J2K3L",
  "ts": "2026-05-17T15:48:02+08:00",
  "actor": { "id": "staff_TW_0084", "tier": "L2", "role": "guide" },
  "action_type": "LOG_INCIDENT",
  "target": { "id": "inc_2026-05-17_lobby_0148", "type": "incident", "version": "1.0.0",
    "fields": {
      "class": "stroller-access-frustration",
      "scenario_code": "C1",
      "severity": "low",
      "visitor_anonymous_id": null,
      "summary_redacted": "Visitor with double stroller could not access east gallery via main route; alternate routing offered."
    } },
  "surface": "line", "device_class": "phone",
  "context_tag": "incident-class-stroller-access",
  "prior_event_id": null, "pii_flag": false
}
```

### `RESOLVE_INCIDENT`

```json
{
  "_schema_version": "1.0.0",
  "entry_id": "01HXY4B5C6D7E8F9G0H1J2K3L4M",
  "ts": "2026-05-17T16:05:00+08:00",
  "actor": { "id": "staff_TW_0091", "tier": "L4", "role": "designer" },
  "action_type": "RESOLVE_INCIDENT",
  "target": { "id": "inc_2026-05-17_lobby_0148", "type": "incident", "version": "1.0.0",
    "fields": {
      "resolution": "Routed via service corridor with escort; visitor departed with neutral sentiment. Filed touchpoint-design backlog for permanent stroller-access signage.",
      "follow_up_event_id": null
    } },
  "surface": "console", "device_class": "desktop",
  "context_tag": "incident-class-stroller-access",
  "prior_event_id": "01HXY3A4B5C6D7E8F9G0H1J2K3L", "pii_flag": false
}
```

### `SCRIPT_UPDATE`

```json
{
  "_schema_version": "1.0.0",
  "entry_id": "01HWZ5N6O7P8Q9R0S1T2U3V4W5X",
  "ts": "2026-06-10T11:20:00+08:00",
  "actor": { "id": "staff_TW_0091", "tier": "L4", "role": "designer" },
  "action_type": "SCRIPT_UPDATE",
  "target": { "id": "script_A1_TW_v3", "type": "script", "version": "1.0.0",
    "fields": {
      "scenario_code": "A1",
      "region": "TW",
      "version_from": "v2",
      "version_to": "v3",
      "change_summary": "Reordered wayfinding to acknowledge east-gallery accessibility detour."
    } },
  "surface": "console", "device_class": "desktop",
  "context_tag": "post-incident-update",
  "prior_event_id": "01HXY4B5C6D7E8F9G0H1J2K3L4M", "pii_flag": false
}
```

### `SCENARIO_REVISE`

```json
{
  "_schema_version": "1.0.0",
  "entry_id": "01HX0Y6P7Q8R9S0T1U2V3W4X5Y6",
  "ts": "2026-06-15T14:00:00+08:00",
  "actor": { "id": "staff_GLOBAL_0007", "tier": "L5", "role": "ambassador" },
  "action_type": "SCENARIO_REVISE",
  "target": { "id": "scenario_C1", "type": "scenario", "version": "1.1.0",
    "fields": {
      "version_from": "1.0.0",
      "version_to": "1.1.0",
      "change_summary": "Added accessibility-recovery as a required L2 component of C1 service recovery."
    } },
  "surface": "console", "device_class": "desktop",
  "context_tag": "global-architecture-update",
  "prior_event_id": null, "pii_flag": false
}
```

### `FEEDBACK_INTAKE`

```json
{
  "_schema_version": "1.0.0",
  "entry_id": "01HX1Z7Q8R9S0T1U2V3W4X5Y6Z7",
  "ts": "2026-05-17T17:00:00+08:00",
  "actor": { "id": "staff_TW_0084", "tier": "L2", "role": "guide" },
  "action_type": "FEEDBACK_INTAKE",
  "target": { "id": "feedback_2026-05-17_0084_0042", "type": "feedback", "version": "1.0.0",
    "fields": {
      "channel": "post-visit-card",
      "sentiment": "positive",
      "themes": ["theme-clarity", "wayfinding-pre-detour"],
      "verbatim_redacted": "Loved the ceramic-glaze story. Was a bit lost finding the east gallery."
    } },
  "surface": "line", "device_class": "phone",
  "context_tag": "scenario-D3",
  "prior_event_id": null, "pii_flag": false
}
```

---

## Notes

- All `entry_id` are ULIDs (sortable; embed timestamp).
- All `ts` are ISO 8601 with timezone.
- `actor`, `target.fields`, `prior_event_id` are typed per `audit-events.json` (post-C9 enrichment).
- `surface` enum: `line | web | console | system`.
- `device_class` enum: `phone | tablet | desktop | system`.
- `pii_flag` is true ONLY if `target.fields` contains identifiable visitor data; staff_id alone does not flip this.
- Verbatim visitor text is redacted on intake; full text (if visitor opted in) lives separately, governed by `/spec/storage.md` §4.
