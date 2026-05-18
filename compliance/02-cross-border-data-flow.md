# Artifact 2 — Cross-Border Data Flow

**Status**: 🚧 prose; map diagram pending
**Spec ref**: §10 item 2

## Why this matters

A Dresden-region article triggers data flow across multiple legal
jurisdictions:

1. **Source** — published in Germany (GDPR-territory).
2. **Fetcher** — Vercel serverless function in US-East (or wherever
   Vercel routes it).
3. **Inference** — Anthropic API in US (data transit + processing).
4. **Storage** — Postgres in the region chosen at provider setup
   (Supabase US-East or EU-West; Neon US or EU).
5. **Reader** — GPS analyst likely in Taiwan / Hsinchu HQ.

GDPR Articles 44-50 (international transfers) and the EU-US Data
Privacy Framework apply. The TSMC reviewer needs a one-page map.

## Current configuration

| Hop | Provider | Region | Legal basis (current) |
|---|---|---|---|
| Source publisher | various | DE, JP, US, TW, etc. | publicly published |
| Fetcher → Anthropic | Vercel | US-East default | Anthropic DPA |
| Anthropic inference | Anthropic | US | DPA + SCCs |
| Postgres | Supabase or Neon | **TBD — set during onboarding** | DPA + SCCs |
| HITL access | TSMC GPS team | TW | internal |

## Decisions still needed

- **Postgres region** — pick EU-West for GDPR-sensitive workloads,
  US-East for latency. Spec doesn't dictate. Recommend EU-West if
  Dresden volume is non-trivial.
- **Vercel routing** — Vercel functions execute in the region nearest
  the user; for crons, that's a configurable single region. Pin to
  the same region as Postgres.
- **Data residency for Anthropic** — Anthropic Enterprise offers
  region pinning; the default Pay-as-you-go API does not. Phase 3
  decision per §4.2.

## How to produce the diagram

1. Static world-map image with arrows for each hop.
2. Color hops by GDPR scope (in-EU vs cross-border).
3. Caption every cross-border arrow with the legal basis.

## Sign-off prerequisites

- Postgres region committed.
- Anthropic DPA on file.
- Standard Contractual Clauses for any non-Adequacy-decision flows.
