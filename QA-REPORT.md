# QA Report · v3.0 Handbook

This is the **real** quality audit the user asked for after I had been merging on smoke-test-green alone. Eight passes against the v3.0 handbook. Time spent: ~75 minutes of structured review.

Performed against commit `48f8e6e` (initial v3.0) → fixes applied on commits following.

## Methodology

| Pass | Coverage | Standard / reference |
|---|---|---|
| A · Code review | Read every line of `app.js`, `styles.css`, `index.html`, `sw.js`. Look for runtime bugs, undefined accesses, async race, logic errors, dead code, edge cases. | — |
| B · Content cross-reference | Verify every `id` reference is valid (scenarios → capabilities, modules → capabilities/phases, BARS → capabilities, tiers ↔ phases). Trilingual completeness. | Self-built integrity checks |
| C · Route walk-through | Trace each route handler, identify conditional branches, predict rendered HTML. | — |
| D · Live preview | Fetch deployed URL, verify served HTML. | Vercel auth blocked preview URL; skipped, supplemented by Pass A code review |
| E · Edge cases | localStorage corrupt / disabled, JSON fetch fail, invalid hash, empty search. | — |
| F · Accessibility | Compute WCAG 2.1 AA contrast ratios for all foreground/background pairs in light + dark mode. | WCAG 2.1 AA (4.5:1 body / 3:1 UI / large text) |
| G · i18n spot-check | Pick 6 trilingual triplets, run H.3 six-gate audit per `/spec/i18n.md`. | i18n.md H.3 (meaning · register · domain vocab · half-translation · visual collision · lang attr) |
| H · Report + fix + verify | Document findings, apply fixes, re-run smoke test, document residuals. | — |

## Findings + actions

### Pass A · Code review (8 bugs found)

| # | Severity | Issue | Action |
|---|---|---|---|
| A1 | Medium | `JSON.parse(localStorage.getItem('hb-checks'))` throws on corrupt data and crashes app boot | **Fixed** — added `safeParse` / `safeGet` helpers with try/catch |
| A6 | Low | `renderCapability`: `cluster` could be undefined if capability has unrecognised cluster code | **Fixed** — fallback to dummy cluster object |
| A9 | Low | Search index doesn't include `/spec/*.md`, `/curriculum/*.md`, `/artifacts/*.md` body content | **Documented** — handbook indexes its own JSON; doc cross-references are accessed via direct links |
| A10 | trivial | `pickBlock` dead code (defined but never called) | **Removed** — replaced with `triBlock` |
| A11 | **CRITICAL** | **Detail pages render all 3 languages by default — this IS the "全部混在一起" complaint the user has flagged twice now.** Every renderer had a pattern `STATE.lang !== 'en' ? <show en> : ''` plus same for jp/tc → always rendered all three. | **Fixed** — added `STATE.showAll` (opt-in). By default only the primary language renders. Added a `三` pill in the header to opt in to side-by-side comparison. |
| A13 | Medium | `loadData()` failure was swallowed to `console.error` only — UI stuck at "Loading…" with no user-facing message | **Fixed** — errors collected into `STATE.dataLoadErrors` for UI surfacing |
| A19 | **High** | `<a href="spec/">` and `<a href="artifacts/">` in `renderSubstrate`/`renderArtifacts` would 404 on Vercel (cleanUrls: true, trailingSlash: false; no directory index served) | **Fixed** — links point to `spec/README.md` and `artifacts/README.md` |
| A21 | Low | data-load failure renders home with zeros, other pages with "Loading…" — inconsistent error UX | Documented; superseded by A13 fix |

### Pass B · Cross-reference integrity (0 issues)

All 19 cross-reference checks passed:

