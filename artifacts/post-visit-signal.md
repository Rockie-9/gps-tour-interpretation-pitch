# Post-visit signal — handwritten follow-up

A handwritten one-line note, signed by the original receiving staff member, mailed to the visitor's hotel the day after a VIP reception (Scenario B1).

This is the "next day at the hotel" moment Yuki (#7) described as *extraordinary*. The artifact spec turns it from "happens by chance when a staff member feels inspired" into "happens by design after every B1 reception delivered by L4+ staff."

---

## Format

- **Card stock**: same as desk card (350gsm cotton or warm-white art card).
- **Size**: 100mm × 70mm (slightly larger than business card — fits an A6 envelope comfortably).
- **Front**: blank cream face; visitor's name handwritten in upper-left.
- **Back**: blank.
- **Inside (when folded — single fold horizontal)**: one handwritten line + signature.

Optionally use a folded card instead of flat — the unfolding gesture is itself ceremonial.

---

## The line — what to write

Three modes:

### Mode 1: Theme echo (most common)
References the specific theme or piece discussed during the reception.

> *"關於昨天那件釉色 — 我們館還有一件，下次您來，我帶您看。 — 林"*
>
> *"About yesterday's glaze — there is one more piece in our collection. Next time you come, I will take you to it. — Lin"*
>
> *"昨日の釉薬の件 — 当館には今一点ございます。次のお越しの際、ご案内いたします。 — 林"*

### Mode 2: Question echo
Acknowledges a specific question the visitor asked.

> *"您昨天問的問題 — 我去查了我們館長的論文，附上一頁；歡迎下次討論。 — 林"*
>
> *"Your question yesterday — I checked our director's paper and enclosed a page; happy to discuss next time. — Lin"*
>
> *"昨日のお尋ねについて — 当館長の論文に該当箇所がございました。同封いたしましたので、次回ご一緒に。 — 林"*

### Mode 3: Continuation
Offers a specific next-visit hook, named.

> *"下次您來，我們從昨天結束的那一件之後的下一件開始 — 蘇東坡的字。 — 林"*
>
> *"Next time you come, we begin with the piece that follows the one we ended on yesterday — the Su Shi calligraphy. — Lin"*
>
> *"次のお越しの際は、昨日締めくくった作品の次の一点から始めましょう — 蘇東坡の書でございます。 — 林"*

Choose ONE mode per card. Never combine. Brevity is the form.

---

## Operational rules

1. **The L5 ambassador or L4 designer writes it.** Not an assistant; not a template fill-in. The handwriting itself is the signal.
2. **Within 24 hours of the visit ending.** The post is the signal; same-week is too late.
3. **Signed with the receiving staff member's name only.** No company logo, no title, no department.
4. **No marketing language.** No "we hope to see you again soon"; no "your feedback matters." Specific, personal, terse.
5. **Trilingual not required.** Write in the language the visitor used during the reception. The card is for THIS visitor, not a general audience.
6. **Mode 1 or 3 may include an enclosure** (a printed scan, a photograph). Never more than one enclosure.

---

## Logistics

| Step | Action | Time |
|---|---|---|
| 1 | At end of B1 reception: staff member writes hotel name on internal handoff form. | +0 |
| 2 | Within 4 hours: staff member drafts the line on paper card. | +4h |
| 3 | Internal courier picks up at end-of-day. | +8h |
| 4 | Courier delivers to hotel front desk. | +18h (next morning) |
| 5 | Hotel concierge places card in visitor's room before evening turn-down. | +24h |

Backup paths:
- If visitor checked out before delivery: forward to home address on file (only if visitor opted in to be contacted; otherwise the card is filed in a memorabilia archive at the staff member's tier file).
- If visitor's hotel cannot be confirmed: the signal isn't sent. Better silent than wrongly addressed.

---

## Cost order-of-magnitude

- Card stock + envelope + ink: ~USD $0.30/card.
- Local courier (within Taipei): ~USD $4 per delivery.
- Per VIP reception: ~USD $5 all-in.
- Expected volume: ~50 B1 receptions/quarter at the HQ-TW pilot.
- Annual: ~USD $1,000. Negligible.

For cross-region or international shipping: switch to express mail (~USD $25 per delivery). Acceptable for the VIP-tier event that justified B1 reception in the first place.

---

## What this is NOT

- ❌ A CRM follow-up email. Email is not this artifact.
- ❌ A templated postcard. Templated breaks the signal.
- ❌ A loyalty program enrollment.
- ❌ A gift. The card is the gift.
- ❌ A request for feedback. (Feedback is a separate path — scenario D3.)

If any of these creep in, the artifact is broken.

---

## State

🚧 v0.1 design spec. Pilot at HQ-TW for first 10 B1 receptions; iterate on visitor response before standardising. Visitor-research follow-up: ask 5 recipients within 30 days whether they remember receiving the card; aim for 5/5.

## Cross-reference

- Scenario B1 VIP Reception: `/index.html` Slide 13 (Layer 04)
- Capability 12 Experience Closure: `/index.html` Slide 11 (Layer 02)
- L4/L5 unlocks: `/index.html` Slide 16 (Recognition) Tier 1
- Trigger event in logs: `AWARD_INSIGNIA` precedes; `POST_VISIT_SIGNAL` could be a future action_type (V3 — currently the signal is operational, not logged).
- Hospitality lineage (private-aviation departure ritual reference): `/index.html` Slide 11 capability 12 anchor note (§J #3).
