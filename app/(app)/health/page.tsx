import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const [pending, processing, done, failed, suspicious, flagPaused, lastInfer] = await Promise.all([
    prisma.ingestQueueItem.count({ where: { status: "pending" } }),
    prisma.ingestQueueItem.count({ where: { status: "processing" } }),
    prisma.ingestQueueItem.count({ where: { status: "done" } }),
    prisma.ingestQueueItem.count({ where: { status: "failed" } }),
    prisma.ingestQueueItem.count({ where: { status: "suspicious" } }),
    prisma.systemFlag.findUnique({ where: { key: "ingestion_paused" } }),
    prisma.ingestQueueItem.findFirst({
      where: { processedAt: { not: null } },
      orderBy: { processedAt: "desc" },
      select: { processedAt: true },
    }),
  ]);

  return (
    <div>
      <h1>Health</h1>

      <h2>Queue</h2>
      <div className="metric-grid">
        <MetricTile label="Pending" value={String(pending)} />
        <MetricTile label="Processing" value={String(processing)} />
        <MetricTile label="Done" value={String(done)} />
        <MetricTile label="Failed" value={String(failed)} tone={failed > 0 ? "warn" : undefined} />
        <MetricTile label="Suspicious" value={String(suspicious)} tone={suspicious > 0 ? "warn" : undefined} />
      </div>

      <h2>System flags</h2>
      <div className="card">
        {flagPaused?.value ? (
          <>
            <span className="pill danger">ingestion paused</span>
            <p className="muted" style={{ marginTop: 8 }}>{flagPaused.reason}</p>
            <p className="muted" style={{ fontSize: 12 }}>
              Manual recovery only. See <code>docs/runbook.md</code> § Budget circuit-breaker recovery.
            </p>
          </>
        ) : (
          <span className="pill ok">all clear</span>
        )}
      </div>

      <h2>Last inference</h2>
      <div className="card">
        <p>{lastInfer?.processedAt?.toISOString() ?? <span className="muted">never</span>}</p>
      </div>
    </div>
  );
}

function MetricTile({ label, value, tone }: { label: string; value: string; tone?: "warn" | "danger" }) {
  return (
    <div className="metric-card">
      <div className="label">{label}</div>
      <div className={`value ${tone ?? ""}`}>{value}</div>
    </div>
  );
}
