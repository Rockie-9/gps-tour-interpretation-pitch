# 稽核紀錄 · Audit Log

This document records, brutally honestly, what has been built across iterations of this project, what worked, what didn't, and what remains a gap. It exists because earlier iterations claimed completeness they didn't actually have — and the user, rightly, asked for an audit trail.

The audit log is **append-only and version-stamped**. Each iteration writes a new entry below; earlier entries are not edited.

---

## v3.0.0 · Handbook · 2026-05-17

### What this iteration is

A **static knowledge handbook**, replacing the v2.0 pitch deck. Single-page web app, vanilla JS + JSON, no build step, deployed on Vercel.

Architecture:
- `index.html` — shell (~80 lines) with header, nav, main mount, search overlay, footer.
- `app.js` — router (hash-based), data loader, renderer, search index, language picker, theme toggle, localStorage checklist persistence.
- `styles.css` — design tokens + component styles (~350 lines).
- `data/*.json` — structured content (5 files: capabilities, scenarios, bars, modules, tiers).
- `sw.js` — service worker for offline use (carried over from v2).
- `spec/`, `curriculum/`, `artifacts/` — preserved from v2; linked from handbook pages.

### What I claimed vs what I built

| Claim | Reality |
|---|---|
| "Static handbook with browse + search + deep-link" | ✅ Built. Hash routes work (#capabilities, #capability/05, #scenario/B1, etc.). Search via `/` or `⌘K` indexes all content. |
| "Trilingual that actually works (JSON-key, not CSS hack)" | ✅ Built. Each content block is `{tc, en, jp}`; renderer picks one key; the other two render below as muted secondary text. **No display:none hack; Safari Reader mode will now show only the active language.** |
| "Checklist練功 via localStorage" | ✅ Built. BARS anchors and modules have checkboxes; state survives reload. **No accounts. No multi-user. No server.** That is the constraint. |
| "Capabilities · scenarios · BARS · modules · tiers" content preserved | ✅ Content extracted to JSON. 12 capabilities, 10 scenarios, 12 of 72 BARS anchors, 9 modules, 6 tiers. |
| "Substrate page" | 🚧 Page exists as an index of links to `/spec/`. The substrate itself (logs, audit, tooling) is still spec-only — no real implementation. |
| "Artifacts page" | 🚧 Page exists as an index of links to `/artifacts/`. The artifact PDFs are still not produced (V3 designer needed). |
| "Power user validation before delivery" | ❌ Not done. User chose "先做最小可用版" — minimum viable first, real users test directly. First version may still have direction errors. |

### What is honestly broken or limited (v3.0.0)

1. **72 BARS anchors, only 12 illustrated.** The remaining 60 require SME (NAI-credentialled curriculum lead, ideally one with cross-region experience). 4-6 weeks minimum to fill.

2. **9 modules are v0.1 outlines, not curricula.** A trainee who opens M5 (cross-cultural) finds an outline that names what content *should* be there (taboo card × 5 regions, gesture maps × 5 regions, proxemics charts × 5 regions, 25 simulation scripts), not the content itself. M9 (mentoring) — the module that reproduces the system — needs especially careful SME design.

3. **No real "晉階" workflow.** Recognition tiers are described; nothing in the handbook actually promotes someone from L1 to L2. Promotion lives in the human process described in `/spec/audit-events.json`'s `PROMOTE_TIER` action_type — which is a contract for a future tool, not the handbook itself.

4. **No backend / no accounts.** Per user choice (Q2: 純前端 Vercel static). Checklist state is per-browser. If a staff member uses two devices, the state doesn't sync. If they clear localStorage, the state is gone.

5. **DE and zh-Hans (simplified Chinese) are staged-only.** `/spec/i18n.md` honestly labels them as staged; the actual translations require translators. Hans (DE site lead persona) explicitly flagged this in V2's 10-persona panel.

6. **Power-user validation skipped.** User chose option C: "先不要 5-user, 先做最小可用版". This is the conscious tradeoff. The first real-world feedback will arrive after deploy.

7. **The "10-persona panel" used in V2 was entirely fictional.** I wrote those personas; no real reception staff, executive, or board member ever reviewed the deck. They were a useful design tool — but they were *my* design tool, not validation.

8. **Cost / payback figures absent.** v2 R2 (executive one-pager) was retired with the deck. If a cost case is needed for funding, it requires Finance input. The handbook does not pretend to have those numbers.

9. **iOS Safari "Reader" mode strips CSS.** That said, since v3 uses JSON-key picking instead of CSS display hacks, the Reader mode should show only the active language's text (the others are simply not rendered into the DOM as primary text; they appear as smaller secondary previews which Reader may still surface).

### What I deleted vs preserved from v2

**Deleted from index.html:**
- 21-slide deck structure (cover, exec one-pager, setup, tension, divider, premise, layer slides, substrate slide, recognition slide, visitor ladder, brand slide, capacity, roadmap, decision, closing)
- Scroll-snap navigation
- Entry router (replaced by handbook navigation)
- "Today's three" (concept survives as a future feature on capability pages)
- Trilingual CSS-display-hide rules (replaced by JSON-key picking)

**Preserved as standalone files** (linked from handbook):
- `/spec/` — all 10 substrate spec files (logging, audit-events.json, payloads, versioning, storage, i18n, accessibility, validation, dependencies, README)
- `/curriculum/` — all 9 module outline cards + index
- `/artifacts/` — desk-card.md, parting-lines.md, post-visit-signal.md + index
- `/.github/ISSUE_TEMPLATE/deck-feedback.yml` — feedback issue template

**Extracted to JSON** (content preserved, form changed):
- 12 capabilities (incl. definitions and 3 hospitality anchors) → `data/capabilities.json`
- 10 scenarios (incl. B1 register anchor) → `data/scenarios.json`
- 12 BARS anchors (capabilities 04, 05 × L0–L5) → `data/bars.json`
- 9 modules → `data/modules.json`
- 6 tiers → `data/tiers.json`

**Git history**: v2 deck remains at tag `v2-shipped` (local) and main-branch commit `d9699ad`. Restorable.

### Files I added (v3)

- `/index.html` — new shell (replaces v2 deck)
- `/app.js` — handbook SPA logic
- `/styles.css` — design tokens + components
- `/data/capabilities.json`, `/data/scenarios.json`, `/data/bars.json`, `/data/modules.json`, `/data/tiers.json`
- `/AUDIT.md` — this file
- Updated `/sw.js`, `/tools/smoke-test.sh`, `/README.md`, `/CHANGELOG.md`

### Smoke-test contract (v3)

Each commit must pass `bash tools/smoke-test.sh`. Checks:
- All core files present (index.html, app.js, styles.css, sw.js)
- HTML parses
- All JSON valid
- Content counts match claims (12 caps, 10 scens, 12 BARS, 9 mods, 6 tiers)
- Zero external `<script src=...>` (third-party JS audit)
- STATUS, CHANGELOG, AUDIT files present

### What I will NOT do without explicit user direction

- Add accounts / login / multi-user.
- Add a backend or database.
- Add a build step (no React/Vue/Next.js).
- Make up SME content for M5 cross-cultural (the most-blocked module).
- Forecast finance numbers.
- Recruit "5 power users" — that's the user's responsibility.

### Promised follow-ups (not in v3, listed honestly)

| Promise | Owner | Trigger |
|---|---|---|
| 5 real power users review the handbook | User | After v3 deploy; gathers feedback to drive v3.1 |
| NAI SME fills M5 cross-cultural content | SME engagement | Authorization + budget |
| DE + Simplified CN translation | Translator engagement | Same |
| Artifact PDF mock-ups (desk-card, parting-lines, post-visit-signal) | Visual designer | Paper/print stock decision |
| Real `PROMOTE_TIER` workflow implementation | Backend engineering | If/when handbook proves out; V4 |
| Today's three feature | Claude, after seeing usage | Defer until real users tell us what "today" means |

---

## v2.0.0 · Deck · 2026-05-17 (RETIRED)

The 21-slide pitch deck. Merged to main in commit `d9699ad` (PR #1).

Built across:
- iteration-2 (commit `c900daf`): trilingual TC+EN+JP, new Substrate and Recognition slides, spec scaffolding.
- V2 add-ons (commits `16d778d` through `77b364c`): foundation (status tracker, smoke test, font fallback path, accessibility refactor, dark mode, service worker, deck versioning, dependency audit), routing (entry router, executive one-pager, visitor ladder, today's three, language toggle), content depth (spec completeness, curriculum cards, visitor artifacts, i18n spec, regional honesty), polish (search, print fidelity, RTL prep, onboarding microcopy, feedback channel, README discoverability, plan-meta, validation method, tracking issues, accessibility test plan).

**Retired because:** the user wanted a platform / handbook for browse + search + practice, not a linear pitch deck. The deck was the wrong artifact type.

Honest assessment of v2:
- The 10-persona panel reviewing it was fictional (written by me).
- The "language toggle" worked at the CSS-display level but had a known leakage of bare TC text and was invisible in Safari Reader mode.
- The "35 items shipped" was true at the deck-UX level — but the deck-UX level wasn't what the user needed.
- The `[FIN-INPUT]` placeholders in the exec one-pager honestly flagged that the budget figures weren't real.
- Curriculum modules and visitor artifacts (kept in v3) genuinely shipped as v0.1 outlines, with honest SME-pending banners.

### What survived from v2 into v3

All `/spec/`, `/curriculum/`, `/artifacts/` content. Service worker pattern. Smoke-test harness pattern. Status-tracker pattern. Feedback issue template. Most of the actual interpretation content (capabilities, scenarios, BARS, modules, tiers) — just re-shaped into JSON.

### What was discarded

The deck shell itself. ~5000 lines of HTML/CSS for the 21-slide structure, scroll-snap, entry router, trilingual CSS-display-hide rules, slide-num/slide-tag system, and the executive one-pager slide.

---

## Earlier iterations

For pre-v2 history (mobile RWD overhaul, sourcing pass, omotenashi pass, design upgrade v1.2), see `git log`. Those changes shaped the *content* that survived into v3 even though the *form* changed twice.
