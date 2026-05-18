# Compliance / Audit Packet

This folder is the TSMC three-party-review packet (spec v0.4 §10) plus
adjacent audit hygiene. Twelve numbered artifacts, each in its own file.
`STATUS.md` is the cover sheet — single table, what's done, what's not.

## How to use

- **For the auditor**: read `STATUS.md`, then the numbered files in order.
- **For the maintainer**: every Phase-2 sprint should move at least one
  artifact from `🔲 todo` to `✅ done`. Update `STATUS.md` in the same PR.
- **For Phase 3 cutover**: artifacts 7 (SSO) and 11 (Phase-3 migration)
  must be ✅ before the cutover PR ships.

## What lives elsewhere

Some §10 items already have a canonical doc; the artifact file here is
a one-paragraph stub that points to it.

| Artifact | Canonical doc |
| --- | --- |
| 5  storage / encryption / retention | `docs/data-retention.md` |
| 6  access control + audit logging   | `docs/authorization-matrix.md` + `prisma/schema.prisma:IssueHistory` |
| 12 prompt-injection policy          | `docs/prompt-injection-policy.md` |

The other nine (1-4, 7-11) need primary authoring here.
