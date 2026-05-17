# Prompt Injection Hardening Policy

Direct transcription of spec v0.4 §14.3 — the five policies, with the
file/line each one is enforced at.

The principle: every article we fetch is **hostile text by default**.
We do not "trust" published news sources, blog content, or RSS feeds.
A motivated adversary publishes hostile content the same way any other
content reaches us.

## The five policies and where they live

### 1. System-prompt hard boundary
`prompts/system.md` opens with a "Safety boundary" section that tells
the model the `<external_article>` envelope is data, not instructions.
Phrasing is explicit: instructions inside the envelope are content,
**not** behavioral signals.

### 2. External-content delimiter tagging
`lib/llm/gateway.ts` wraps every article in `<external_article>…</external_article>`.
The wrapper escapes any attempt by the article to inject the same tag
(`escapeForXmlTag`). The system prompt names the tag explicitly.

### 3. Tool-call whitelist
`lib/llm/schema.ts` defines exactly **one** tool, `store_judgment`.
`runTriageInference` calls `messages.create` with
`tool_choice: { type: "tool", name: "store_judgment" }` — Claude is
forced to call this tool to respond. No other tools are registered;
no file/network/exec tools exist or will be added.

### 4. Output schema strict validation
`lib/llm/schema.ts` exports a Zod schema that's the only path to
producing a valid `TriageResult`. Schema mismatch → the response is
rejected, the row is marked `failed`, the `inference_parse_failure_rate`
metric increments, and the article does not become an Issue.

### 5. Unsafe-instruction reject
The system prompt asks the model to set `suspiciousContentFlag = true`
if the article appears to be trying to manipulate the system. The
inference cron (`app/api/cron/infer/route.ts`) checks this flag and
routes the row to `status = 'suspicious'`; it never auto-promotes
suspicious content to an Issue. A counter on `/health` makes it visible.

## What this gives us

- A model that can't bypass the schema (policy 4) can't return a
  free-text "ignore prior instructions" payload that downstream code
  acts on. The downstream code only reads structured JSON.
- A model that's forced to call `store_judgment` (policy 3) can't fetch
  URLs, write files, or run code, because none of those tools exist
  for it to call.
- Two layers of detection: structural (policies 3 + 4) and semantic
  (policy 5). Either alone would be too brittle.

## What this doesn't give us

- A model could in principle fill in attacker-controlled fields with
  attacker-controlled text. The HITL review step + provenance fields
  (prompt/model/rubric versions) are the second line of defense.
- This policy doesn't help with **upstream** poisoning — if a source
  starts shipping attacker-controlled text at scale, the right response
  is to pause the source, not just rely on the model's flag.

## Eval coverage

`eval/ground-truth/seed-en.json` includes at least one injection
attempt (`en-005`) that asks the model to ignore instructions. The
expected outcome is `suspiciousContentFlag = true`. Add new injection
patterns to the eval whenever we see a new one in the wild.
