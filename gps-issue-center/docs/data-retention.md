# Data Retention Policy

Direct transcription of spec v0.4 §14.2. This document is what the TSMC
three-party review reads (§10 item 5).

## Table

| Data class | Retention | Deletion rule |
| --- | --- | --- |
| `ingest_queue` rows with `status = done` | 30 days | Monthly cron clears done rows older than 30d. |
| `ingest_queue` rows with `status = failed` or `suspicious` | 90 days | Same cron; longer because they're forensically useful. |
| `issues.raw_content` (in metadata) | 90 days | After 90d the raw text is nulled; structured fields stay. |
| `issues` (structured) + `metadata` | 2 years | Cold-storage archive after 2y (Phase 3 only). |
| `issue_history` (audit trail) | Permanent (internal only) | Never deleted. |
| `cost_log` | 2 years | Aligned with `issues`. |
| `system_metrics` | 90 days | Rolling delete. |
| Users (NextAuth `users` table) | Active + 1 year | Account deleted 1 year after user leaves GPS. |

## Rationale

- **Queue rows** are operational state, not derived intelligence. 30 days
  is plenty for replay and incident forensics; longer wastes space.
- **`raw_content` nulling at 90 days** removes the verbatim third-party
  text while preserving our derived analysis. This lowers our exposure
  under publisher ToS that limit how long we may store article copies.
- **`issue_history` is permanent** because the spec §7 audit trail is
  the only artifact that lets us answer "did we get this right at the
  time, given what we knew?" in a TSMC review.
- **Users active+1y** is a compromise between SSO-cleanup convenience
  and forensic reproducibility.

## GDPR / CCPA touchpoints

The system processes public-source articles. Articles themselves are
public; our **derived** triage outputs about named individuals are
processing of personal data under GDPR.

- **Dresden** activity is covered by GDPR. Dresden-region issues that
  name individuals are subject to Article 17 (right to erasure) requests.
- **Arizona** activity is covered by CCPA. Equivalent SAR provisions.
- The Phase 3 cutover (§4.2) is the right time to stand up a Subject
  Access Request workflow. Don't build it in Phase 1.

## Cron implementation

The retention cron is **not** in the v0.4 Phase 0 scope. Track it as a
Phase 1 task. Until then, `ingest_queue` and `system_metrics` will grow
unbounded — manageable for Phase 0 development; not for Phase 2 with
real testers.

## Backups

- Phase 1-2 backups follow the managed provider's defaults (Supabase /
  Neon daily snapshots + 7-day point-in-time recovery).
- Phase 3 backups follow TSMC IT policy.
- We do **not** export backups to a separate location. The TSMC
  three-party review may push back; document the alternative if so.
