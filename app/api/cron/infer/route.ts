import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { runTriageInference } from "@/lib/llm/gateway";
import { claimPending, markDone, markFailed, markSuspicious } from "@/lib/queue/queue";
import { suggestCorrelations } from "@/lib/correlation/fingerprint";
import { recordInferenceCost } from "@/lib/cost/budget";
import { recordMetric } from "@/lib/observability/metrics";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // §6.2 — inference cron may run up to 5 minutes

// SPEC §8 Phase 1 — Inference Cron, every 5 min. Drains the queue using
// FOR UPDATE SKIP LOCKED. Overlapping invocations are safe.

const BATCH_SIZE = 10;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const items = await claimPending(BATCH_SIZE);
  const results: Array<{ id: string; outcome: string; reason?: string; issueId?: string }> = [];

  for (const item of items) {
    if (!item.raw_content) {
      await markFailed(item.id, "raw_content is null (already retention-purged)");
      results.push({ id: item.id, outcome: "skipped_empty" });
      continue;
    }

    const inference = await runTriageInference({
      title: item.title ?? undefined,
      publishedAt: item.published_at ?? undefined,
      language: item.language ?? undefined,
      sourceUrl: item.source_url,
      content: item.raw_content,
      sourceId: item.source_id,
    });

    if (!inference.ok) {
      const isParseFailure =
        inference.reason === "schema_violation" || inference.reason === "no_tool_call";
      await markFailed(item.id, `${inference.reason}: ${inference.message}`, isParseFailure);
      results.push({ id: item.id, outcome: "failed", reason: inference.reason });
      continue;
    }

    const { result } = inference;

    // §14.3.5 — suspicious content quarantine. Never auto-promote to Issue.
    if (result.suspiciousContentFlag) {
      await markSuspicious(item.id, result.suspiciousContentNote ?? "model-flagged suspicious content");
      results.push({ id: item.id, outcome: "suspicious" });
      continue;
    }

    // Persist the Issue + history + cost atomically.
    const issue = await prisma.$transaction(async (tx) => {
      const created = await tx.issue.create({
        data: {
          title: result.title,
          category: result.category,
          geo: result.geo as object,
          primaryActors: result.primaryActors,
          urgencyScore: result.urgencyScore,
          triageSummary: result.triageSummary,
          confidenceScore: result.confidenceScore.toFixed(2),
          status: "triaged",
          metadata: {
            rubric: result.rubric,
            keywordCluster: result.keywordCluster,
            sourceUrl: item.source_url,
            sourceId: item.source_id,
            queueItemId: item.id,
          },
          promptVersion: inference.promptVersion,
          modelVersion: inference.modelVersion,
          rubricVersion: inference.rubricVersion,
        },
      });
      await tx.issueHistory.create({
        data: {
          issueId: created.id,
          action: "triaged",
          actorId: null,
          payload: { source: item.source_id, urgencyScore: result.urgencyScore },
          promptVersion: inference.promptVersion,
          modelVersion: inference.modelVersion,
          rubricVersion: inference.rubricVersion,
        },
      });
      return created;
    });

    await markDone(item.id, issue.id);

    await recordInferenceCost(inference.modelVersion, inference.usage);

    // §6.7 — suggest correlations. Never auto-merge.
    await suggestCorrelations({
      issueId: issue.id,
      geoCountry: result.geo.country,
      primaryActors: result.primaryActors,
      publishedAt: item.published_at ?? issue.createdAt,
      keywordCluster: result.keywordCluster,
    });

    results.push({ id: item.id, outcome: "ok", issueId: issue.id });
  }

  // §6.9 — emit aggregate metric for this run.
  if (items.length > 0) {
    const parseFailures = results.filter(
      (r) => r.reason === "schema_violation" || r.reason === "no_tool_call",
    ).length;
    await recordMetric("inference_parse_failure_rate", parseFailures / items.length, {
      batchSize: items.length,
    });
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
