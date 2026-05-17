# Third-party dependencies — audit + fallbacks

V2 step F8. Inventory of every external resource the deck references, with: what it is, why we use it, and what happens when it is blocked (corporate network, offline, CDN outage, geographic block).

The deck's resilience contract: **no third-party dependency may be load-bearing.** Every dependency must have a fallback path that preserves core function (read the deck, navigate it, read it offline).

---

## Inventory

| # | Resource | Type | Purpose | What if blocked? |
|---|---|---|---|---|
| 1 | `https://fonts.googleapis.com` (preconnect + stylesheet) | Font CDN | Loads CSS that declares `@font-face` for Noto Serif TC, Noto Serif JP, DM Serif Display, Inter, JetBrains Mono. | Browser falls back to font-stack fallbacks declared in `:root` CSS variables: Source Han Serif, Hiragino Mincho, PMingLiU, Georgia, system sans, SF Mono. **F1 self-host plan** (deferred for repo-size reasons; see "F1 plan" below) adds same-origin `local() → url()` fallbacks so the deck looks correct even on corporate networks that block Google Fonts. |
| 2 | `https://fonts.gstatic.com` (preconnect) | Font CDN | Actual font binaries served from here once the stylesheet from #1 is parsed. | Same fallback as #1. |
| 3 | `https://www.fulcrumbooks.com/ham` | Citation link | Sam Ham *Environmental Interpretation* book reference on Slide 09 (Layer 01). | Plain `<a>` link; failure to resolve is silent (reader can still see the citation text). Not load-bearing. |
| 4 | `https://doi.org/10.1037/h0047060` | Citation link | Smith & Kendall (1963) BARS paper, referenced twice (Slide 11 + Slide 13). | Same as #3 — citation link; not load-bearing. |

**Verdict**: The only load-bearing third-party dependency is the Google Fonts CDN (#1, #2). All other external URLs are citation links that degrade gracefully (the citation text remains readable; only the click-through fails).

---

## Zero-tolerance categories (audited absent)

The following third-party categories are explicitly **not** used. The smoke test (`tools/smoke-test.sh`) enforces this for `<script src=...>`. The rest are confirmed by manual inspection on each commit:

- ❌ External `<script>` (no analytics, no tag manager, no embedded widgets, no third-party JS framework)
- ❌ External `<iframe>` (no embedded video, no embedded social media, no embedded forms)
- ❌ External CSS beyond Google Fonts stylesheet
- ❌ External images (the deck has no `<img>` referencing http(s)://)
- ❌ Web fonts beyond Google Fonts (no Adobe Fonts, no Hanken-style host)

---

## F1 plan — Google Fonts self-host fallback (deferred binary)

The full V2 plan (V2.4) lists `/fonts/NotoSerif{TC,JP}-{weights}.woff2` as binaries to commit. Status: **deferred** because committing full Noto font binaries (~6 MB for TC at multiple weights, ~2 MB for JP) bloats the repo for a single-file deck.

**Compromise path** (this V2 iteration):

1. Keep the Google Fonts CDN `<link>` as primary (works on most networks).
2. Add `<link rel="preload">` for the 2–3 most-used weights to reduce FOIT.
3. Document corporate-network risk here.
4. Document the OFL license attribution path (`/fonts/LICENSE-OFL.txt`) for the day the binaries are added.

**Trigger for completing F1 binary commit**: any one of:
- A pilot site reports Google Fonts blocked (Marco #2 scenario hits production).
- The deck is deployed inside a CDN-gated intranet.
- Git LFS becomes available for the repo (binaries stop counting against repo size).

When triggered, run `tools/fetch-fonts.sh` (to be added in V2.x) to download the required weights, commit to `/fonts/`, swap the `:root --serif-*` cascade to `local("Noto Serif TC"), url("./fonts/NotoSerifTC-Regular.woff2") format("woff2")`, and keep the Google Fonts `<link>` as a tertiary fallback (network conditions permitting).

---

## OFL attribution

Once font binaries are committed (deferred — see F1 plan above), they are subject to the SIL Open Font License 1.1. Attribution will live at `/fonts/LICENSE-OFL.txt` and credit:

- **Noto Serif TC** — Google Fonts, designed by Adobe. OFL 1.1.
- **Noto Serif JP** — Google Fonts, designed by Adobe. OFL 1.1.
- **DM Serif Display** — Google Fonts, designed by Colophon Foundry. OFL 1.1.
- **Inter** — Rasmus Andersson. OFL 1.1.
- **JetBrains Mono** — JetBrains. OFL 1.1.

---

## Audit cadence

This file is reviewed on every commit that touches `index.html`'s `<head>` or adds any URL to the codebase. The smoke test enforces zero `<script src="https?://...">` but other categories are honor-system; the cadence is **manual on each PR review**.

If a new external dependency is added, this file MUST be updated in the same commit. Reviewers reject PRs that violate this.
