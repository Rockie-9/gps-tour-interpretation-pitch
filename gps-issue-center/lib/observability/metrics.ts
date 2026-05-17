import { prisma } from "../db/prisma";

// SPEC §6.9 — Four indicators only. Don't add more without justification —
// "Accidental Platform Engineering" warning applies.
//
//   queue_backlog_size           every 5 min
//   ingestion_success_rate       every hour
//   inference_parse_failure_rate every 5 min
//   monthly_token_cost_usd       every day

export type MetricKey =
  | "queue_backlog_size"
  | "ingestion_success_rate"
  | "inference_parse_failure_rate"
  | "monthly_token_cost_usd";

export async function recordMetric(
  key: MetricKey,
  value: number,
  dimensions?: Record<string, unknown>,
): Promise<void> {
  await prisma.systemMetric.create({
    data: { metricKey: key, value, dimensions: dimensions ?? undefined },
  });
}

export async function recordQueueBacklog(): Promise<number> {
  const size = await prisma.ingestQueueItem.count({ where: { status: "pending" } });
  await recordMetric("queue_backlog_size", size);
  return size;
}

export async function recordIngestionSuccess(sourceId: string, ok: boolean, message?: string): Promise<void> {
  await prisma.sourceHealthSnapshot.create({
    data: {
      sourceId,
      ok,
      consecutiveFailures: ok ? 0 : await nextConsecutive(sourceId),
      lastSuccessAt: ok ? new Date() : undefined,
      message,
    },
  });
}

async function nextConsecutive(sourceId: string): Promise<number> {
  const last = await prisma.sourceHealthSnapshot.findFirst({
    where: { sourceId },
    orderBy: { recordedAt: "desc" },
  });
  if (!last || last.ok) return 1;
  return last.consecutiveFailures + 1;
}

// §8 Phase 1 — degraded-mode policy. After 3 consecutive failures, the
// budget cron flips paused = true. Ingest cron skips paused sources.
const DEGRADE_AFTER = 3;

export async function evaluateAndApplyDegradedMode(): Promise<void> {
  // Find sources with current consecutive-failure run >= threshold.
  const sources = await prisma.sourceHealthSnapshot.groupBy({
    by: ["sourceId"],
    _max: { consecutiveFailures: true, recordedAt: true },
  });

  for (const s of sources) {
    const latest = await prisma.sourceHealthSnapshot.findFirst({
      where: { sourceId: s.sourceId },
      orderBy: { recordedAt: "desc" },
    });
    if (!latest) continue;

    if (!latest.ok && latest.consecutiveFailures >= DEGRADE_AFTER) {
      await prisma.sourceState.upsert({
        where: { sourceId: s.sourceId },
        update: { paused: true, pauseReason: `auto: ${latest.consecutiveFailures} consecutive failures`, pausedAt: new Date() },
        create: { sourceId: s.sourceId, paused: true, pauseReason: "auto: failure threshold", pausedAt: new Date() },
      });
    }
  }
}

export async function isSourcePaused(sourceId: string): Promise<boolean> {
  const state = await prisma.sourceState.findUnique({ where: { sourceId } });
  return state?.paused === true;
}
