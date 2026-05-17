# Accessibility — V2 commitments and test plan

V2 step P12 (item 9). Documents what V2 accessibility refactor (F2) did, what `data-lang` toggle (F3) does for assistive technology (AT), and the test plan that confirms it.

Hassan (#5) flagged that the previous Space-key handler collided with NVDA's read-current-line shortcut, and that trilingual content was 2× cognitive load on screen readers with no toggle. V2 addresses both.

---

## V2 commitments

### F2 · accessibility refactor

| Commitment | Implementation |
|---|---|
| All `<details>` carry `aria-expanded` reflecting `open` state. | JS in IIFE: initialises + listens for `toggle` event. See `index.html` → search `syncDetailsAria`. |
| Space-key handler exempts modifier-key combos. | JS in IIFE: returns early when `e.altKey || e.ctrlKey || e.metaKey`. |
| Global slide-nav exempts form/textarea/contenteditable focus. | JS in IIFE: `isFormFocus(e.target)` guard. |
| `scroll-snap` respects `prefers-reduced-motion`. | CSS: `@media (prefers-reduced-motion: reduce) { html { scroll-snap-type: none !important; } }` |
| Disclosure animation respects `prefers-reduced-motion`. | CSS: existing rule preserved; verified after F2. |
| Custom `:focus-visible` ring on disclosure summaries. | CSS: `details.disclosure > summary:focus-visible { outline: 2px solid var(--turquoise); }` |

### F3 · language toggle propagation to AT

| Commitment | Implementation |
|---|---|
| `<html data-lang>` mirrored by `aria-hidden` on language-alternate spans. | JS in IIFE: `applyLang()` walks `[lang]` and `[class$="-tc"|"-en"|"-jp"]` elements; sets `aria-hidden="true"` on non-active language. |
| Toggle UI itself is never hidden by the toggle. | CSS: `:root[data-lang] .lang-toggle, :root[data-lang] .deck-footer { display: revert/flex !important; }` |
| localStorage-persisted setting. | JS: stored under key `deck-lang`. |

### F5 · dark mode

| Commitment | Implementation |
|---|---|
| `prefers-color-scheme: dark` auto-applies dark palette. | CSS: media query maps tokens to dark equivalents. |
| Manual override via `data-theme` attribute. | JS toggle; localStorage key `deck-theme`. |
| Contrast preserved for dark-on-dark (text vs. background). | Tokens: dark paper = `#0E1B22`, dark ink = `#DAE1E5` (contrast ratio > 12:1). |

---

## Manual test plan

To be re-run on every PR that touches `index.html`'s `<script>` or `<style>` blocks, or any disclosure component.

### NVDA (Windows)

1. Open deck in Chrome with NVDA active.
2. Tab through cover slide; entry router chips should each be announced with their role+description.
3. Use NVDA's "read next paragraph" through slide 03 (tension). Confirm: TC text, then EN text, both read once (no double-read).
4. Toggle language to JP via footer pill. Re-read slide 03 paragraph. Confirm: only JP text read; TC and EN are skipped (because `aria-hidden="true"`).
5. Open scenario B1 disclosure on slide 13. NVDA should announce: "expanded" when opening, "collapsed" when closing.
6. With NVDA active inside a disclosure body, press Space. **Expected**: NVDA reads the next line (NVDA shortcut). **Bug to catch**: if pressing Space toggles the disclosure instead, F2's modifier-key exemption is broken or NVDA isn't passing modifier-key state correctly.
7. Press `/` to open search overlay; NVDA should announce "dialog" and the input label.

### VoiceOver (macOS)

Same flow as NVDA but adapted:

1. Cmd+F5 to enable VoiceOver.
2. VO+arrow-right cycles through slides.
3. VO+space activates disclosures.
4. Language toggle: same — toggle to JP, confirm only JP is voiced.
5. Use VO Rotor (VO+U) to navigate by headings; confirm slide headlines are reachable.

### Keyboard-only (no AT)

1. Tab through deck without using a mouse.
2. Confirm focus ring is visible on EVERY interactive element (entry router chips, search input, disclosure summaries, BARS tabs, footer pills, footer links).
3. Arrow keys navigate slides EXCEPT when inside an input (search), inside a disclosure summary (Space toggles), or inside the BARS tab strip (Arrow cycles tabs).

### Reduced motion

1. macOS: System Settings → Accessibility → Display → "Reduce motion" ON.
2. Reload deck.
3. Confirm: scroll-snap is gone (you can scroll smoothly without snapping). Disclosure reveal animation is gone. Hover transitions still happen (those are < 0.01ms via global rule).

### Dark mode

1. macOS: System Settings → Appearance → Dark.
2. Reload deck. Confirm: paper is dark; ink is light; turquoise + copper are visible and readable.
3. Use footer theme pill to force "Light" mode; confirm: deck returns to light palette.

---

## Known limitations (documented honestly)

1. **Bare TC text without an explicit `-en` / `-jp` counterpart remains visible in `en` / `jp` modes.** AT will still read it (because no `aria-hidden` is applied — the element has no language-suffix class to match). Acceptable as ambient context; full wrap-everything is V3.
2. **The Space-key modifier-exemption assumes the AT passes modifier keys through.** NVDA does this by default; VoiceOver behavior depends on key layout. If AT eats modifier keys before they reach the browser, the exemption never fires.
3. **Search overlay traps focus while open but uses `aria-modal="true"` only.** Full focus-trap (preventing tab-out of the dialog) is not implemented; pressing tab inside the search overlay will eventually leave the dialog. Acceptable for V2 (users can Escape to close). V3 candidate.
4. **Dark mode does not yet adjust insignia colors.** The copper Tier 4 dot may have lower contrast on dark; visually QA-d acceptable, but for AAA contrast a darker palette variant is V3.

---

## Out of scope for V2

- Full WCAG 2.1 AA conformance audit.
- Voice-only navigation (the deck is read; voice is for assistive tech).
- Sign-language overlays.
- Plain-language alternate (cognitive accessibility).

These are explicit V3+ candidates.

---

## Cross-reference

- F2/F3/F5 commit: search git log for `F2 + F5: accessibility refactor + dark mode` and `F3: language toggle infrastructure`.
- Hassan persona context: original 10-persona review.
- WCAG references intentionally not made — V2 is best-effort, not certified.
