import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { updateIssueStatus, decideCorrelation } from "../actions";

export const dynamic = "force-dynamic";

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const issue = await prisma.issue.findUnique({
    where: { id },
    include: {
      history: { orderBy: { createdAt: "desc" }, take: 20 },
      queueItems: { take: 10 },
      correlationsAsSource: {
        where: { status: "pending" },
        include: { targetIssue: true },
      },
    },
  });
  if (!issue) notFound();

  const geo = issue.geo as { country?: string; region?: string; lat?: number; lng?: number };
  const metadata = issue.metadata as {
    rubric?: { threatEscalation: number; actorSpecificity: number; geoSpecificity: number; timeUrgency: number };
    keywordCluster?: string[];
    sourceUrl?: string;
  };

  return (
    <div>
      <Link href="/issues" className="muted">← Issues</Link>
      <h1 style={{ marginTop: 12 }}>{issue.title}</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <span className={`urgency u${issue.urgencyScore}`}>U{issue.urgencyScore}</span>
        <span className={`badge cat-${issue.category}`}>{issue.category}</span>
        <span className="pill">{issue.status}</span>
        <span className="muted">conf {Number(issue.confidenceScore).toFixed(2)}</span>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Triage summary</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{issue.triageSummary}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Where</h2>
          <dl className="kv">
            <dt>Country</dt><dd>{geo?.country ?? "—"}</dd>
            <dt>Region</dt><dd>{geo?.region ?? "—"}</dd>
            {geo?.lat != null && (<><dt>Lat / Lng</dt><dd>{geo.lat}, {geo.lng}</dd></>)}
          </dl>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Who</h2>
          {issue.primaryActors.length === 0 ? (
            <p className="muted">No primary actors identified.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {issue.primaryActors.map((a) => <li key={a}>{a}</li>)}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Rubric (v{issue.rubricVersion})</h2>
          <dl className="kv">
            <dt>Threat escalation</dt><dd>{metadata?.rubric?.threatEscalation ?? "—"} / 5</dd>
            <dt>Actor specificity</dt><dd>{metadata?.rubric?.actorSpecificity ?? "—"} / 5</dd>
            <dt>Geo specificity</dt><dd>{metadata?.rubric?.geoSpecificity ?? "—"} / 5</dd>
            <dt>Time urgency</dt><dd>{metadata?.rubric?.timeUrgency ?? "—"} / 5</dd>
          </dl>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Provenance</h2>
          <dl className="kv">
            <dt>Prompt</dt><dd><code>{issue.promptVersion}</code></dd>
            <dt>Model</dt><dd><code>{issue.modelVersion}</code></dd>
            <dt>Rubric</dt><dd><code>{issue.rubricVersion}</code></dd>
            <dt>Source URL</dt>
            <dd>
              {metadata?.sourceUrl ? (
                <a href={metadata.sourceUrl} target="_blank" rel="noreferrer">{metadata.sourceUrl}</a>
              ) : "—"}
            </dd>
          </dl>
        </div>
      </div>

      <h2>Actions</h2>
      <div className="card" style={{ display: "flex", gap: 18, alignItems: "center" }}>
        <form action={updateIssueStatus} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="hidden" name="issueId" value={issue.id} />
          <label htmlFor="status" className="muted" style={{ margin: 0 }}>Status</label>
          <select name="status" defaultValue={issue.status} style={{ padding: 6, background: "var(--bg)", color: "var(--fg)", border: "1px solid var(--border)", borderRadius: 4 }}>
            {["detected", "triaged", "assigned", "investigating", "resolved", "monitoring"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="btn" type="submit">Update</button>
        </form>
        <Link href={`/issues/${issue.id}/correct`} className="btn secondary">
          HITL correction
        </Link>
      </div>

      {issue.correlationsAsSource.length > 0 && (
        <>
          <h2>Correlation suggestions</h2>
          <div className="card">
            <p className="muted" style={{ marginTop: 0 }}>
              Fingerprint heuristic suggests these may be the same event. Never auto-merged — your call.
            </p>
            {issue.correlationsAsSource.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--border)" }}>
                <div>
                  <span className={`pill ${c.kind === "merge" ? "warn" : ""}`}>{c.kind}</span>{" "}
                  <Link href={`/issues/${c.targetIssue.id}`}>{c.targetIssue.title}</Link>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <form action={decideCorrelation}>
                    <input type="hidden" name="suggestionId" value={c.id} />
                    <input type="hidden" name="decision" value="accepted" />
                    <button className="btn" type="submit">Accept</button>
                  </form>
                  <form action={decideCorrelation}>
                    <input type="hidden" name="suggestionId" value={c.id} />
                    <input type="hidden" name="decision" value="rejected" />
                    <button className="btn secondary" type="submit">Reject</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2>Audit trail</h2>
      <div className="card" style={{ padding: 0 }}>
        {issue.history.map((h) => (
          <div key={h.id} style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
            <span className="muted">{h.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>{" "}
            <strong>{h.action}</strong>
            {h.hitlCorrectionReason && (
              <span className="badge" style={{ marginLeft: 8 }}>reason: {h.hitlCorrectionReason}</span>
            )}
            {h.hitlCorrectionNote && <div className="muted" style={{ marginTop: 4 }}>{h.hitlCorrectionNote}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
