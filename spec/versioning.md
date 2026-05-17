# Substrate · Event versioning policy

V2 step C9 (item 10). The audit-events.json catalogue is a contract between the deck's Slide 14 (Substrate) claims and any downstream tool that implements logging/audit. This document defines how that contract evolves without breaking existing logs.

---

## 1. What is versioned

| Object | Versioning style |
|---|---|
| `audit-events.json` document | semver — `version` field at root |
| Each `action_type` (e.g. `OBSERVE_BARS`) | semver per action_type, stored as `version` field on each entry in `action_types[]` |
| Per-event log entry payload (in `logging.md` samples) | schema version embedded as `_schema_version: "X.Y.Z"` field |
| `audit_domains[]` | not independently versioned (rare changes; bumps the document) |
| `trigger_rules[]` | not independently versioned (bumps the document) |
| `evidence_schema` | not independently versioned (bumps the document) |

---

## 2. SemVer semantics (per action_type and document)

- **MAJOR** — backwards-incompatible change. Old logged events become unparseable or semantically wrong without migration.
  Examples: renaming a field, removing a field, narrowing an enum, changing a field type (string → number).
- **MINOR** — backwards-compatible addition. Old logged events remain valid; new producers can emit new fields; old consumers ignore unknown fields.
  Examples: adding an optional field, adding an enum value, adding a new action_type.
- **PATCH** — clarification, documentation, sample fix. No schema change.
  Examples: typo in description, additional sample payload, README rewrite.

---

## 3. Append-only catalogue

Once an `action_type.code` is published (MINOR or MAJOR bump), it is **never removed**. Even if the action becomes unused, the entry remains so historical logs continue to parse.

Deprecation flow (instead of removal):

1. Add `"deprecated": true` and `"deprecated_in": "X.Y.Z"` to the action_type entry. MINOR bump.
2. Add `"replaced_by": "OTHER_CODE"` if there is a successor.
3. Producers stop emitting the deprecated action after their next release.
4. Consumers continue to accept it indefinitely.
5. Two MAJOR versions later, the deprecated entry may be marked `"removed_from_emitters": true` but still listed for parser tolerance.

---

## 4. Schema-level versioning of payloads

Every event payload (per `logging.md` sample) MUST include:

```json
{
  "_schema_version": "1.0.0",
  ...
}
```

Producers emit the version of the schema they were built against. Consumers MUST tolerate any version equal or older than the latest they know about, and SHOULD log a warning when they encounter a newer-than-known version.

---

## 5. Documentation requirement per change

Every commit that bumps `audit-events.json` `version` MUST:

1. Update the root `version` field.
2. Add an entry to `CHANGELOG.md` under `## [spec/audit-events.json] vX.Y.Z`.
3. Describe the change in terms of MAJOR / MINOR / PATCH.
4. For MAJOR bumps: include a migration script or migration guidance.
5. For MINOR bumps adding action_types: include at least one sample payload in `logging.md`.

---

## 6. Cross-region drift handling

Different regions (HQ-TW, JP, DE, CN, US-AZ) may be on different schema versions at any moment. The drift rule:

- Producers older than current MAJOR — events accepted; consumer logs warning.
- Producers newer than current MAJOR — events rejected; producer must roll back or consumer must upgrade.
- All regions MUST be within ONE MAJOR of the canonical version at any quarterly calibration cycle.

---

## 7. Out of scope

- Wire-format versioning (JSON / Protobuf / etc.) — the audit-events.json document is JSON only.
- Storage-format versioning — see `/spec/storage.md`.
- Implementation API versioning — no API is built in V2; this becomes relevant in V3 only.

---

## Cross-reference

| Question | See |
|---|---|
| What action types exist? | `audit-events.json` → `action_types[]` |
| What does an event payload look like? | `logging.md` → *Sample entries* |
| Where do old events live after the schema bumps? | `storage.md` → *Retention tiers* + *Migration on read* |
| How is the spec discovered? | `README.md` of this dir |
