# GPS Tour Interpretation Pitch Deck

詢問台導覽解說能力架構 v1.2 提案 · A Capability Architecture Proposal for the Information Desk · 案内所インタプリテーション能力構造 v1.2 提案

## Overview

**19-slide trilingual pitch deck** (TC · EN · JP) proposing a six-layer capability architecture for developing GPS Information Desk staff from "information providers" into "brand ambassadors." Now includes the operational substrate (LINE-mobile + Web tooling, full logs, audit mechanism) and the recognition system that the capability ladder produces.

## Structure

- **Cover** → **The Setup** (high-frequency contact insight) → **The Tension** (gap between current state and brand promise)
- **PART I — The Insight** (international benchmarks, missing capabilities, missing scenarios)
- **PART II — The Architecture** (six layers + dual calibration system)
- **PART III — The Substrate** (LINE-mobile + Web tooling, full logs, audit governance) — with companion spec files in [`/spec/`](./spec/)
- **PART IV — Recognition** (three-tier honor system: craft · status · conditions)
- **The Path** (brand integration, roadmap with KPIs/owners, decision request)
- **Closing** (brand promise)

## Architecture Summary

| Layer | Name | Question Answered |
|-------|------|-------------------|
| 06 | Brand Integration | How this aligns with GPS brand |
| 05 | Operations | How people learn, how we verify |
| 04 | Application | Where capabilities get used (10 scenarios) |
| 03 | Maturity | How far each capability develops (L0–L5) |
| 02 | Capability | What competencies to develop (12, in 3 clusters) |
| 01 | Philosophy | Why we interpret (Tilden / CPTED / "Before you need it.") |

## Substrate (Slide 14)

The system runs on a two-surface tooling layer for staff workflow, a 5W1H append-only log, and a four-domain audit mechanism. The substrate's contract lives in `/spec/`:

- [`/spec/logging.md`](./spec/logging.md) — log schema, retention tiers, PII rules.
- [`/spec/audit-events.json`](./spec/audit-events.json) — taxonomy of 4 audit domains × 14 action types × 4 trigger rules.
- [`/spec/README.md`](./spec/README.md) — trace table linking deck claims to spec fields.

## Controls

- `←` / `→` or `↑` / `↓` — navigate between slides
- `Space` / `PageDown` — next slide
- `Home` / `End` — first / last slide
- `F` — toggle fullscreen
- Click `+` chevrons on scenario rows and the assessment BARS row to reveal detail (Slides 12, 13)
- Click language tabs on the BARS exemplar (Slide 11) to compare capabilities 04 and 05

## Brand Alignment

Aligned with GPS Brand v3.6: "在您需要之前 · Before You Need It · 必要となる、その前に." Considerate Partner positioning. Pillar 02 Journey Protection. Three-Year Arc (Trust 2026 / Guardianship 2027 / Anticipation 2028).

## Version

v1.2 · 2026-05 · For GPS Strategy & Transformation
