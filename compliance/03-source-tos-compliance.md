# Artifact 3 — Per-Source ToS Compliance

**Status**: 🔲 todo — one row complete per active source before Phase 2
**Spec ref**: §10 item 3

## Why this matters

We retrieve, store (90 days for raw text per §14.2), and produce
derived analysis from third-party content. Each source's Terms of
Service governs what derived use, storage period, and republication
is allowed. The TSMC reviewer expects a per-source memo.

## Template — one row per source

| Source | License / ToS link | Permits caching? | Permits derived analysis? | Retention limit | Attribution required? | Confirmed by | Date |
|---|---|---|---|---|---|---|---|
| NewsAPI         | https://newsapi.org/terms | (read) | (read) | (read) | (read) | _Rockie_ | _date_ |
| Google News RSS | https://policies.google.com/terms | (read) | (read) | (read) | (read) | _Rockie_ | _date_ |
| ACLED           | https://acleddata.com/terms-of-use-and-attribution-policy-for-acled-data | (read) | (read) | (read) | yes (attribution required) | _Rockie_ | _date_ |

Each row should be backed by a saved PDF of the relevant ToS section
in this folder (gitignored under `compliance/source-tos-snapshots/` —
not committed because some publishers' ToS text is itself copyrighted).

## Hard rules for new sources

A new source cannot be added to `lib/sources/registry.ts` without:

1. A row in the table above filled in.
2. A snapshot of the ToS at onboarding time saved locally.
3. An ADR if anything in the ToS conflicts with §14.2 retention.

If any source's ToS materially changes, re-confirm and re-date the row.

## Special cases to think about

- **NewsAPI** developer plan disallows production use; Phase 1
  requires upgrading to the Business plan before going live to a
  10-person test cohort.
- **Google News RSS** is not officially supported by Google for
  programmatic use; relying on it long-term carries TOS-grey-area
  risk. Spec §6.6 plans a replacement in Phase 3.
- **ACLED** allows non-commercial research use with attribution;
  internal TSMC use may not qualify as "non-commercial". Confirm
  before Phase 2.
