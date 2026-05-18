# Artifact 5 — Storage, Encryption, Retention

**Status**: 🚧 retention done (`docs/data-retention.md`); encryption section needs explicit statement
**Spec ref**: §10 item 5, §14.2

## What this artifact is

A single document the reviewer reads to understand: where data sits,
how long it sits, and how it's protected at rest and in transit.

## Retention

Canonical reference: [`docs/data-retention.md`](../docs/data-retention.md).

Summary: queue rows 30 days, raw article text nulled at 90 days,
derived issue data 2 years, audit history permanent (internal only),
user records active+1y.

## Encryption (this is the section that's missing)

### At rest

| Data | Storage | Encryption |
|---|---|---|
| `issues`, `issue_history`, etc.   | Postgres @ Supabase / Neon | AES-256 (provider default) |
| Backups                          | Provider-managed snapshots  | AES-256 |
| Eval ground truth + audit runs   | Git (GitHub-managed)        | AES-256 server-side |
| Prompts                          | Git (GitHub-managed)        | AES-256 server-side |
| Secrets (API keys, DB creds)     | Vercel Environment Variables | AES-256, KMS-backed |

### In transit

| Hop | Protocol |
|---|---|
| Browser → Vercel                 | TLS 1.2+ |
| Vercel function → Postgres       | TLS (required; reject non-TLS) |
| Vercel function → Anthropic API  | TLS 1.2+ |
| Vercel function → source APIs    | HTTPS |
| Vercel function → Resend (email) | HTTPS |

## Things to confirm before audit submission

- [ ] Postgres provider's documented encryption-at-rest (Supabase docs:
      AES-256 via AWS; Neon docs: AES-256 via AWS).
- [ ] Vercel Environment Variables encryption-at-rest documentation.
- [ ] TLS minimum version enforced — Next.js / Vercel does TLS 1.2+ by
      default; document this rather than configure it.
- [ ] If TSMC IT requires client-side field-level encryption for any
      derived data (unlikely for OSINT, possible for actor names),
      open an ADR.

## Out of scope

We do **not** encrypt the raw article text (`raw_content`)
client-side before Postgres insert. The text is public-source; the
threat model is provider compromise, not content secrecy. Document
this so the reviewer doesn't expect field-level encryption.
