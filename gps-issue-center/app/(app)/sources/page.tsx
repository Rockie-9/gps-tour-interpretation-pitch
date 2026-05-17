import { prisma } from "@/lib/db/prisma";
import { getEnabledSources } from "@/lib/sources/registry";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const sources = getEnabledSources();

  // Latest snapshot per source.
  const latest = await prisma.sourceHealthSnapshot.findMany({
    orderBy: { recordedAt: "desc" },
    take: 100,
  });
  const latestBySource = new Map<string, typeof latest[number]>();
  for (const s of latest) if (!latestBySource.has(s.sourceId)) latestBySource.set(s.sourceId, s);

  const states = await prisma.sourceState.findMany();
  const stateBy = new Map(states.map((s) => [s.sourceId, s]));

  return (
    <div>
      <h1>Sources</h1>
      <p className="muted">
        Per §6.6: each connector implements <code>SourceConnector</code>. Per §8 Phase 1
        degraded-mode policy, sources with 3 consecutive failures are auto-paused.
      </p>

      <div className="card" style={{ padding: 0 }}>
        <div className="issue-row" style={{ background: "#0d1117", color: "var(--muted)", fontSize: 11, textTransform: "uppercase", gridTemplateColumns: "200px 100px 1fr 140px 120px" }}>
          <div>Source</div>
          <div>Status</div>
          <div>Last check</div>
          <div>Languages</div>
          <div>Paused?</div>
        </div>
        {sources.map((s) => {
          const snap = latestBySource.get(s.id);
          const state = stateBy.get(s.id);
          return (
            <div key={s.id} className="issue-row" style={{ gridTemplateColumns: "200px 100px 1fr 140px 120px" }}>
              <div>
                <div>{s.displayName}</div>
                <div className="muted" style={{ fontSize: 11 }}>{s.id}</div>
              </div>
              <div>
                <span className={`pill ${snap?.ok ? "ok" : snap ? "danger" : ""}`}>
                  {snap ? (snap.ok ? "ok" : `down ×${snap.consecutiveFailures}`) : "unknown"}
                </span>
              </div>
              <div className="muted" style={{ fontSize: 11 }}>
                {snap?.message ?? "—"}
                {snap?.recordedAt ? ` · ${snap.recordedAt.toISOString().slice(0, 16).replace("T", " ")}` : ""}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>{s.supportedLanguages.join(", ")}</div>
              <div>
                {state?.paused ? (
                  <span className="pill warn">paused</span>
                ) : (
                  <span className="muted">no</span>
                )}
              </div>
            </div>
          );
        })}
        {sources.length === 0 && (
          <div style={{ padding: 24, textAlign: "center" }} className="muted">
            No connectors enabled. Configure API keys in .env.local.
          </div>
        )}
      </div>
    </div>
  );
}
