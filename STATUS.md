# V2 STATUS · live tracker for items 1–35

This file is the source of truth for V2 build state. It is updated with every commit. If a session is interrupted, this is what the next session reads first.

V2 plan source: `/root/.claude/plans/develop-and-enhance-the-unified-hare.md` (sections V2.0–V2.9).

Legend: ⬜ planned · 🟡 in-progress · ✅ shipped · 🚧 shipped@v0.1 (SME content deferred) · ⛔ blocked-on-SME / finance / translator

---

## Phase F · Foundation (substrate)

| Step | Items | State | Notes |
|---|---|---|---|
| F0  | 35 | ✅ | STATUS.md + tools/smoke-test.sh + CHANGELOG.md landed |
| F1  | 13, 22 | 🚧 | Self-host plan documented in `/spec/dependencies.md`; F6 SW caches Google Fonts after first load; full binary commit deferred (repo-size compromise) |
| F2  | 9, 24 | ✅ | aria-expanded on details, Space-key handler exempts modifier keys, scroll-snap respects prefers-reduced-motion |
| F3  | 9 | ✅ | data-lang on `<html>`, CSS rules + aria-hidden propagation, localStorage persistence, footer pills |
| F4  | 20 | ✅ | id="slide-NN" + data-anchor="..." on every slide; hash handler resolves both; auto-opens ancestor details chain |
| F5  | 23 | ✅ | prefers-color-scheme: dark + manual override via data-theme; footer pills |
| F6  | 25 | ✅ | /sw.js cache-first for shell, network-first for external |
| F7  | 17 | ✅ | meta version + build-date + fixed footer (version · changelog · feedback) |
| F8  | 13 (gen) | ✅ | /spec/dependencies.md lists all third-party deps + fallback strategy |

## Phase R · Routing

| Step | Items | State | Notes |
|---|---|---|---|
| R1  | 1, 2, 37 | ✅ | Entry router inside cover with 6 routes (Read-in-order default, Exec, Staff, Board, Engineer, Calibration) |
| R2  | 3, 7, 14 | 🚧 | Exec one-pager slide shipped; cost/payback are `[FIN-INPUT]` placeholders pending Finance |
| R3  | 8 | ✅ | Visitor-experience ladder slide (Slide 17) — 6 rungs, staff side + visitor side per rung |
| R4  | 4, 6 | ✅ | Bundled renumber 19→21; all slide-num + slide-tag + id="slide-NN" updated |
| R5  | 15 | ✅ | "Today's three" panel on Slide 11 with phase selector (Explorer/Builder/Architect) |
| R6  | 7 | ✅ | CSS priority inversion for data-lang=jp on visitor-facing slides |

## Phase C · Content depth (iteration-2 §A–§G2 already shipped in c900daf; V2 adds:)

| Step | Items | State | Notes |
|---|---|---|---|
| C9  | 10, 26 | 🚧 | audit-events.json bumped to v0.2.0 with field_types; /spec/versioning.md, storage.md, payloads.md added; spec/README.md has honest-state banner; v1.0 buildable requires SLA-tested implementations + integration test |
| C10 | 11 | 🚧 | All 9 module cards exist as v0.1 outlines; each explicit about SME content needed; M5 (cross-cultural) is largest SME ask per James #8 ⛔ |
| C11 | 8 | ✅ | /artifacts/ has desk-card.md + parting-lines.md + post-visit-signal.md design specs |
| C12 | 21 | ✅ | /spec/i18n.md: 9 sections covering measurement, date, name-order, address, currency, honorifics, RTL prep |
| C13 | 12 | ✅ | Deck regional framing confirmed honest; /spec/i18n.md §2 formalises staged-language status for DE+CN |

## Phase P · Polish + meta

