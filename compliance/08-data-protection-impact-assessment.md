# Artifact 8 — Data Protection Impact Assessment (PDPA / GDPR / CCPA)

**Status**: 🔲 todo — needs legal input; do not complete unilaterally
**Spec ref**: §10 item 8, §14.2

## Why this matters

A DPIA is **legally required** under GDPR Article 35 for high-risk
processing of personal data. Our processing produces named-entity
profiles ("primary actors" in `issues`) including possibly natural
persons (an organizer of a protest, a named bureaucrat, a doxed
TSMC staff member in a hostile-narrative case). That's the trigger.

The TSMC reviewer will look for a DPIA document. Don't fake one.

## Sections a DPIA must contain (template)

### 1. Description of processing

- Nature, scope, context, and purposes of the processing.
- Inputs: public-source news articles, ACLED structured events,
  optional manual feeds.
- Outputs: structured triage with `primary_actors` (may name natural
  persons), urgency score, geo, summary text.
- Recipients: 10-person GPS team in Taiwan.
- Retention: per `docs/data-retention.md`.

### 2. Necessity and proportionality

- Why public-source data; why model-assisted triage; why we name
  individuals (only when the source article does, and only to the
  extent of the source article).
- Lawful basis under GDPR Article 6 — most likely Article 6(1)(f)
  "legitimate interests" given TSMC's safety duty to staff.
- Special-category data — race, religion, political opinion. The
  system **may** incidentally process these when source articles
  describe political protests. Article 9 applies; document this.

### 3. Risks to individuals

- Identification of individuals by name + location + activity.
- Profiling — yes, we infer `urgencyScore` from text about
  individuals. This is automated decision-making under Article 22 if
  it produces "legal or similarly significant effects". It does not
  (a GPS analyst reads every Issue), but document the boundary.
- Onward disclosure inside TSMC.
- Re-identification of pseudonymous sources.

### 4. Mitigations

- HITL review on every Issue (no fully-automated effect).
- §14.2 retention purges raw text at 90 days.
- §6.8 authz matrix restricts who can see what.
- `issue_history` provides auditability for any subject access
  request.
- Subject Access Request flow — **needed for Phase 3**, see §SAR.

### 5. Cross-border transfer assessment

- See `compliance/02-cross-border-data-flow.md`.

### 6. SAR / right-to-erasure procedure

A natural person identified in our system may request:
- a copy of the data we hold about them (SAR).
- correction or erasure (Article 16, 17).

**The SAR/erasure flow does not exist yet** (spec defers it to
Phase 3). For Phase 1-2 in external prototype, document that:

- No external natural-person SARs are expected during prototype.
- Any in-team request follows ad-hoc legal review.
- Phase 3 SAR endpoint design is part of artifact 11.

## How to close

This artifact needs TSMC's privacy / legal team to author the
substantive content. Engineering provides the data-flow facts;
legal provides the assessment and sign-off.
