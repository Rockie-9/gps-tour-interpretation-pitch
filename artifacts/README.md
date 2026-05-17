# Visitor-touchable artifacts

V2 step C11 (item 8). Specs for the physical/printed/handed-to-visitor surfaces that let the brand idea leave the deck and enter the visitor's world.

Yuki (#7) said: *"The information-desk lady handed me a card with her name. Next day, a handwritten note arrived at my hotel — same name, signed. That was extraordinary. I would have come back."* — the brand idea worked, BUT the visitor encountered it only by chance. These artifact specs make the encounter intentional.

Wai-Ling (#10) said: *"Eighteen of nineteen slides are about staff. I cannot extract three slides for my board to show what changes for the visitor."* — the visitor-ladder slide (R3) addresses this *in* the deck; these artifacts address it *outside* it.

---

## Artifacts

| Spec | Purpose | Visitor encounters where |
|---|---|---|
| [`desk-card.md`](./desk-card.md) | Business-card-sized card the staff member hands the visitor at the end of the encounter. Carries the staff name + tier insignia (legible per Tier 2 §F insignia rules). | At the information desk, at end of any A1/A2/B1/B2/D2 scenario. |
| [`parting-lines.md`](./parting-lines.md) | Three intensities of parting sentence per tier (L0–L5). What the staff member says as the visitor leaves. Trilingual, register-tuned per `/spec/i18n.md` §8. | Verbal, at the moment of parting (Scenario D2). |
| [`post-visit-signal.md`](./post-visit-signal.md) | Handwritten one-line follow-up signed by the original receiver, mailed to the visitor's hotel the day after a VIP reception (Scenario B1). | Physical mail at visitor's hotel, day 2. |

---

## Why these three (and not more)

- All three are **mentioned in the deck** (Slide 18 Brand · touchpoint strip — desk plate, parting line, post-visit signal). The deck describes them; this directory specifies them buildably.
- Five would be more comprehensive but breaks the deck's restraint (§G2 keeps to 4 touchpoints).
- The omitted touchpoint (name badge — Tier 2 insignia) is staff-worn, not handed to the visitor; spec lives in the deck itself.
- A sixth artifact (visitor-facing LINE OA) is V3 — explicitly out-of-scope per iteration-2 §I column 1 staff-workflow-only constraint.

---

## V3 follow-up: printable mock-ups

P11 in V2 plan calls for: produce one printable PDF per artifact spec, prove the brand idea can in fact leave the deck. Deferred for V2 because:
- Paper stock decision (matte / cotton / kraft) needs visual designer.
- Print partner selection per region.
- Color separation / Pantone for tier insignia.

The specs in this directory contain enough detail (size, type, paper, ink, registration) that a designer or print shop can produce mock-ups when the user is ready. When V2 ships, an issue is opened to commission those mock-ups.

---

## Cross-reference

| Artifact | Where the deck describes it | Where the spec lives | Mock-up | State |
|---|---|---|---|---|
| Desk card | Slide 18 · touchpoint strip "Desk plate" | `./desk-card.md` | (V3) | 🚧 v0.1 design spec |
| Parting line | Slide 18 · touchpoint strip "Parting line" | `./parting-lines.md` | (V3) | 🚧 v0.1 design spec |
| Post-visit signal | Slide 18 · touchpoint strip "Post-visit signal" | `./post-visit-signal.md` | (V3) | 🚧 v0.1 design spec |
| Name badge (insignia) | Slide 16 Recognition · Tier 2 insignia | (in deck, not separated) | N/A | ✅ described in deck |
| Visitor LINE OA | NOT in deck (out of scope V2) | (V3) | (V3) | parked |
