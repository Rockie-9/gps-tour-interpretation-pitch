import { z } from "zod";

// Structured-output contract for the triage inference call.
// Phase 1 — Claude returns JSON matching this shape via tool use.
// Schema drift is detected by §6.9 `inference_parse_failure_rate`.

export const TriageResultSchema = z.object({
  // §7 fields the system stores directly
  title: z.string().min(8).max(240),
  category: z.enum([
    "geopolitical",
    "physical_security",
    "supply_chain",
    "regulatory",
    "hostile_narrative",
  ]),
  geo: z.object({
    country: z.string().min(2).max(80),
    region: z.string().max(120).optional().nullable(),
    lat: z.number().min(-90).max(90).optional().nullable(),
    lng: z.number().min(-180).max(180).optional().nullable(),
  }),
  primaryActors: z.array(z.string().min(1).max(120)).min(0).max(10),
  urgencyScore: z.number().int().min(1).max(5),
  triageSummary: z.string().min(20).max(2000),
  confidenceScore: z.number().min(0).max(1),

  // §6.7 — fingerprint inputs
  keywordCluster: z.array(z.string().min(1).max(60)).min(0).max(8),

  // §2 — 4-dimension pragmatic rubric scores (1-5, calibrated to rubric v1)
  rubric: z.object({
    threatEscalation: z.number().int().min(1).max(5),
    actorSpecificity: z.number().int().min(1).max(5),
    geoSpecificity: z.number().int().min(1).max(5),
    timeUrgency: z.number().int().min(1).max(5),
  }),

  // §14.3.5 — model self-reports if it spotted instruction-like content
  suspiciousContentFlag: z.boolean(),
  suspiciousContentNote: z.string().max(400).optional().nullable(),
});

export type TriageResult = z.infer<typeof TriageResultSchema>;

// The single allowed tool. §14.3.3 — no file ops, no http, no exec.
export const STORE_JUDGMENT_TOOL = {
  name: "store_judgment",
  description:
    "Store the structured triage judgment for this article. This is the only way to return a result. Do not output text outside tool calls.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string", minLength: 8, maxLength: 240 },
      category: {
        type: "string",
        enum: [
          "geopolitical",
          "physical_security",
          "supply_chain",
          "regulatory",
          "hostile_narrative",
        ],
      },
      geo: {
        type: "object",
        properties: {
          country: { type: "string" },
          region: { type: ["string", "null"] },
          lat: { type: ["number", "null"] },
          lng: { type: ["number", "null"] },
        },
        required: ["country"],
        additionalProperties: false,
      },
      primaryActors: {
        type: "array",
        items: { type: "string" },
        maxItems: 10,
      },
      urgencyScore: { type: "integer", minimum: 1, maximum: 5 },
      triageSummary: { type: "string", minLength: 20, maxLength: 2000 },
      confidenceScore: { type: "number", minimum: 0, maximum: 1 },
      keywordCluster: {
        type: "array",
        items: { type: "string" },
        maxItems: 8,
      },
      rubric: {
        type: "object",
        properties: {
          threatEscalation: { type: "integer", minimum: 1, maximum: 5 },
          actorSpecificity: { type: "integer", minimum: 1, maximum: 5 },
          geoSpecificity: { type: "integer", minimum: 1, maximum: 5 },
          timeUrgency: { type: "integer", minimum: 1, maximum: 5 },
        },
        required: ["threatEscalation", "actorSpecificity", "geoSpecificity", "timeUrgency"],
        additionalProperties: false,
      },
      suspiciousContentFlag: { type: "boolean" },
      suspiciousContentNote: { type: ["string", "null"] },
    },
    required: [
      "title",
      "category",
      "geo",
      "primaryActors",
      "urgencyScore",
      "triageSummary",
      "confidenceScore",
      "keywordCluster",
      "rubric",
      "suspiciousContentFlag",
    ],
    additionalProperties: false,
  },
};
