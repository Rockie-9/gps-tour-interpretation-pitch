# Artifact 9 — Incident Response Plan

**Status**: 🚧 operational runbook done; policy-level IR plan stub
**Spec ref**: §10 item 9

## What this artifact is

The TSMC reviewer wants two distinct documents:

1. **Operational runbook** — what the engineer does at 02:00 when
   pages fire. *We have this:* [`docs/runbook.md`](../docs/runbook.md).
2. **Incident response plan** — governance, severity levels,
   notification timelines, post-mortem expectations. *This is the
   missing piece.*

## Severity classification

| Severity | Definition | Time to engage | Notification |
|---|---|---|---|
| SEV-1 | Data breach (any disclosure of derived intelligence outside TSMC GPS) | immediate | TSMC InfoSec + legal within 4h |
| SEV-2 | Production down > 4h, or Issue judgments materially wrong (e.g. mass false-positive escalation) | < 1h | GPS team lead, weekly review note |
| SEV-3 | Single source down, queue stuck < 4h, deploy failure | < 4h | weekly review note |
| SEV-4 | Cosmetic, eval regression, individual HITL correction | next business day | weekly review note |

## Notification timelines

| Audience | When | How |
|---|---|---|
| GPS team lead | SEV-1 / 2 | Email / Teams |
| TSMC InfoSec | SEV-1 only | Per TSMC playbook |
| TSMC legal | SEV-1 with personal-data exposure | Per TSMC playbook |
| External (Anthropic / Vercel / DB provider) | When their infra is implicated | Provider portal |
| Sources whose ToS may have been breached | Case-by-case | Email contact in ToS |

## Roles

For Phase 1-2: one person (Rockie). The plan acknowledges this
(spec §14.5 bus-factor-1) and compensates with documentation, not by
pretending there's a rotation.

For Phase 3: TSMC IT integration will fold this system into the
existing IR rotation. Update this artifact then.

## Post-mortem expectation

Any SEV-1 or SEV-2 incident triggers a post-mortem with:
- timeline (UTC)
- root cause(s)
- one ADR if architecture needs to change
- one runbook entry if response needs to improve
- one eval ground-truth row if a quality regression slipped through

Post-mortems are committed to `docs/postmortems/` (create on first
need; not pre-created).

## What this plan does **not** do

- Threat hunting / red-team rotations — out of scope for this system.
- Forensic data preservation procedures — escalate to TSMC InfoSec.
- Crisis communications with media — escalate to TSMC PR.
