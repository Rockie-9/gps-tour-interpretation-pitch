# Prompt changelog

Every prompt change goes here. Source of truth for `prompt_version` is
the SHA of the most recent change to `prompts/` — set via PR.

## v1 (Phase 0)

Initial system prompt + rubric.

- `system.md` — five-policy prompt-injection hardening (§14.3), 5-category
  taxonomy, scoring conventions, brevity rule, junk-article handling.
- `rubric.md` — 4-dimension pragmatic rubric with calibrated 1-5 scales.

## Process

1. Open a PR titled `[prompt] <short summary>`.
2. Run `npm run eval` locally; paste the output in the PR description.
3. If accuracy drops below the gate, do not merge.
4. After merge, tag the deploy and update `PROMPT_VERSION` env var to
   the new SHA.
5. If the change is a rollback or hotfix, also queue affected rows in
   `ingest_queue` back to `pending` so re-judgment happens on the new
   prompt (§8 Phase 1 reprocess flag).
