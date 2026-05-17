# Runbook

Quick reference for the realistic incidents in Phase 0/1. Add new
sections after every real incident — that's the §14.5.3 discipline.

## How to use this file

For each scenario: **Symptom**, **Where to look**, **Fix**. Keep it short.
If a fix requires more than a paragraph, link to a separate doc instead.

---

## 1. Budget circuit-breaker tripped (ingestion paused)

**Symptom.** `/health` page shows `ingestion paused`. You received an
"[GPS Issue Center] Budget circuit breaker tripped" email. New articles
have stopped flowing in; inference is still draining existing queue.

**Where to look.**
- `cost_log` table — find rows for the offending date.
- `system_flags` table — `ingestion_paused = true` with reason.
- Anthropic console — confirm yesterday's usage matches what we logged.

**Fix.** Root-cause first (don't just clear the flag):
1. Look for prompt or schema change in last 7 days (`git log -- prompts/`)
   that increased tokens-per-judgment.
2. Look for source mis-config dumping junk into the queue.
3. Look for unexpected backfill or reprocess.

Once you understand the cause:
```sql
UPDATE system_flags SET value = false, reason = '<incident link>' WHERE key = 'ingestion_paused';
```
Then commit a note to this runbook describing what happened.

---

## 2. Inference parse-failure rate spike

**Symptom.** Dashboard tile "Parse failure rate (24h)" goes red (> 10%).
Issues stop appearing despite items still queued.

**Where to look.**
- `ingest_queue` rows with `status = 'failed'` — check `last_error`.
- Recent `system_metrics` rows for `inference_parse_failure_rate` —
  look at the `dimensions` JSON.
- `git log -- prompts/ lib/llm/schema.ts` — was the schema or prompt
  changed in the last day?

**Fix.**
- If recent prompt change: **rollback** (`git revert <sha>`, redeploy).
  Then mark affected queue rows as `pending` to reprocess on the old prompt.
- If model behavior changed (no recent code change): check Anthropic
  status page; the pinned model identifier may have a server-side issue.
- If schema strictness was tightened: relax temporarily; open an ADR
  before re-tightening.

---

## 3. Queue stuck (`processing` rows never advance)

**Symptom.** `/health` shows rows stuck in `processing` for > 10 minutes.

**Where to look.**
- Vercel function logs for `/api/cron/infer` — look for `Function execution timed out`.
- The number of `processing` rows; if it equals the batch size from
  one invocation, you have one zombie batch.

**Fix.**
Reset zombies after confirming the function actually died:
```sql
UPDATE ingest_queue
SET status = 'pending'
WHERE status = 'processing'
  AND created_at < now() - interval '15 minutes';
```
The retry counter is unchanged — the row was claimed but not actually
processed. If this repeats, lower `BATCH_SIZE` in
`app/api/cron/infer/route.ts` and open an ADR.

---

## 4. Source down (degraded mode triggered)

**Symptom.** `/sources` page shows a source as `paused`. Article volume
from that source has dropped to zero.

**Where to look.**
- `source_health_snapshots` rows for the affected `source_id` — check
  the last `message` field.
- The connector's `parseStatus()` output — run it manually with
  `tsx -e 'import { getSourceById } from "./lib/sources/registry"; ...'`
  to see the current state.

**Fix.**
- If transient (rate limit, brief outage): clear the pause once health
  recovers:
```sql
UPDATE source_state SET paused = false, pause_reason = NULL WHERE source_id = '<id>';
```
- If permanent (vendor change, ToS change): file a Phase 2 source-replacement
  task. Spec §11 R16 is the project-level risk; don't let degraded mode
  become invisible by sitting paused for weeks.

---

## 5. Suspicious-flagged article (prompt-injection signal)

**Symptom.** `ingest_queue` row with `status = 'suspicious'`. A `/health`
counter shows non-zero suspicious count.

**Where to look.**
- The row's `last_error` field has the model's note about why it flagged.
- The raw_content shows what was in the article.

**Fix.**
- Read the article. If it really is a prompt-injection attempt or
  malicious-payload page, leave the row in `suspicious` (it's the audit
  trail) and log the source URL in `docs/prompt-injection-log.md`
  (create if needed).
- If the model was overly cautious (false positive on the suspicious
  flag itself), manually re-queue the row as `pending`. Add to eval
  ground truth so we catch the over-cautious case in regression.

---

## 6. Database failover / connection storm

**Symptom.** Vercel function logs show `P1001 Can't reach database server`
or similar Prisma connection errors during cron runs.

**Where to look.**
- DB provider status page (Supabase / Neon).
- Whether the `directUrl` is configured — required for migrations and
  for some pooler failure modes.

**Fix.**
- Don't redeploy in a panic. Wait 2-3 minutes for provider failover.
- If persistent, switch DB provider's region or open a ticket; ingestion
  is paused naturally by the cron failing (rows stay `pending`).

---

## 7. Eval regression after prompt change

**Symptom.** `npm run eval` drops below the 80% gate after a prompt PR.

**Where to look.**
- `eval/runs/run-<timestamp>.json` — per-row error details.
- The specific rows that newly fail — which dimension regressed?

**Fix.**
- Don't merge the prompt PR. Iterate on the prompt locally until eval
  returns to baseline.
- Don't loosen the eval to make the prompt pass. The eval is the
  ground truth.

---

## 8. Model deprecation warning from Anthropic

**Symptom.** Email from Anthropic announcing deprecation of our pinned
model.

**Where to look.**
- `docs/adr/ADR-007-model-version-pinning.md` — re-read the bump
  procedure.

**Fix.**
- Don't update `LLM_MODEL_ID` in production until the dev-env eval
  passes per ADR-007.
- Write a new ADR for the bump. Tag the deploy.
