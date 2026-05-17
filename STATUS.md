# STATUS · v3.0 handbook

Current state of the handbook rebuild. Updated per commit.

Plan source: previous conversation (see AUDIT.md for the directional pivot from v2 deck to v3 handbook).
Audit log: [AUDIT.md](./AUDIT.md).

Legend: ⬜ planned · 🟡 in-progress · ✅ shipped · 🚧 shipped@v0.1 (SME / external content pending) · ⛔ blocked

---

## v3.0 — Handbook (current)

### Shell

| Item | State | Notes |
|---|---|---|
| `index.html` (handbook shell, ~70 lines) | ✅ | Replaces v2 deck |
| `app.js` (router, renderer, search, lang, theme, checklist) | ✅ | ~750 lines, vanilla JS, no build step |
| `styles.css` | ✅ | ~430 lines, tokens + components |
| `sw.js` (service worker) | ✅ | Updated for handbook assets |
| `tools/smoke-test.sh` | ✅ | Updated to check content counts |

### Content data (extracted to JSON)

| File | Count | State |
|---|---|---|
| `data/capabilities.json` | 12 capabilities (3 clusters) | ✅ |
| `data/scenarios.json` | 10 scenarios (4 categories) | ✅ |
| `data/bars.json` | 12 of 72 anchors illustrated | 🚧 60 SME-pending |
| `data/modules.json` | 9 modules (3 phases) | 🚧 v0.1 outlines, SME content pending |
| `data/tiers.json` | 6 tiers L0–L5 | ✅ |

### Companion (preserved from v2)

| Directory | State |
|---|---|
| `/spec/` | ✅ all 10 files preserved (v0.1 design intent banner) |
| `/curriculum/` | 🚧 9 module cards as v0.1 outlines |
| `/artifacts/` | 🚧 3 design specs; PDF mock-ups deferred |
| `/.github/ISSUE_TEMPLATE/deck-feedback.yml` | ✅ |

### Features

| Feature | State |
|---|---|
| Hash routing (#capability/05, #scenario/B1, etc.) | ✅ |
| Search overlay (`/` or `⌘K`) | ✅ — indexes all content + sub-anchors |
| Language picker (TC/EN/JP via JSON keys, not CSS hacks) | ✅ |
| Theme toggle (auto/light/dark) | ✅ |
| localStorage checklist (BARS observed / module completed) | ✅ |
| Service worker (offline after first load) | ✅ |
| Print-friendly | ✅ (header/search/footer hidden) |
| Accessibility (`aria-pressed`, `aria-selected`, keyboard nav, focus rings) | ✅ |
| Reduced-motion respect | ✅ |
| Deep-link stability | ✅ |

### What's NOT yet done

| Item | Why not | Owner |
|---|---|---|
| 60 of 72 BARS anchors | Needs SME (NAI curriculum lead) | NAI SME |
| M1–M9 full curriculum content (especially M5) | Needs SME, 4–6 weeks minimum for M5 | NAI SME + per-region cultural advisor |
| DE + Simplified CN translations | Needs translators | Translators |
| Artifact PDF mock-ups | Needs visual designer + paper stock decision | Visual designer |
| Real PROMOTE_TIER workflow | Needs backend; out of scope for static handbook | Future engineering (V4) |
| 5-power-user feedback | User explicitly chose "先做最小可用版, 之後再 iterate" | User reach (post-deploy) |

### Honest known limitations

- No accounts → checklist state is per-browser
- Reader-view of Safari may not honor language picker (uses JSON-key picking, but Reader might surface the secondary-lang preview text)
- DE/CN explicitly staged-not-delivered in `/spec/i18n.md`

---

## v2.0 — Deck (RETIRED)

The 21-slide pitch deck merged to main in `d9699ad`. Replaced by v3 handbook. See [AUDIT.md](./AUDIT.md) for what carried over vs what was discarded.

Tags: `v2-baseline`, `v2-pre-renumber`, `v2-pre-sw`, `v2-shipped` (local). Restorable from git history.
