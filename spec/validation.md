# Validation method

V2 step P8 (item 34). How we know the deck works for its readers — not just whether the code passes a smoke test.

The smoke test (`tools/smoke-test.sh`) verifies the deck is internally consistent. This document verifies the deck is externally useful. Different concern, different cadence.

---

## The 10-persona panel

V2 was built in response to feedback from a 10-persona panel review (Aiko, Marco, Priya, Lin, Hassan, Hans, Yuki, James, Sara, Wai-Ling — listed in the original review thread). The panel surfaced 40 actionable items; V2 built 1–35.

**The panel is reusable.** It is the primary validation harness for V3 and beyond. Each iteration should:

1. **Pre-flight**: read the V2 STATUS.md and identify which persona complaints are addressed.
2. **Build**: ship the iteration.
3. **Re-poll**: ask each of the same 10 personas (or their analogues) whether their original complaint is resolved.
4. **Score**: per-persona resolution (resolved / partial / unresolved / new-concern).
5. **Update STATUS.md**: items move from ⬜/🟡/✅ to validated-✅ or back to 🟡 with the new concern.

---

## V3 panel additions (P8 follow-up)

V2 commits to recruiting 5 new personas for V3 — broadening coverage. Suggested additions:

| Persona type | Why this persona |
|---|---|
| Korean visitor (museum-goer) | Tests cross-cultural reach beyond the TC/EN/JP trilingual cap; reveals if visitor needs are language-bound. |
| NAI peer reviewer #2 (different than James) | Triangulates curriculum critique; one reviewer is anecdote, two is a pattern. |
| DE site staff (Hans's frontline counterpart) | Confirms or refutes whether Hans's structural complaint reflects staff-level experience. |
| Partially-sighted user (NVDA/JAWS) | Triangulates Hassan's accessibility findings; one screen-reader user is a data point, two start a trend. |
| Parent with small child | Tests scenarios A1 (wayfinding) and B2 (group reception) for non-VIP family use. |

Recruitment is **blocked-on-user-reach** (see V2.5 SME table) — V2 ships the slot; the user fills the seat.

---

## Cadence

- **Per release**: 10-persona re-poll (~1 hour per persona = 10 person-hours per release).
- **Per quarter**: 5-new-persona refresh (rotate which 5 of the V3 set are queried; ~5 person-hours per quarter).
- **Per major iteration (V3, V4, ...)**: full 15-persona review.

---

## How to capture findings

1. Each persona's feedback goes into a GitHub issue labeled `panel-feedback` (template TBD; pattern same as deck-feedback.yml).
2. The issue is linked from the relevant slide's persona-feedback section if needed.
3. Issues that survive triage become items in the next version's STATUS.md.

---

## Threshold for action

| Signal | Response |
|---|---|
| 1 persona raises a concern | Note in STATUS.md; consider for next iteration. |
| 2+ personas raise the same concern | Add to iteration scope. |
| 3+ personas raise the same concern | Pre-empt the iteration; treat as urgent. |
| A persona's PRIOR concern resurfaces | High signal — the previous fix was insufficient; rebuild. |

---

## What is NOT in this validation method

- A/B testing — V2 has no instrumentation to support traffic splitting.
- Quantitative engagement metrics — V2 has no analytics.
- Net Promoter Score on the deck — too abstract a signal at this scale.
- Implementation-tool testing — covered by future tool's own QA, not this document.

---

## Why personas, not metrics

At ~200 staff and a single-file deck, statistical instrumentation is overkill and arguably misleading. Persona feedback is qualitatively richer, faster to act on, and avoids the "vanity-metric" trap. When the program scales to 2000+ staff and a real tool ships, this can be revisited.

---

## Cross-reference

- V2 STATUS tracker: `/STATUS.md`
- Feedback issue template: `/.github/ISSUE_TEMPLATE/deck-feedback.yml`
- P8 step in V2 plan: `/root/.claude/plans/develop-and-enhance-the-unified-hare.md` → V2.5 table
