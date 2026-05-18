# Audit Packet — Status Cover Sheet

Snapshot of where each §10 artifact stands. **Update this file in the
same PR that moves an artifact's status.** No partial credit — `🚧` is
honest, `✅` means a TSMC reviewer could read it cold and not have
questions.

Legend: ✅ done · 🚧 in progress · 🔲 todo · ⬛ N/A until phase

## Spec §10 — TSMC three-party review packet

| # | Artifact | Status | Owner | Lives at |
|---|---|---|---|---|
| 1  | System architecture + data-flow diagrams | 🚧 prose; diagrams pending | Rockie | `compliance/01-architecture-diagram.md` + `docs/architecture.md` |
| 2  | Cross-border data flow diagram          | 🚧 prose; diagram pending | Rockie | `compliance/02-cross-border-data-flow.md` |
| 3  | Per-source ToS compliance               | 🔲 needs per-source memo | Rockie | `compliance/03-source-tos-compliance.md` |
| 4  | Anthropic vendor risk assessment        | 🔲 needs SOC 2 + DPA pulls | Rockie | `compliance/04-anthropic-vendor-risk.md` |
| 5  | Storage / encryption / retention        | 🚧 retention done; encryption stub | Rockie | `docs/data-retention.md` + `compliance/05-storage-encryption-retention.md` |
| 6  | Access control + audit logging          | ✅ matrix + permanent history | Rockie | `docs/authorization-matrix.md` + `prisma/schema.prisma` (`IssueHistory`) |
| 7  | SSO protocol confirmation               | ⬛ Phase 2 deliverable | Rockie | `compliance/07-sso-protocol.md` |
| 8  | PDPA / GDPR / CCPA DPIA                 | 🔲 needs legal input | Rockie + TSMC legal | `compliance/08-data-protection-impact-assessment.md` |
| 9  | Incident response plan                  | 🚧 runbook is operational; policy stub | Rockie | `compliance/09-incident-response-plan.md` + `docs/runbook.md` |
| 10 | Backup + recovery plan                  | 🔲 needs provider RPO/RTO | Rockie | `compliance/10-backup-recovery-plan.md` |
| 11 | Phase 3 migration plan                  | ⬛ Phase 2 Week 11-12 deliverable | Rockie | `compliance/11-phase3-migration-plan.md` |
| 12 | Prompt-injection defense policy         | ✅ five policies in code+doc+eval | Rockie | `docs/prompt-injection-policy.md` |

## Adjacent audit hygiene (not in §10 but expected)

| Item | Status | Lives at |
|---|---|---|
| Pinned dependencies (lockfile committed)    | 🔲 todo — generate package-lock.json | repo root |
| Automated dependency-vulnerability scan     | ✅ npm audit + dependabot weekly | `.github/workflows/ci.yml`, `.github/dependabot.yml` |
| Secret scanning                             | ✅ gitleaks in CI                  | `.github/workflows/ci.yml`, `.gitleaks.toml` |
| Type-check + lint in CI                     | ✅ on PR + main                    | `.github/workflows/ci.yml` |
| Eval regression archive                     | 🚧 workflow exists; not yet routinely run | `.github/workflows/eval.yml`, `eval/audit-runs/` |
| SBOM                                        | 🔲 todo — `npm sbom` or syft       | publish on release |
| GitHub repo secret-scanning enabled         | 🔲 manual: Settings → Security     | repo settings |
| GitHub branch protection on `main`          | 🔲 manual: require CI green to merge | repo settings |

## Running tally

- ✅ done: 4
- 🚧 in progress: 4
- 🔲 todo: 9
- ⬛ deferred-by-phase: 2

Honest read: the **technical** items are mostly green (audit trail,
authz matrix, prompt-injection defense, dependency scan, secret scan).
The **legal / policy** items are mostly todo (vendor risk, DPIA,
backup/RPO, source ToS memos) — they need real legal input or
provider attestations, not just engineering. Don't fake them.
