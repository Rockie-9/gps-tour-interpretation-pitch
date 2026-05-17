# Changelog

Format: per-version section. Reverse chronological. Honest about gaps.

---

## [3.0.0] — 2026-05-17 — Handbook

**Major directional change.** Replaces the v2 pitch deck with a static knowledge handbook.

### Why

The v2 deck was a 21-slide linear narrative. The user pointed out (correctly) that the actual need is a **platform / handbook**: searchable, deep-linkable, practice-tool — not a presentation. A deck is read once; a handbook is consulted repeatedly. The user explicitly chose:
1. Static handbook (not LMS)
2. Pure frontend, Vercel static (no backend)
3. Minimum viable first, no 5-user gating
4. Keep content, rebuild shell

### Added

- `index.html` — handbook shell (~70 lines)
- `app.js` — hash router + JSON loader + renderer + search + language picker + theme toggle + localStorage checklist
- `styles.css` — design tokens + components, dark-mode aware
- `data/capabilities.json` · `data/scenarios.json` · `data/bars.json` · `data/modules.json` · `data/tiers.json` — content extracted to JSON
- `AUDIT.md` — honest audit log per iteration

### Changed

- `sw.js` — updated to cache handbook assets (shell + JSON data)
- `tools/smoke-test.sh` — checks content counts match claims (12/10/12/9/6)
- `README.md` — rewritten for handbook
- `STATUS.md` — handbook state replaces deck state

### Removed

- The v2 21-slide deck structure (cover, exec one-pager, setup, tension, divider, premise, 6 layer slides, substrate slide, recognition slide, visitor ladder, brand slide, capacity, roadmap, decision, closing)
- Scroll-snap navigation
- Entry router (replaced by handbook navigation)
- "Today's three" widget (concept may return as a capability-page feature, deferred)
- Trilingual CSS-display-hide rules (replaced by JSON-key picking → no Safari Reader leakage)

### Preserved (carried from v2)

- `/spec/` — all 10 substrate spec files (logging, audit-events.json, payloads, versioning, storage, i18n, accessibility, validation, dependencies, README)
- `/curriculum/` — 9 module outline cards
- `/artifacts/` — desk-card, parting-lines, post-visit-signal design specs
- `/.github/ISSUE_TEMPLATE/deck-feedback.yml`
- 12 capabilities (+ definitions + hospitality anchors)
- 10 scenarios (+ register anchor on B1)
- 12 illustrated BARS anchors (capabilities 04, 05)
- 9 modules with content/validation
- 6 tiers with craft/status/conditions/visitor-experience

### Known gaps in v3.0.0

- 60 of 72 BARS anchors still SME-pending
- M5 cross-cultural curriculum still SME-pending (largest gap)
- DE + zh-Hans still staged-only
- 5-power-user feedback not collected (user chose minimum-viable-first)
- No accounts → checklist is per-browser

See [AUDIT.md § v3.0.0](./AUDIT.md#v300--handbook--2026-05-17) for the complete honest accounting.

---

## [2.0.0] — 2026-05-17 — Deck (RETIRED, see v3.0)

Merged to main in `d9699ad`. Pitch deck format. Replaced by v3 handbook.

Iteration-2 (`c900daf`): trilingual TC+EN+JP, Substrate + Recognition slides, /spec/ scaffolding.

V2 (`16d778d` through `77b364c`):
- F0–F8 (foundation): status tracker, smoke test, font fallback plan, accessibility refactor, dark mode, service worker, deck versioning, dependency audit
- R1–R6 (routing): entry router, executive one-pager, visitor ladder slide, slide renumber to 21, today's three, language priority inversion
- C9–C13 (content): /spec/ completeness, /curriculum/ 9 cards, /artifacts/ 3 specs, /spec/i18n.md, regional honesty
- P1–P12 (polish): search, print, RTL prep, onboarding, feedback channel, README discoverability, plan-meta, validation method, tracking issues, accessibility tests

Tracking issues: #2 (Phase F), #3 (Phase R), #4 (Phase C), #5 (Phase P).

PR #6 (toggle fix) closed as obsolete — entire shell replaced in v3.

---

## [1.x] — Earlier

Mobile RWD overhaul, sourcing pass, omotenashi voice pass, design upgrade v1.2. See `git log`.