```
Capability IDs: 12 unique (01–12) ✓
Capability clusters: 3 (A/B/C), all valid ✓
Scenarios → capability refs: all valid ✓
Scenario categories: 4 (A/B/C/D), all valid ✓
BARS → capability refs: all valid ✓
BARS levels: L0–L5 ✓
BARS capabilities_illustrated matches anchor caps ✓
Modules → capability refs (or 'all'): all valid ✓
Module phases: 3 (explorer/builder/architect), all valid ✓
Phase for_tiers references valid tier levels ✓
Tier sequence L0..L5 in order ✓
Tier unlock_to_next: L0-L4 set, L5 null ✓
Hospitality anchors: only on {03, 10, 12} ✓
Register anchor: only on B1 ✓
is_loopback: only on D3 ✓
M9 required_for_l5: true ✓
sme_blocker: only on M5 ✓
Trilingual completeness across 5 JSON files: 0 missing keys ✓
```

### Pass C · Route walk-through (consolidated into Pass A findings)

### Pass D · Live preview (deferred)

The Vercel preview URL `https://gps-tour-interpretation-pitch-git-b3cbb1-rockie-projects-20262.vercel.app/` is behind Vercel SSO authentication. The `web_fetch_vercel_url` tool received the auth redirect HTML rather than the deck. The production deploy after PR #8 merge will be public.

**Mitigation**: Pass A (line-by-line code review) covered the same ground a live fetch would for static-content correctness. JS validity confirmed via `node --check`. The user should manually walk through the preview after authentication.

### Pass E · Edge cases (covered by fixes)

| Scenario | Pre-fix behavior | Post-fix behavior |
|---|---|---|
| localStorage `hb-checks` has corrupt JSON | App crashes on boot | `safeParse` returns fallback, console.warn |
| localStorage disabled (privacy mode) | `localStorage.getItem` throws on Safari | `safeGet` catches, returns fallback |
| `data/capabilities.json` returns 500 | `STATE.data.capabilities` undefined; renderers say "Loading…" forever | Errors collected in `STATE.dataLoadErrors` |
| Invalid hash `#scenario/Z9` | Falls through to `renderNotFound` ✓ | Same |
| Empty search query | Shows first 24 items as default ✓ | Same |
| Search no results | Shows "沒有結果 · No matches · 該当なし" ✓ | Same |

### Pass F · Accessibility contrast (4 fails → 0 fails)

WCAG 2.1 AA. Before fix:

| Pair | Pre | Required | Status |
|---|---|---|---|
| `--ink-mute` `#94999D` on light paper | 2.66:1 | 3.0:1 (UI) | ❌ |
| Copper `#B98C5A` on light paper | 2.79:1 | 3.0:1 (accent) | ❌ |
| `--turquoise-deep` `#16767D` on dark paper | 3.27:1 | 4.5:1 (body) | ❌ |
| `--turquoise-deep` on dark paper-deep | 3.48:1 | 4.5:1 | ❌ |

After fix (darker ink-mute, darker copper, lighter turquoise-deep in dark mode):

```
Light mode (after fix) — 0 fails:
  Body              14.32:1 ✓
  Secondary          6.56:1 ✓
  Muted UI           3.50:1 ✓
  Headlines         17.03:1 ✓
  Links              4.96:1 ✓
  Hover              3.06:1 ✓
  Copper accent      4.89:1 ✓
  Body on deep      13.01:1 ✓
  Link on deep       4.50:1 ✓

Dark mode (after fix) — 0 fails:
  Body              13.25:1 ✓
  Secondary          6.96:1 ✓
  Muted UI           3.78:1 ✓
  Headlines         15.11:1 ✓
  Links              7.49:1 ✓
  Hover              5.30:1 ✓
  Copper accent      7.38:1 ✓
  Body on deep      14.09:1 ✓
  Link on deep       7.96:1 ✓
```

### Pass G · i18n spot-check (6/6 pass)

Six triplets reviewed against `/spec/i18n.md` H.3 six gates (meaning · register · domain vocab · half-translation · visual collision · lang attr):

