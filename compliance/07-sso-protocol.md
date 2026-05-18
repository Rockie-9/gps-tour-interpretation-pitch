# Artifact 7 — SSO Protocol Confirmation

**Status**: ⬛ Phase 2 deliverable (spec §8 Phase 2 Week 8-9 IT informal contact)
**Spec ref**: §10 item 7

## What this artifact is

A signed statement from TSMC IT specifying which SSO protocol the
Phase 3 deployment integrates with, plus the configuration
parameters.

## Required from TSMC IT

- Protocol — SAML 2.0 / OIDC / OAuth 2.0?
- Identity provider — Azure AD / Okta / on-prem ADFS / other?
- Endpoints — login, logout, metadata, JWKS.
- Claims mapping — which IdP claim maps to our `role` enum?
- Group sync — do we read group membership from a SCIM endpoint, or
  flat role claims?
- Session policy — session lifetime, re-auth requirements.
- Test tenant access for Phase 2 informal-integration testing.

## Implementation expectation

Per ADR-002 + ADR-004:

- Auth.js v5 supports SAML and OIDC out of the box; the changes are
  in `lib/auth/auth.ts` (provider configuration) and `.env`
  (endpoints + client secret).
- No changes expected to `lib/auth/authorize.ts` — the authz matrix
  doesn't care how the user authenticated.
- Phase 1 Credentials/Email provider becomes inactive after cutover.

## How to close out this artifact

1. Phase 2 Week 8-9: informal IT contact (spec §8). Capture protocol
   choice in this file.
2. Phase 3 PR adds the real provider config; cite this artifact in
   the PR description.
3. Update STATUS row 7 to ✅.
