# Artifact 4 — Anthropic Vendor Risk Assessment

**Status**: 🔲 todo — pull attestations + complete checklist before Phase 2 submission
**Spec ref**: §10 item 4

## Why this matters

Anthropic is a third-party processor (or sub-processor, depending on
how you model it). Article-content text and the derived triage
summary both leave our perimeter when we call the API. The TSMC
reviewer expects the standard vendor risk packet.

## Checklist

| Item | Status | Source | Last refreshed |
|---|---|---|---|
| SOC 2 Type II report                          | 🔲 request via portal | trust.anthropic.com | — |
| ISO 27001 certification                       | 🔲 request          | trust.anthropic.com | — |
| Data Processing Addendum (DPA)                | 🔲 sign during Phase 2 | Anthropic Trust Center | — |
| "No training on customer data" clause         | ✅ default for API   | Anthropic ToS         | (verify quarterly) |
| Standard Contractual Clauses (EU transfers)   | 🔲 include with DPA | Anthropic Trust Center | — |
| Data residency option                         | ⬛ Pay-as-you-go: US only; Enterprise: region-pinned | per §4.2 Phase 3 plan | — |
| Subprocessor list                             | 🔲 request          | Anthropic Trust Center | — |
| Vulnerability disclosure policy / contact     | 🔲 record           | security@anthropic.com | — |
| Service availability SLA                      | 🔲 record current   | Anthropic ToS / docs   | — |
| Data deletion procedure on contract end       | 🔲 confirm in DPA   | DPA                    | — |
| Incident notification timeline                | 🔲 record (typically 72h) | DPA              | — |

## How to complete

1. Request access to **Anthropic Trust Center** (https://trust.anthropic.com).
2. Pull each artifact above; save copies to TSMC document management
   (not this repo — they may be NDA-protected).
3. Fill each row with the attestation date + reviewer name.
4. Re-pull annually or on contract renewal, whichever is sooner.

## Risks to flag in the TSMC packet

- **Training-data clause** — the default Anthropic API does not train
  on inputs, but this is policy-driven (revocable in ToS update) not
  contract-driven. Recommend the DPA to lock it.
- **Sub-processor changes** — Anthropic uses AWS for inference
  infrastructure. AWS region & data-handling commitments cascade.
- **Pay-as-you-go has no data-residency guarantee.** Phase 3
  cutover to Enterprise / Bedrock / Vertex resolves this; document
  the gap during Phase 1-2.
