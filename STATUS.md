# V2 STATUS · live tracker for items 1–35

This file is the source of truth for V2 build state. It is updated with every commit. If a session is interrupted, this is what the next session reads first.

V2 plan source: `/root/.claude/plans/develop-and-enhance-the-unified-hare.md` (sections V2.0–V2.9).

Legend: ⬜ planned · 🟡 in-progress · ✅ shipped · 🚧 shipped@v0.1 (SME content deferred) · ⛔ blocked-on-SME / finance / translator

---

## Phase F · Foundation (substrate)

| Step | Items | State | Notes |
|---|---|---|---|
| F0  | 35 | ✅ | STATUS.md + tools/smoke-test.sh + CHANGELOG.md landed |
| F1  | 13, 22 | ⬜ | Self-host Noto fonts + lazy-load JP — primary path uses Google Fonts, self-hosted fallback via `local()` + same-origin woff2 (deferred actual font binaries to keep repo size sane; documented in `/spec/dependencies.md`) |
| F2  | 9, 24 | ⬜ | Accessibility refactor — `aria-expanded`, Space-key handler exemption, `scroll-snap-stop`, reduced-motion on scroll-snap |
| F3  | 9 | ⬜ | Language toggle infrastructure — `<html data-lang>`, CSS, `aria-hidden`, localStorage |
| F4  | 20 | ⬜ | Stable deep-link anchors — `id="slide-XX"` and per-element sub-anchors |
| F5  | 23 | ⬜ | Dark mode — `prefers-color-scheme: dark` + manual override |
| F6  | 25 | ⬜ | Service worker `/sw.js` for offline |
| F7  | 17 | ⬜ | Deck versioning + in-deck changelog link |
| F8  | 13 (gen) | ⬜ | Third-party dependency audit → `/spec/dependencies.md` |

## Phase R · Routing

| Step | Items | State | Notes |
|---|---|---|---|
| R1  | 1, 2, 37 | ⬜ | "How to read this deck" entry router above slide 01 |
| R2  | 3, 7, 14 | ⬜ | Executive one-pager slide (with `[FIN-INPUT]` placeholders) |
| R3  | 8 | ⬜ | Visitor-experience ladder slide |
| R4  | 4, 6 | ⬜ | Bundled slide-number rebump `XX / 19` → `XX / 21` |
| R5  | 15 | ⬜ | "Today's three" capability subset on Slide 11 |
| R6  | 7 | ⬜ | Within-language priority inversion on visitor-facing slides |

## Phase C · Content depth (V2 additions — iteration-2 §A–§G2 already shipped in c900daf)

| Step | Items | State | Notes |
|---|---|---|---|
| C9  | 10, 26 | ⬜ | `/spec/` completeness — versioning.md, storage.md, sample payloads, field types |
| C10 | 11 | ⬜ | `/curriculum/m1..m9/README.md` — v0.1 outline cards |
| C11 | 8 | ⬜ | `/artifacts/desk-card.md` + parting-lines.md + post-visit-signal.md |
| C12 | 21 | ⬜ | `/spec/i18n.md` — measurement, date, name-order, RTL |
| C13 | 12 | ⬜ | Hans regional-framing fix — strike unsupportable claims + DE/CN placeholders |

## Phase P · Polish + meta

| Step | Items | State | Notes |
|---|---|---|---|
| P1  | 19 | ⬜ | Client-side search (`/` opens) |
| P2  | 28 | ⬜ | Print fidelity — language-locked PDF, per-language `@media print` |
| P3  | 27 | ⬜ | RTL preparation — document in `/spec/i18n.md`, use logical CSS properties |
| P4  | 16 | ⬜ | Onboarding microcopy above router |
| P5  | 18 | ⬜ | Feedback channel — GitHub issue template + footer link |
| P6  | 26 | ⬜ | README discoverability — list /spec/, /curriculum/, /artifacts/, STATUS.md |
| P7  | 29–33 | ✅ | Plan-meta (effort/owner/reversibility/criterion/deps) — done by V2.5 table in plan file |
| P8  | 34 | ⬜ | Validation method documented in `/spec/validation.md` |
| P9  | 35 | ⬜ | Tracking GitHub issues — one per phase (4 issues) |
| P10 | 21 (app) | ⬜ | Apply `/spec/i18n.md` rules to existing content (dates, name order) |
| P11 | 8 (mock) | ⬜ | Printable PDF mock-ups of artifacts → `/artifacts/mocks/` |
| P12 | 9 (AT) | ⬜ | Manual VoiceOver + NVDA tests → `/spec/accessibility.md` |

---

## SME / external dependencies (cannot ship without external input)

| Step | Blocker | Owner needed |
|---|---|---|
| R2 v1.0 | Finance figures for cost/desk × scope × payback | Finance team |
| C10 v1.0 | M1–M9 module curriculum content (TORE worksheet, taboo lists, gesture maps, proxemics charts) | NAI-credentialled SME |
| C13 v1.0 | DE + CN translations of new content | DE + CN translator |
| P11 paper-stock | Print spec (paper, finish, color separation) | Visual designer / print partner |
| P8 follow-up | 5 new persona recruitment | User reach (HR or community) |

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

- `v2-baseline` — created before F0 (NOT YET CREATED — first task)
- `v2-pre-renumber` — created before R4
- `v2-pre-sw` — created before F6
- `v2-shipped` — created after P9

---

## Update protocol

1. After each commit, the engineer updates this file's `State` column.
2. Commits addressing 1–35 items reference them in the commit body: `[items: 9, 24]`.
3. PR description mirrors the per-phase progress.
4. When all phases are ✅ or 🚧 (with SME items ⛔ flagged), the PR is removed from draft.
