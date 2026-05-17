# GPS Tour Interpretation Pitch Deck

詢問台導覽解說能力架構 v2.0 提案 · A Capability Architecture Proposal for the Information Desk · 案内所インタプリテーション能力構造 v2.0 提案

## Overview

**21-slide trilingual pitch deck** (TC · EN · JP) proposing a six-layer capability architecture for developing GPS Information Desk staff from "information providers" into "brand ambassadors." Now includes the operational substrate (LINE-mobile + Web tooling, full logs, audit mechanism), the recognition system that the capability ladder produces, an executive one-pager view, a visitor-experience ladder showing what changes from the visitor's side, and an in-deck reader-router that adapts the entry point to who you are.

## Structure

- **Cover** (with reader-router: pick Executive / Staff / Board / Engineer / Calibration / Read-in-order)
- **Executive one-pager** — scope · cost · timeline · ask
- **The Setup** → **The Tension** (gap between current state and brand promise)
- **PART I — The Insight** (international benchmarks, missing capabilities, missing scenarios)
- **PART II — The Architecture** (six layers + dual calibration system)
- **PART III — The Substrate** (LINE-mobile + Web tooling, full logs, audit governance) — companion spec at [`/spec/`](./spec/)
- **PART IV — Recognition** (three-tier honor system: craft · status · conditions)
- **Visitor Ladder** — same architecture, re-read from the visitor's seat
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

## Companion directories

The deck is the narrative; these directories are the source of truth.

- [`/spec/`](./spec/) — **Substrate contracts**: log schema, audit taxonomy, retention storage, event versioning, sample payloads, internationalisation rules, third-party dependency audit, accessibility commitments, validation method.
- [`/curriculum/`](./curriculum/) — **9 module cards (M1–M9)** for the three-phase training (Explorer · Builder · Architect). Each card honest about which SME content still needs filling.
- [`/artifacts/`](./artifacts/) — **Visitor-touchable specs** that take the brand idea out of the deck and into the visitor's world: desk card design, parting-line variants per tier, post-visit handwritten signal.
- [`STATUS.md`](./STATUS.md) — V2 build state. Tracks items 1–35 from the 10-persona review across four phases (Foundation → Routing → Content → Polish).
- [`CHANGELOG.md`](./CHANGELOG.md) — per-version changes; linked from the in-deck footer.

## Controls

- `←` / `→` or `↑` / `↓` — navigate between slides
- `Space` / `PageDown` — next slide
- `Home` / `End` — first / last slide
- `F` — toggle fullscreen
- `/` — open client-side search across slides + disclosures
- Click `+` chevrons on scenario rows and the assessment BARS row to reveal detail
- Click language tabs on the BARS exemplar (Slide 12) to compare capabilities
- Footer pills: language toggle (ALL · 中 · EN · JP) · theme toggle (auto · ☀ · ☾)

## Accessibility

V2 ships explicit accessibility commitments documented at [`/spec/accessibility.md`](./spec/accessibility.md): `aria-expanded` on disclosures, language-toggle `aria-hidden` propagation to AT, modifier-key exemption on Space-key (so NVDA's read-current-line still works), `prefers-reduced-motion` honored for scroll-snap, dark-mode auto + manual override.

Known limitations are documented honestly in that file.

## Offline

A service worker (`sw.js`) caches the deck shell on first load. Subsequent visits work offline, including when the Google Fonts CDN is blocked (font fallbacks documented in [`/spec/dependencies.md`](./spec/dependencies.md)).

## Brand Alignment

Aligned with GPS Brand v3.6: "在您需要之前 · Before You Need It · 必要となる、その前に." Considerate Partner positioning. Pillar 02 Journey Protection. Three-Year Arc (Trust 2026 / Guardianship 2027 / Anticipation 2028).

The brand idea is manifest in details (recognition, parting lines, visitor ladder, scenario success criteria) rather than labelled. The literal `BRAND IDEA` eyebrow appears exactly once — on the Brand slide.

## Feedback

Footer "Feedback ↗" link opens a [GitHub issue template](./.github/ISSUE_TEMPLATE/deck-feedback.yml) pre-filled with the deck version, current slide anchor, current language mode, and reader-view selection. Any persona is welcome.

## Version

v2.0 · 2026-05 · For GPS Strategy & Transformation
