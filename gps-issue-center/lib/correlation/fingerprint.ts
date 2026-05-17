import type { Issue } from "@prisma/client";
import { prisma } from "../db/prisma";

// SPEC §6.7 — Fingerprint-based correlation. No embeddings; pure heuristic.
// Three dimensions: geo (country), actor (case-insensitive intersection),
// event-window (±3 days of issue createdAt).
//
// Output is only a SUGGESTION written to correlation_suggestions.
// Auto-merge is forbidden; HITL accepts/rejects.

const EVENT_WINDOW_DAYS = 3;

export interface FingerprintInput {
  issueId: string;
  geoCountry: string;
  primaryActors: string[];
  publishedAt: Date;
  keywordCluster: string[];
}

export async function suggestCorrelations(input: FingerprintInput): Promise<void> {
  const lo = new Date(input.publishedAt);
  lo.setDate(lo.getDate() - EVENT_WINDOW_DAYS);
  const hi = new Date(input.publishedAt);
  hi.setDate(hi.getDate() + EVENT_WINDOW_DAYS);

  // Pull candidate set scoped by country — cheap index hit.
  const candidates = await prisma.issue.findMany({
    where: {
      id: { not: input.issueId },
      // geo is JSONB; filter in Postgres via JSON path.
      // Prisma JSON filtering on nested fields:
      geo: { path: ["country"], equals: input.geoCountry },
    },
    select: {
      id: true,
      primaryActors: true,
      createdAt: true,
      geo: true,
    },
    take: 200,
    orderBy: { createdAt: "desc" },
  });

  const actorsLower = new Set(input.primaryActors.map((a) => a.toLowerCase()));

  for (const c of candidates) {
    const overlap = c.primaryActors
      .map((a: string) => a.toLowerCase())
      .filter((a: string) => actorsLower.has(a));
    if (overlap.length === 0) continue;

    const inWindow = c.createdAt >= lo && c.createdAt <= hi;
    const kind: "merge" | "link" = inWindow ? "merge" : "link";

    // Upsert by unique (source, target) pair. Skip if user already decided.
    await prisma.correlationSuggestion.upsert({
      where: {
        sourceIssueId_targetIssueId: { sourceIssueId: input.issueId, targetIssueId: c.id },
      },
      update: {}, // never clobber an existing decision
      create: {
        sourceIssueId: input.issueId,
        targetIssueId: c.id,
        kind,
        fingerprint: {
          geoMatch: input.geoCountry,
          actorOverlap: overlap,
          inEventWindow: inWindow,
          keywordCluster: input.keywordCluster,
        },
      },
    });
  }
}

// Used by §6.9 dashboard to report how well fingerprint correlation is
// catching duplicates. Decision: if Phase 2 hit-rate < 70%, escalate to
// embedding-based correlation. Read by the metrics endpoint.
export async function fingerprintHitRate(sinceDays = 14): Promise<{ total: number; accepted: number }> {
  const since = new Date();
  since.setDate(since.getDate() - sinceDays);
  const [total, accepted] = await Promise.all([
    prisma.correlationSuggestion.count({ where: { createdAt: { gte: since } } }),
    prisma.correlationSuggestion.count({ where: { createdAt: { gte: since }, status: "accepted" } }),
  ]);
  return { total, accepted };
}
