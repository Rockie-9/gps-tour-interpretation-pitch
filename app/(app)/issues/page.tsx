import Link from "next/link";
import type { IssueCategory, IssueStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const VALID_CATEGORIES: ReadonlySet<IssueCategory> = new Set([
  "geopolitical",
  "physical_security",
  "supply_chain",
  "regulatory",
  "hostile_narrative",
]);
const VALID_STATUSES: ReadonlySet<IssueStatus> = new Set([
  "detected",
  "triaged",
  "assigned",
  "investigating",
  "resolved",
  "monitoring",
]);

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string }>;
}) {
  const params = await searchParams;
  const where: Prisma.IssueWhereInput = {};
  if (params.category && VALID_CATEGORIES.has(params.category as IssueCategory)) {
    where.category = params.category as IssueCategory;
  }
  if (params.status && VALID_STATUSES.has(params.status as IssueStatus)) {
    where.status = params.status as IssueStatus;
  }

  const issues = await prisma.issue.findMany({
    where,
    orderBy: [{ urgencyScore: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <div>
      <h1>Issues</h1>
      <p className="muted">{issues.length} issues — sorted by urgency, then recency.</p>

      <div className="card" style={{ padding: 0 }}>
        <div className="issue-row" style={{ background: "#0d1117", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>
          <div>Urg</div>
          <div>Title</div>
          <div>Category</div>
          <div>Status</div>
          <div>Created</div>
        </div>
        {issues.map((i) => (
          <Link key={i.id} href={`/issues/${i.id}`} style={{ color: "inherit" }}>
            <div className="issue-row">
              <div>
                <span className={`urgency u${i.urgencyScore}`}>{i.urgencyScore}</span>
              </div>
              <div>
                <div>{i.title}</div>
                <div className="muted" style={{ fontSize: 11 }}>
                  {(i.geo as { country?: string; region?: string })?.country}
                  {(i.geo as { region?: string })?.region ? ` · ${(i.geo as { region: string }).region}` : ""}
                </div>
              </div>
              <div>
                <span className={`badge cat-${i.category}`}>{i.category}</span>
              </div>
              <div>
                <span className="pill">{i.status}</span>
              </div>
              <div className="muted" style={{ fontSize: 11 }}>
                {i.createdAt.toISOString().slice(0, 16).replace("T", " ")}
              </div>
            </div>
          </Link>
        ))}
        {issues.length === 0 && (
          <div style={{ padding: 24, textAlign: "center" }} className="muted">
            No issues yet. Run an ingestion cron to populate.
          </div>
        )}
      </div>
    </div>
  );
}
