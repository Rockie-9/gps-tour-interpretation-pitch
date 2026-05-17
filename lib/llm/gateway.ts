import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";
import path from "node:path";
import { STORE_JUDGMENT_TOOL, TriageResultSchema, type TriageResult } from "./schema";

// SPEC §6.3 — LLM Gateway abstraction.
//
// Anthropic SDK MUST NOT appear in any other file. Other code calls
// `runTriageInference()`. Phase 3 may rewrite this file to target
// Bedrock or Vertex (TSMC IT decides); the function signature is the
// contract.
//
// Do not extend this into a framework / policy enforcement layer.
// Spec §6.3 caps this at "a 30-60 line plain function".

const PROMPTS_DIR = path.join(process.cwd(), "prompts");

let _systemPrompt: string | null = null;
function loadSystemPrompt(): string {
  if (_systemPrompt !== null) return _systemPrompt;
  const system = readFileSync(path.join(PROMPTS_DIR, "system.md"), "utf-8");
  const rubric = readFileSync(path.join(PROMPTS_DIR, "rubric.md"), "utf-8");
  _systemPrompt = `${system}\n\n---\n\n${rubric}`;
  return _systemPrompt;
}

// Prompt version is a function of the prompt files on disk. §8 Phase 1
// "Prompt rollback": prompts are git-versioned; version tags come from
// git SHA. We expose a build-time env override for traceability.
export const PROMPT_VERSION = process.env.PROMPT_VERSION ?? "v1";
export const RUBRIC_VERSION = process.env.RUBRIC_VERSION ?? "v1";

export interface TriageInput {
  title?: string;
  publishedAt?: Date;
  language?: string;
  sourceUrl: string;
  content: string;
  sourceId: string;
}

export interface TriageInferenceOutcome {
  ok: true;
  result: TriageResult;
  modelVersion: string;
  promptVersion: string;
  rubricVersion: string;
  usage: { inputTokens: number; outputTokens: number };
}

export interface TriageInferenceFailure {
  ok: false;
  reason:
    | "schema_violation"
    | "no_tool_call"
    | "api_error"
    | "timeout"
    | "suspicious_content_rejected";
  message: string;
  modelVersion: string;
  promptVersion: string;
  rubricVersion: string;
  usage?: { inputTokens: number; outputTokens: number };
}

export type TriageInferenceResult = TriageInferenceOutcome | TriageInferenceFailure;

let _anthropic: Anthropic | null = null;
function client(): Anthropic {
  if (_anthropic) return _anthropic;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is required");
  _anthropic = new Anthropic({ apiKey });
  return _anthropic;
}

// §14.4 — pinned identifier, no `-latest` aliases.
const MODEL_ID = process.env.LLM_MODEL_ID ?? "claude-sonnet-4-20250514";

/**
 * Single entrypoint for triage inference (spec §6.3, renamed in v0.4 — was
 * `runClaudeJudgment` in v0.3; rename keeps domain action separate from
 * provider). Returns a discriminated union; callers handle both branches.
 */
export async function runTriageInference(input: TriageInput): Promise<TriageInferenceResult> {
  const system = loadSystemPrompt();

  // §14.3.2 — external content is delimited so the model is structurally
  // unable to confuse it with instructions.
  const userMessage = [
    "<external_article>",
    `<source_id>${input.sourceId}</source_id>`,
    `<source_url>${input.sourceUrl}</source_url>`,
    input.publishedAt ? `<published_at>${input.publishedAt.toISOString()}</published_at>` : "",
    input.language ? `<language>${input.language}</language>` : "",
    input.title ? `<title>${escapeForXmlTag(input.title)}</title>` : "",
    "<content>",
    escapeForXmlTag(input.content),
    "</content>",
    "</external_article>",
    "",
    "Call store_judgment with the structured triage for the article above.",
  ]
    .filter(Boolean)
    .join("\n");

  let response: Anthropic.Messages.Message;
  try {
    response = await client().messages.create({
      model: MODEL_ID,
      max_tokens: 1500,
      system,
      tools: [STORE_JUDGMENT_TOOL],
      tool_choice: { type: "tool", name: STORE_JUDGMENT_TOOL.name },
      messages: [{ role: "user", content: userMessage }],
    });
  } catch (err) {
    return {
      ok: false,
      reason: "api_error",
      message: err instanceof Error ? err.message : String(err),
      modelVersion: MODEL_ID,
      promptVersion: PROMPT_VERSION,
      rubricVersion: RUBRIC_VERSION,
    };
  }

  const usage = {
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return {
      ok: false,
      reason: "no_tool_call",
      message: "model returned no store_judgment tool_use block",
      modelVersion: MODEL_ID,
      promptVersion: PROMPT_VERSION,
      rubricVersion: RUBRIC_VERSION,
      usage,
    };
  }

  const parsed = TriageResultSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "schema_violation",
      message: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      modelVersion: MODEL_ID,
      promptVersion: PROMPT_VERSION,
      rubricVersion: RUBRIC_VERSION,
      usage,
    };
  }

  return {
    ok: true,
    result: parsed.data,
    modelVersion: MODEL_ID,
    promptVersion: PROMPT_VERSION,
    rubricVersion: RUBRIC_VERSION,
    usage,
  };
}

function escapeForXmlTag(s: string): string {
  // §14.3.1 — avoid trivial tag-injection of the delimiter itself.
  return s.replace(/<\/?external_article>/gi, "[redacted-tag]");
}
