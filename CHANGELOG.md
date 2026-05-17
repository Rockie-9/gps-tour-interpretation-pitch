# Changelog

The deck is versioned per V2.7 of the build plan. Each release maps to a tag on the `claude/enhance-tour-interpretation-YOYrF` branch (or `main` once merged).

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/), but kept terse — one line per change, grouped by phase code.

---

## [Unreleased] — V2 in progress (items 1–35 from the 10-persona review)

### Phase F · Foundation (substrate that everything else inherits)

- **F0** · status tracker (`STATUS.md`), smoke test (`tools/smoke-test.sh`), changelog (this file).
- **F2 + F5** · accessibility refactor (`aria-expanded` on all `<details>`, Space-key handler exempts modifier keys, global keydown exempts form/contenteditable focus, `prefers-reduced-motion` now disables `scroll-snap`); dark-mode auto via `prefers-color-scheme: dark` + manual override via `data-theme`.
- **F3** · language toggle infrastructure (`<html data-lang="all|tc|en|jp">`, footer pills with `aria-pressed`, localStorage persistence, `aria-hidden` propagation to AT).
- **F4** · stable deep-link anchors (`id="slide-NN"` on every slide; F4-v2 hash handler resolves both `#id` and `#data-anchor`).
- **F6 + F1** · service worker (`sw.js`) for offline support; F1 self-hosted fonts deferred-binary per `/spec/dependencies.md` plan (Google Fonts CDN primary; SW caches them after first load).
- **F7** · deck versioning meta + footer (`v2.0.0 · 2026-05-17 · changelog · feedback`).
- **F8** · third-party dependency audit at `/spec/dependencies.md`; only Google Fonts CDN is load-bearing; everything else degrades gracefully.

### Phase R · Routing

- **R1** · entry-router panel inside the cover slide with six entry routes (Read-in-order · Executive · Staff · Board · Engineer · Calibration). Semantic anchor links.
- **R2** · new Slide 02 — Executive one-pager (scope · cost/desk · timeline · payback · decision ask). Cost and Payback marked with `[FIN-INPUT]` placeholders pending Finance.
- **R3** · new Slide 17 — Visitor experience ladder (L0–L5 from visitor side, mirroring staff Recognition ladder).
- **R4** · bundled slide-number rebump 19 → 21 slides.
- **R5** · "Today's three" capability subset on Slide 11 (Layer 02), with phase selector (Explorer · Builder · Architect).
- **R6** · within-language priority inversion on visitor-facing slides (when `data-lang="jp"`, JP renders first within `.tri-stack`).

### Phase C · Content depth (V2 additions on top of iteration-2)

- **C9** · `/spec/audit-events.json` bumped to v0.2.0 (field types, per-action target_fields schema, version_note). New: `/spec/versioning.md` (SemVer policy, append-only contract), `/spec/storage.md` (hot/warm/cold tier placement, PII per tier, region-locality, DR), `/spec/payloads.md` (14 sample event payloads). spec/README.md now carries a honest-state banner.
- **C10** · `/curriculum/m1..m9/` — 9 module cards (Explorer M1–M3 · Builder M4–M6 · Architect M7–M9), each at v0.1 outline with explicit "SME content still needed" sections. M5 (cross-cultural) flagged as largest SME ask.
- **C11** · `/artifacts/` — three visitor-touchable artifact specs: desk-card.md, parting-lines.md (3 intensities × 6 tiers), post-visit-signal.md (handwritten next-day note).
- **C12** · `/spec/i18n.md` — measurement, date, name-order, address, currency, honorifics, RTL preparation. Staged-languages note (DE, zh-Hans) for Hans (#6) regional honesty.
- **C13** · Regional framing confirmed honest in deck (existing "JP, DE; CN, US-AZ from year 2" language); /spec/i18n.md formalises the staging.

### Phase P · Polish + meta

- **P1** · client-side search (`/` opens overlay; indexes slides + disclosures; arrow-key navigation; jumps to anchor).
- **P2** · print fidelity — entry router, search overlay, language toggle, theme toggle all hidden in print.
- **P3** · RTL preparation documented in `/spec/i18n.md` §9.
- **P4** · onboarding microcopy above entry router on cover slide (trilingual).
- **P5** · feedback channel — `.github/ISSUE_TEMPLATE/deck-feedback.yml` + footer link auto-prefills deck version + slide anchor + language mode.
- **P6** · README discoverability — `/spec/`, `/curriculum/`, `/artifacts/`, `STATUS.md`, `CHANGELOG.md` all linked from the top-level README.
- **P7** · plan-meta (effort, owner, reversibility, success criterion, dependencies) covered in V2.5 of the plan file.
- **P8** · validation method at `/spec/validation.md` — 10-persona panel as reusable evaluation harness.
- **P12** · accessibility commitments + test plan at `/spec/accessibility.md` (NVDA / VoiceOver / keyboard / reduced-motion / dark-mode tests).
- **P9** · GitHub tracking issues per phase (created at end of V2 build).

### Parked for V3 (items 36–40 from the 10-persona review)

- Split deck into multiple artifacts (partially done via spec/curriculum/artifacts; formal split deferred).
- Router-as-friction (mitigated by "Read in order" default).
- Default-trilingual-may-be-wrong (toggle ships; inverting default deferred).
- Desirability research (proposed in P8; V3 commissions).
- Journey-mapping per persona (partially via routing; full mapping deferred).

---

## [2.0.0-iteration-2] — 2026-05-17 (commit `c900daf`)

System development pass: trilingual (TC·EN·JP), 2 new slides (Substrate + Recognition), spec scaffolding (`/spec/`), hospitality lineage anchors, brand-idea restraint.

## [1.x] — earlier mobile RWD overhaul, language consistency fixes, sourcing pass, omotenashi voice pass, design upgrade. See `git log` for full history.
