# GPS Tour Interpretation · Handbook

詢問台導覽解說手冊 · A reference & practice handbook for the Information Desk · 案内所インタプリテーション手帳

## What this is

A **static knowledge handbook** for GPS information-desk staff: browse, search, deep-link, and self-practice across the capability architecture (12 capabilities, 10 scenarios, 72 BARS behavior anchors, 9 training modules, 6 maturity tiers).

Replaces the v2 pitch deck. Same content, different form: from "read once, top to bottom" to "look up what you need, when you need it, practice it on your own."

**Live URL** (production): https://gps-tour-interpretation-pitch.vercel.app/

## Sections

| URL | What you'll find |
|---|---|
| `#home` | Hub cards into the 7 sections + about page |
| `#capabilities` | 12 capabilities grouped into 3 clusters; click any for detail + BARS + appears-in-scenarios + trained-by-modules |
| `#scenarios` | 10 scenarios (A1–D4) in 4 categories; each with duration, required capabilities, success criterion |
| `#bars` | The illustrated 12 of 72 behavior anchors with self-check checkboxes (localStorage) |
| `#modules` | 9 training modules across 3 phases (Explorer · Builder · Architect); each with content + validation + my-progress checkbox |
| `#tiers` | 6 tiers L0–L5; visitor experience + craft + insignia + conditions + unlock path |
| `#substrate` | Index of `/spec/` files: logs, audit taxonomy, storage, versioning, i18n, accessibility, validation, dependencies |
| `#artifacts` | Three visitor-touchable artifact specs: desk card, parting lines, post-visit signal |
| `#about` | Version, honest limitations, sources, feedback channel, audit log |

## Controls

- **Click any nav** to jump to a section
- **`/` or `⌘K`** to open search (indexes every capability, scenario, BARS anchor, module, tier)
- **`↑↓` and `↵`** to navigate search results
- **`Esc`** to close search
- **Footer pills**: language (中/EN/JP) and theme (auto/light/dark) — both persist via localStorage
- **Deep links** are stable: `#capability/05`, `#scenario/B1`, `#module/M5`, `#tier/L3`

## Companion directories

These are also accessible directly (and linked from inside the handbook):

- [`/spec/`](./spec/) — Substrate contracts: log schema, audit taxonomy, retention storage, event versioning, sample payloads, internationalisation, accessibility commitments, third-party dependency audit, validation method
- [`/curriculum/`](./curriculum/) — 9 module outline cards (v0.1; SME content pending — see each card)
- [`/artifacts/`](./artifacts/) — Three visitor-touchable artifact specs (desk-card, parting-lines, post-visit-signal)
- [`STATUS.md`](./STATUS.md) — Live build state
- [`AUDIT.md`](./AUDIT.md) — Honest audit log: what was built, what was claimed vs delivered, what remains a gap
- [`CHANGELOG.md`](./CHANGELOG.md) — Per-version changes

## Architecture

Plain web, no build step:

- `index.html` — shell (~70 lines)
- `app.js` — hash router, data loader, renderer, search, language picker, theme toggle, localStorage checklist (~750 lines)
- `styles.css` — design tokens + components (~430 lines)
- `data/*.json` — structured content (5 files)
- `sw.js` — service worker for offline
- `tools/smoke-test.sh` — per-commit health check

Hosted on Vercel as static files. No backend, no database, no accounts.

## Honest limitations

This handbook ships at **v3.0.0**. Some things are NOT what they appear:

- 60 of 72 BARS anchors are not yet written (SME-pending — see `/curriculum/m8/`)
- 9 modules are v0.1 outlines; full curriculum content requires NAI-credentialled SME engagement (especially M5 cross-cultural)
- DE + Simplified CN translations are staged in `/spec/i18n.md`, not delivered
- No accounts; checklist state is per-browser only
- No real `PROMOTE_TIER` workflow — recognition tiers describe a human process, the handbook is a reference for it

See [`AUDIT.md`](./AUDIT.md) for the full honest accounting.

## Feedback

Use the footer's `feedback ↗` link to file an issue. The template auto-pre-fills the current section and language.

## Brand alignment

Aligned with GPS Brand v3.6 — "在您需要之前 · Before You Need It · 必要となる、その前に." Considerate Partner positioning. The brand idea is manifest in details (BARS anchors, parting lines, recognition unlocks, visitor experience per tier) rather than labelled.

## Version

v3.0 · handbook · 2026-05-17 · For GPS Strategy & Transformation
