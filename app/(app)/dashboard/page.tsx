import { prisma } from "@/lib/db/prisma";
import { dailyBudgetUsd, yesterdaySpendUsd } from "@/lib/cost/budget";
import { fingerprintHitRate } from "@/lib/correlation/fingerprint";

export const dynamic = "force-dynamic";

// SPEC §6.9 — Four metric tiles + a few diagnostic numbers.
// Do not expand this without justification. Spec explicitly excludes
// retry distribution, hallucinated schema rate, latency p99 from Phase 1.

export default async function DashboardPage() {
  const [backlog, recentParseFails, yesterdayUsd, hitRate, monthlySpend] = await Promise.all([
    prisma.ingestQueueItem.count({ where: { status: "pending" } }),
    prisma.systemMetric.findMany({
      where: {
        metricKey: "inference_parse_failure_rate",
        recordedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { recordedAt: "desc" },
      take: 50,
    }),
    yesterdaySpendUsd(),
    fingerprintHitRate(14),
    monthToDateSpend(),
  ]);

  const parseFailureAvg = recentParseFails.length
    ? recentParseFails.reduce((acc, m) => acc + Number(m.value), 0) / recentParseFails.length
    : 0;

  const cap = dailyBudgetUsd();

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted">Phase 0 observability. Four indicators per §6.9.</p>

      <div className="metric-grid">
        <MetricTile
          label="Queue backlog"
          value={String(backlog)}
          tone={backlog > 200 ? "danger" : backlog > 50 ? "warn" : "ok"}
          delta="rows in `pending` status"
        />
        <MetricTile
          label="Parse failure rate (24h)"
          value={`${(parseFailureAvg * 100).toFixed(1)}%`}
          tone={parseFailureAvg > 0.1 ? "danger" : parseFailureAvg > 0.03 ? "warn" : "ok"}
          delta={`${recentParseFails.length} batches sampled`}
        />
        <MetricTile
          label="Yesterday spend"
          value={`$${yesterdayUsd.toFixed(2)}`}
          tone={yesterdayUsd > cap * 1.5 ? "danger" : yesterdayUsd > cap ? "warn" : "ok"}
          delta={`vs daily cap $${cap.toFixed(2)}`}
        />
        <MetricTile
          label="MTD spend"
          value={`$${monthlySpend.toFixed(2)}`}
          delta={`monthly cap $${Number(process.env.MONTHLY_BUDGET_USD ?? 500).toFixed(0)}`}
        />
      </div>

      <h2>Correlation hit rate (last 14 days)</h2>
      <div className="card">
        <p className="muted" style={{ marginTop: 0 }}>
          Fingerprint heuristic. Spec §6.7: if hit rate &lt; 70% in Phase 2,
          escalate to embedding-based correlation.
        </p>
        <p>
          {hitRate.total === 0 ? (
            <span className="muted">No suggestions yet.</span>
          ) : (
            <>
              <strong>{hitRate.accepted}/{hitRate.total}</strong>{" "}
              ({Math.round((hitRate.accepted / hitRate.total) * 100)}%) accepted by HITL.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  tone,
  delta,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "danger";
  delta?: string;
}) {
  return (
    <div className="metric-card">
      <div className="label">{label}</div>
      <div className={`value ${tone ?? ""}`}>{value}</div>
      {delta && <div className="delta">{delta}</div>}
    </div>
  );
}

async function monthToDateSpend(): Promise<number> {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const rows = await prisma.costLogEntry.findMany({
    where: { forDate: { gte: start } },
    select: { estimatedUsd: true },
  });
  return rows.reduce((acc, r) => acc + Number(r.estimatedUsd), 0);
}
