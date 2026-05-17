# Desk card — design spec

A business-card-sized card the information-desk staff hands the visitor at the end of any encounter (scenarios A1, A2, B1, B2, D2).

The card is the brand idea's first leave-the-deck moment: the visitor walks away holding a physical evidence of who served them.

---

## Dimensions

- **85 mm × 55 mm** (standard EU business card).
- **Bleed** 3 mm on all sides → trim 91 mm × 61 mm.
- **Safe area** 79 mm × 49 mm (3 mm from trim edge).

## Stock

- **Paper**: 350gsm cotton or warm-white art card.
- **Finish**: uncoated matte; visitor must be able to write on the back.
- **Edge**: clean cut; no rounded corners (signals catalogue-card heritage, not pop-corporate).

## Layout — front

```
┌────────────────────────────────────┐
│                                    │
│   林  怡  萱                      │  ← name in serif TC; 18pt
│   Lin Yi-Hsuan / リン・イーシュエン │  ← EN romanization + JP rendering; 9pt
│                                    │
│   解 説 者 / Interpreter           │  ← tier title TC + EN; 10pt mono
│   ▌▌ ●                            │  ← insignia per Tier 2 §F rules (L2 two-bar + L3 dot)
│                                    │
└────────────────────────────────────┘
```

Element-by-element:

- **Name (full)** in `var(--serif-tc)`, 18pt, brand-black ink, baseline-aligned to upper third.
- **Name (romanized + JP)** in `var(--serif-en)` italic 9pt + `var(--serif-jp)` 9pt, on the same line below the TC name; separator slash mono.
- **Tier title** in `var(--mono)` 10pt, turquoise-deep for L3+, ink-soft for L0–L2.
- **Insignia row** — exact glyphs per Tier 2 rules:
  - L0: blank
  - L1: `▌` (one bar) turquoise
  - L2: `▌▌` (two bars) turquoise
  - L3: `▌▌●` (two bars + small dot) turquoise
  - L4: `▌▌◉` (two bars + copper dot, slightly larger)
  - L5: `▌▌◉ ■` (two bars + copper dot + small filled square, brand-black on copper background)
- **Background** brand-paper tone (`#F8F6F1` reference).
- **No logo, no website URL, no QR code**. The card is the message. (If GPS branding is required by legal/marketing, a 3pt monogram `GPS` may appear in the lower-right at 6mm margin from trim.)

## Layout — back

```
┌────────────────────────────────────┐
│                                    │
│   (intentionally blank for         │
│    visitor's note, address, or     │
│    next-visit reminder)            │
│                                    │
│   2026.05                          │  ← year-month in mono, lower-right 4pt
└────────────────────────────────────┘
```

The back is **blank**. The visitor may use it as a personal note or hand it back to staff next visit. Year-month is a small mono mark in lower-right; helps staff identify card vintage if returned.

## Trilingual considerations

Card carries TC + EN + JP for staff name (handles incoming visitors from all three languages). Tier title is TC + EN (JP rendering of tier title is on the staff name-badge, not the card, to avoid card density).

## Printing

- **Ink**: 2-color minimum — brand-black (rich black: K100 C40 M20) + turquoise-spot (PMS 7468 or nearest CMYK).
- **L4 copper insignia**: add a 3rd ink (PMS 8002 metallic copper) OR substitute with CMYK approximation (C0 M30 Y50 K20). PMS preferred for tactile authenticity.
- **L5 filled square**: brand-black on copper background; requires the copper spot if used.

## Cost order-of-magnitude

- 5,000 cards (typical 1-year supply for 200 desks) at 2-color matte cotton, double-sided: ~USD $0.18/card → ~USD $900/year all-in.
- Add 3rd color for L4+ insignia: ~+$0.05/card.
- Negligible against the staff training budget.

## Variants and lifecycle

- One card design per staff member; reprinted on tier promotion (`PROMOTE_TIER` event triggers a print order).
- Old cards retain validity for visitors who already hold them (no expiry).
- On staff departure: existing visitor-held cards remain valid as memorabilia; no reprinting.

## Out of scope

- Multilingual variant per region (DE/CN). V3 when those regions go live.
- QR code linking to a visitor microsite. The visitor microsite doesn't exist (V3+).
- NFC chip. Adds cost; visitor utility unclear without app.

## State

🚧 v0.1 design spec. Mock-up PDF (P11) deferred until paper-stock / print-partner decision (visual designer required per V2.5 SME table).

## Cross-reference

- Insignia rules: `/index.html` Slide 16 Recognition · Tier 2
- Parting handoff: `./parting-lines.md`
- Name-order rule: `/spec/i18n.md` §6
- Trigger event for reprint: `/spec/audit-events.json` → `AWARD_INSIGNIA`