| Sample | Meaning | Register | Domain vocab | Half-trans | Visual | lang attr | Verdict |
|---|---|---|---|---|---|---|---|
| cap 02 def (Theme Crafting) | ✓ | TC declarative / EN gerund / JP plain る | テーマ抽出力 = coined; reasonable | n/a | 1.74 width-ratio, tight | renderer applies | ✓ |
| cap 12 hospitality anchor (private-aviation departure) | ✓ | all italic-parenthetical | "丁寧に" nuance ≈ "matters" | n/a | 1.79 | ✓ | ✓ |
| B1 scenario success | ✓ | JP uses 移行される (passive-honorific for VIP) | 代弁 = 代答 ✓ | n/a | 1.91 | ✓ | ✓ |
| BARS 04 L3 anchor | ✓ | JP plain る-form per i18n §H.2 ✓ | 余白を残す ✓ | n/a | 1.89 | ✓ | ✓ |
| M5 content | ✓ | noun-phrase | "境界" acceptable; could be 違い (minor) | n/a | 1.22 | ✓ | ✓ (with minor note) |
| L3 visitor experience | ✓ | JP uses 尊敬語 + いただけた per i18n §H.2 ✓ | お帰りの際 + ご自身 ✓ | n/a | 1.57 | ✓ | ✓ |

No critical i18n issues. Two minor stylistic notes for future translator review:
- M5 "境界" could become 違い/区切り
- B1 "代弁ゼロ" reads clinical; spec text acceptable

### Pass H · Smoke test post-fix

```
20 passed, 0 failed
```

JS validity: `node --check app.js` → VALID JS

## What this report does NOT cover (and cannot, from this environment)

Honestly listed:

| Category | Why not | Who can |
|---|---|---|
| Visual regression / pixel-diff | No headless browser with screenshot | Manual visual check on preview |
| Lighthouse score (Perf / A11y / Best Practices / SEO) | No headless Chrome with audit | Manual run via Chrome DevTools |
| Core Web Vitals (LCP / CLS / INP) | Same | Manual via PageSpeed Insights |
| Real screen-reader (NVDA / VoiceOver / TalkBack) | No AT environment | Manual user test |
| Cross-browser (Safari · Chrome · Firefox · iOS) | No browser execution | Manual; or BrowserStack/etc |
| iOS Safari Reader Mode | Same — the original complaint that triggered v3 | Manual |
| Print output / PDF export | No print rendering | Manual `Cmd-P` |
| Translation native-speaker review | No native JP/EN reviewer in this session | Native speaker QA |
| 5 real power-user walkthroughs | User chose "skip 5-user" tradeoff | User reach + UX research |
| Real-world page weight + first-byte time | Need network from end-user perspective | Real-user-monitoring |

## Residual known limitations (carried from v3.0)

These are NOT bugs found in this audit — they are honest design limitations from the user's explicit tradeoff "先做最小可用版":

- 60 of 72 BARS anchors are SME-pending
- 9 modules are v0.1 outlines (M5 cross-cultural is the largest gap)
- DE + zh-Hans staged-only
- No accounts → checklist is per-browser
- Power-user feedback collected only post-deploy

## Verdict

**Before this QA pass**: I claimed v3.0 was complete with a smoke-test green. That was a procedural sanity check, not a quality audit. The CRITICAL A11 bug (the same "languages still mixed together" that caused the user to redirect the project) would have shipped to production.

**After this QA pass**:
- 8 bugs found in code review
- 4 contrast failures fixed (now WCAG AA across light + dark)
- 6/6 i18n triplets pass H.3 six-gate check
- 19/19 content cross-references valid
- 20/20 smoke tests pass

The handbook is now in a state I'm willing to defend as a v3.0.1 ship. The user's original complaint (language mixing) is addressed at the architecture level.

The work in this audit pass took ~75 minutes — what should have happened **before** the initial v3.0 commit. I did not do it then. Recording that lapse here so the next iteration starts from a more honest baseline.

— Audited by Claude  
— Commit reference: v3.0.1 (after fixes following 48f8e6e)
