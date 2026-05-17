# Curriculum — Modules M1–M9

V2 step C10 (item 11). Per-module outline cards for the three-phase training curriculum (Explorer · Builder · Architect).

**Honest scope label**: every card in this directory is **v0.1 outline** unless explicitly upgraded. The deck's Slide 14 (Layer 05 Operations) describes nine modules; this directory makes each one navigable and identifies what content remains to be SME-filled before the module can actually run.

James's review (#8 in the 10-persona panel) flagged that the deck presents M1–M9 as a curriculum spec when it is in fact a syllabus heading. This directory closes that gap honestly: structure is present; full SME content is **blocked-on-SME** and labeled as such per card.

---

## Phase + module index

### Phase 1 — Explorer (4 weeks)

| Module | Title | State |
|---|---|---|
| [M1](./m1/) | TORE 入門 · TORE basics | 🚧 v0.1 outline · SME content pending |
| [M2](./m2/) | 嗓音與體能 · Voice & Stamina | 🚧 v0.1 outline · SME content pending |
| [M3](./m3/) | 路引與微導覽 · Wayfinding & Micro-tour | 🚧 v0.1 outline · SME content pending |

### Phase 2 — Builder (8 weeks)

| Module | Title | State |
|---|---|---|
| [M4](./m4/) | 主題提煉 · Theme Crafting | 🚧 v0.1 outline · SME content pending |
| [M5](./m5/) | 跨文化敏感度 · Cross-cultural Sensitivity | 🚧 v0.1 outline · **largest SME ask** — taboo lists, gesture maps, proxemics charts per 5 regions |
| [M6](./m6/) | 服務恢復 · Service Recovery | 🚧 v0.1 outline · SME content pending |

### Phase 3 — Architect (ongoing)

| Module | Title | State |
|---|---|---|
| [M7](./m7/) | 微體驗設計 · Micro-experience Design | 🚧 v0.1 outline · SME content pending |
| [M8](./m8/) | 校準與評估 · Calibration & Assessment | 🚧 v0.1 outline · SME content pending |
| [M9](./m9/) | 帶人與認證 · Mentoring & Certification | 🚧 v0.1 outline · SME content pending |

---

## Per-card structure

Each `m{1..9}/README.md` follows this template:

```
# Mn · <Module Title TC · EN · JP>

## Phase
Explorer | Builder | Architect

## Time budget
Hours of content; days of validation.

## Learning outcome
One sentence — what the trainee can do at end of module.

## Maps to capabilities
List Layer 02 capability numbers covered.

## Sample artifact (v0.1)
What deliverable a trainee produces. Placeholder until SME fills.

## Validation rubric
What the validator checks. Three-state (present/partial/absent), per BARS lineage.

## Dependencies
Which other modules must complete first.

## SME content still needed
Explicit list of what is NOT yet in this card and who needs to supply it.
```

This template enforces honesty (the "SME content still needed" section is mandatory; no card can claim completeness without filling it).

---

## How modules relate to Recognition tiers

| Phase | Required for tier promotion |
|---|---|
| Explorer (M1–M3) | L0 → L1 |
| Builder (M4–M6) | L1 → L2; some L2 → L3 |
| Architect (M7–M9) | L3 → L4; M9 = required for L5 |

Promotion events (`PROMOTE_TIER` in `/spec/payloads.md`) cite the modules completed as evidence. The validation rubric per module produces the evidence object.

---

## V3 escalation path (SME content)

When SME engagement happens (per V2.5 owner: NAI-credentialled SME):

1. SME fills the "Sample artifact" and "Validation rubric" sections per module.
2. SME adds content files alongside `README.md` (e.g. `m1/tore-worksheet-v1.0.md`, `m5/taboo-card-jp-v1.0.md`).
3. State in this README updates from 🚧 to ✅.
4. The module becomes runnable; can be assigned via the LINE OA shift-start push (V3 tooling).

---

## Cross-reference

- Module list (in deck): `/index.html` Slide 14 (Layer 05) → 9-module rubric panel
- Module validation produces: events of type `VALIDATE_MODULE` per `/spec/payloads.md`
- Module trigger rule: `MODULE_VOID` in `/spec/audit-events.json` if validation output absent
- STATUS tracker: `/STATUS.md` → Phase C → C10