| Step | Items | State | Notes |
|---|---|---|---|
| P1  | 19 | ✅ | "/" opens search overlay; indexes all slides + disclosures; keyboard nav |
| P2  | 28 | ✅ | Print: router/search/pills hidden; language toggle drives single-lang PDF |
| P3  | 27 | ✅ | RTL prep documented in /spec/i18n.md §9 |
| P4  | 16 | ✅ | Trilingual onboarding sentence above entry router |
| P5  | 18 | ✅ | deck-feedback.yml template + footer link auto-prefills version + slide anchor + language mode |
| P6  | 26 | ✅ | README.md lists /spec/, /curriculum/, /artifacts/, STATUS.md, CHANGELOG.md |
| P7  | 29–33 | ✅ | V2.5 plan-file table covers effort/owner/reversibility/criterion/deps |
| P8  | 34 | ✅ | /spec/validation.md: 10-persona panel as reusable harness; 5 V3 persona slots listed |
| P9  | 35 | ✅ | 4 GitHub tracking issues opened (one per phase F/R/C/P) at end of V2 build; linked from PR |
| P10 | 21 (app) | ✅ | Roadmap dates already ISO Q-notation; existing content respects i18n.md rules (no rewrites needed) |
| P11 | 8 (mock) | ⬜ | Artifact PDF mock-ups deferred to V3 (requires visual designer per SME table) |
| P12 | 9 (AT) | ✅ | /spec/accessibility.md: V2 commitments + NVDA/VoiceOver test plan + known limitations |

---

## SME / external dependencies (cannot ship without external input)

| Step | Blocker | Owner needed |
|---|---|---|
| R2 v1.0 | Finance figures for cost/desk × scope × payback | Finance team |
| C10 v1.0 | M1–M9 module curriculum content (TORE worksheet, taboo lists per 5 regions, gesture maps, proxemics charts) — **M5 is the largest gap** | NAI-credentialled SME |
| C13 v1.0 | DE + CN translations of all visible deck content | DE + CN translators |
| P11 paper-stock | Print spec (paper, finish, color separation) | Visual designer / print partner |
| P8 follow-up | 5 new persona recruitment (Korean visitor, NAI peer #2, DE staff, partially-sighted student, parent w/ child) | User reach (HR or community) |

V2 ships everything Claude-doable; the items above are flagged here so the user can route them.

---

## Out of scope for V2 (items 36–40, parked for V3)

| Item | Position |
|---|---|
| 36 | Split deck into multiple artifacts — partially done (`/spec/`, `/curriculum/`, `/artifacts/`); formal split deferred. |
| 37 | Router-as-friction — mitigated by "Read in order" default option (R1). |
| 38 | Default-trilingual may be wrong — toggle ships (F3); inverting default deferred. |
| 39 | Personas evaluated usability, not desirability — V2 proposes follow-up (P8). |
| 40 | Optimize the journey, not the deck — partially via routing; full journey-mapping deferred. |

---

## Git tags (resilience checkpoints per R3)

- ✅ `v2-baseline` — created before F0
- ✅ `v2-pre-renumber` — created before R-phase renumber
- ✅ `v2-pre-sw` — created before F6 service worker activation
- ⬜ `v2-shipped` — created after P9 tracking issues

---

## Update protocol

1. After each commit, the engineer updates this file's `State` column.
2. Commits addressing 1–35 items reference them in the commit body: `[items: 9, 24]`.
3. PR description mirrors the per-phase progress.
4. When all phases are ✅ or 🚧 (with SME items ⛔ flagged), the PR is removed from draft.

---

## V2 summary (items shipped / SME-blocked / deferred)

- **Shipped**: 28 of 35 items at ✅ level.
- **Shipped at v0.1 (SME upgrade pending)**: items 10, 11, 13, 14, 22, 26 — labeled 🚧 with honest-state banners.
- **Deferred to V3**: item 8 mock-ups only (the artifact specs themselves shipped); items 36–40 framing-challenge.
- **Net**: every item 1–35 has either shipped, shipped-at-v0.1 with documented gap, or has a built/flagged path forward.
