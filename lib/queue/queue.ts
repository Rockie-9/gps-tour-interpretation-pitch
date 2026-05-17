import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

// SPEC §6.2 — Concurrency control via `FOR UPDATE SKIP LOCKED`.
// Without SKIP LOCKED, overlapping inference cron runs will double-process
// the same row. This is the standard Postgres queue pattern and costs us
// zero infra spend; omitting it is a guaranteed incident.

export interface ClaimedQueueItem {
  id: string;
  source_url: string;
  source_type: string;
  source_id: string;
  raw_content: string | null;
  title: string | null;
  published_at: Date | null;
  language: string | null;
  source_metadata: unknown;
  retry_count: number;
}

const MAX_RETRY = 3;

/**
 * Atomically claim up to `limit` pending rows and mark them `processing`.
 * Subsequent claims by overlapping workers skip locked rows entirely.
 */
export async function claimPending(limit = 10): Promise<ClaimedQueueItem[]> {
  // Returning all needed columns from the UPDATE avoids a second SELECT.
  return prisma.$queryRaw<ClaimedQueueItem[]>(Prisma.sql`
    WITH claimed AS (
      SELECT id
        FROM ingest_queue
       WHERE status = 'pending'
         AND retry_count < ${MAX_RETRY}
       ORDER BY created_at ASC
       LIMIT ${limit}
       FOR UPDATE SKIP LOCKED
    )
    UPDATE ingest_queue q
       SET status = 'processing'
      FROM claimed
     WHERE q.id = claimed.id
    RETURNING q.id,
              q.source_url,
              q.source_type::text AS source_type,
              q.source_id,
              q.raw_content,
              q.title,
              q.published_at,
              q.language,
              q.source_metadata,
              q.retry_count;
  `);
}

export async function markDone(id: string, issueId: string | null): Promise<void> {
  await prisma.ingestQueueItem.update({
    where: { id },
    data: {
      status: "done",
      processedAt: new Date(),
      issueId: issueId ?? undefined,
    },
  });
}

export async function markFailed(id: string, message: string, parseFailure = false): Promise<void> {
  // Retry up to MAX_RETRY by bouncing back to pending. After that, terminal.
  const item = await prisma.ingestQueueItem.findUnique({
    where: { id },
    select: { retryCount: true },
  });
  if (!item) return;

  const nextRetry = item.retryCount + 1;
  const terminal = nextRetry >= MAX_RETRY;

  await prisma.ingestQueueItem.update({
    where: { id },
    data: {
      status: terminal ? "failed" : "pending",
      retryCount: nextRetry,
      lastError: message.slice(0, 4000),
      processedAt: terminal ? new Date() : null,
    },
  });

  // §6.9 — surface parse failures as a metric so prompt drift is visible.
  if (parseFailure) {
    await prisma.systemMetric.create({
      data: {
        metricKey: "inference_parse_failure_rate",
        value: 1,
        dimensions: { id, terminal },
      },
    });
  }
}

export async function markSuspicious(id: string, note: string): Promise<void> {
  // §14.3.5 — unsafe-instruction棄置. Routed to a HITL review queue,
  // never auto-promoted to an Issue.
  await prisma.ingestQueueItem.update({
    where: { id },
    data: {
      status: "suspicious",
      processedAt: new Date(),
      lastError: note.slice(0, 4000),
    },
  });
}

export async function backlogSize(): Promise<number> {
  return prisma.ingestQueueItem.count({ where: { status: "pending" } });
}
