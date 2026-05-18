# Audit-Run Archive

This directory is the committed history of **selected** eval runs — the
ones that are kept for audit reproducibility. `eval/runs/` (gitignored)
holds the working scratch; only runs that were tied to a meaningful
event get promoted here.

## What gets promoted

| Event | File name pattern |
|---|---|
| Deploy to production | `deploy-<YYYY-MM-DD>-<short-sha>.json` |
| Prompt bump merge    | `prompt-bump-<vN>-<YYYY-MM-DD>.json` |
| Model identifier bump (ADR-007) | `model-bump-<modelId>-<YYYY-MM-DD>.json` |
| Quarterly drift check | `drift-<YYYY-QN>.json` |

## How to promote a run

After a workflow_dispatch run of `.github/workflows/eval.yml`:

1. Download the workflow artifact.
2. Pick the JSON file with the matching event (usually the latest).
3. Rename it per the table above.
4. Move it into this directory.
5. Open a PR titled `[eval-audit] <event>`.
6. Reviewer confirms the run's `passed/total` matches the workflow log.

A small `scripts/promote-eval-run.sh` is the one-liner version; the
file convention is the source of truth either way.

## Retention

Eval audit runs are permanent. They are the calibration provenance for
every `prompt_version` / `model_version` recorded in production
`issues.metadata`. Deleting them defeats the audit story.

## What this is **not**

This is not a benchmark leaderboard. We don't compare runs across
prompts in a single chart. The purpose is "for any production
judgment, you can reconstruct the eval state of the system at that
time."
