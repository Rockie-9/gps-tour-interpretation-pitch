import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getEnabledSources } from "@/lib/sources/registry";
import {
  evaluateAndApplyDegradedMode,
  isSourcePaused,
  recordIngestionSuccess,
  recordQueueBacklog,
} from "@/lib/observability/metrics";
import { isIngestionPaused } from "@/lib/cost/budget";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // §6.2 — guard against Vercel serverless timeouts

// SPEC §8 Phase 1 — Ingestion Cron, hourly.
// Vercel Cron triggers GET; auth via shared CRON_SECRET header.

const LOOKBACK_HOURS = 2;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // §9.2 — budget kill-switch. Inference keeps draining.
  if (await isIngestionPaused()) {
    return NextResponse.json({ ok: false, skipped: "ingestion_paused" });
  }

  const since = new Date();
  since.setHours(since.getHours() - LOOKBACK_HOURS);

  const sources = getEnabledSources();
  const summary: Array<{ id: string; fetched: number; queued: number; error?: string }> = [];

  for (const source of sources) {
    if (await isSourcePaused(source.id)) {
      summary.push({ id: source.id, fetched: 0, queued: 0, error: "paused (degraded mode)" });
      continue;
    }
    try {
      const articles = await source.fetch({ since, limit: 100 });
      let queued = 0;
      for (const a of articles) {
        // Postgres "ON CONFLICT DO NOTHING" via Prisma createMany skipDuplicates
        // would be faster, but per-row gives us accurate `queued` count.
        try {
          await prisma.ingestQueueItem.create({
            data: {
              sourceUrl: a.sourceUrl,
              sourceType: mapSourceType(source.id),
              sourceId: source.id,
              rawContent: a.content,
              title: a.title,
              publishedAt: a.publishedAt,
              language: a.language,
              sourceMetadata: a.sourceMetadata as object,
              status: "pending",
            },
          });
          queued++;
        } catch {
          // unique-constraint collision = already seen this URL. Skip.
        }
      }
      await recordIngestionSuccess(source.id, true, `fetched=${articles.length}`);
      summary.push({ id: source.id, fetched: articles.length, queued });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await recordIngestionSuccess(source.id, false, msg);
      summary.push({ id: source.id, fetched: 0, queued: 0, error: msg });
    }
  }

  await evaluateAndApplyDegradedMode();
  await recordQueueBacklog();

  return NextResponse.json({ ok: true, summary });
}

function mapSourceType(id: string): "newsapi" | "google_news_rss" | "acled" | "other" {
  if (id === "newsapi") return "newsapi";
  if (id === "google_news_rss") return "google_news_rss";
  if (id === "acled") return "acled";
  return "other";
}
