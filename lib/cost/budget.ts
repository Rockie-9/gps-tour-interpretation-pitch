import { prisma } from "../db/prisma";

// SPEC §9.2 — Daily-aggregated budget circuit breaker.
//
//  - Daily cron pulls yesterday's token usage, writes cost_log.
//  - If yesterday's USD > daily_budget * 1.5, flip ingestion_paused = true.
//  - Inference cron keeps draining the queue. Manual recovery only.

// Anthropic Sonnet 4 list pricing as of v0.4 publish.
// Source of truth: anthropic.com/pricing — update via PR + ADR if changed.
const PRICE_PER_MTOK_INPUT_USD = 3.0;
const PRICE_PER_MTOK_OUTPUT_USD = 15.0;
const PRICE_PER_MTOK_CACHE_READ_USD = 0.3;

export function estimateCostUsd(usage: {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
}): number {
  return (
    (usage.inputTokens * PRICE_PER_MTOK_INPUT_USD) / 1_000_000 +
    (usage.outputTokens * PRICE_PER_MTOK_OUTPUT_USD) / 1_000_000 +
    ((usage.cacheReadTokens ?? 0) * PRICE_PER_MTOK_CACHE_READ_USD) / 1_000_000
  );
}

export function dailyBudgetUsd(): number {
  const monthly = Number(process.env.MONTHLY_BUDGET_USD ?? 500);
  return (monthly * 1.1) / 30;
}

export async function recordInferenceCost(
  modelId: string,
  usage: { inputTokens: number; outputTokens: number; cacheReadTokens?: number },
): Promise<void> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await prisma.costLogEntry.create({
    data: {
      forDate: today,
      inputTokens: BigInt(usage.inputTokens),
      outputTokens: BigInt(usage.outputTokens),
      cacheReadTokens: BigInt(usage.cacheReadTokens ?? 0),
      estimatedUsd: estimateCostUsd(usage).toFixed(4),
      modelId,
    },
  });
}

export async function yesterdaySpendUsd(): Promise<number> {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 1);
  const until = new Date(since);
  until.setUTCDate(until.getUTCDate() + 1);

  const rows = await prisma.costLogEntry.findMany({
    where: { forDate: { gte: since, lt: until } },
    select: { estimatedUsd: true },
  });
  return rows.reduce((acc, r) => acc + Number(r.estimatedUsd), 0);
}

export async function evaluateBudgetCircuitBreaker(): Promise<{
  tripped: boolean;
  yesterdayUsd: number;
  dailyBudgetUsd: number;
}> {
  const spent = await yesterdaySpendUsd();
  const cap = dailyBudgetUsd();
  const tripped = spent > cap * 1.5;

  if (tripped) {
    await prisma.systemFlag.upsert({
      where: { key: "ingestion_paused" },
      update: { value: true, reason: `budget: $${spent.toFixed(2)} > 1.5× daily cap $${cap.toFixed(2)}` },
      create: {
        key: "ingestion_paused",
        value: true,
        reason: `budget: $${spent.toFixed(2)} > 1.5× daily cap $${cap.toFixed(2)}`,
      },
    });
  }
  return { tripped, yesterdayUsd: spent, dailyBudgetUsd: cap };
}

export async function isIngestionPaused(): Promise<boolean> {
  const flag = await prisma.systemFlag.findUnique({ where: { key: "ingestion_paused" } });
  return flag?.value === true;
}
