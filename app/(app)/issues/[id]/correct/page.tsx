import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { submitHitlCorrection } from "../../actions";

export const dynamic = "force-dynamic";

// SPEC §7 — HITL correction MUST require a reason classification.
// The `<select required>` attribute is the first line of defense; the
// server action re-validates. Phase 2 evaluates these reasons to detect
// prompt drift (§14).

export default async function HitlCorrectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = await prisma.issue.findUnique({ where: { id } });
  if (!issue) notFound();

  return (
    <div style={{ maxWidth: 640 }}>
      <Link href={`/issues/${id}`} className="muted">← Back to issue</Link>
      <h1 style={{ marginTop: 12 }}>HITL correction</h1>
      <p className="muted">
        Reason is required — Phase 2 mines these classifications to spot
        prompt regressions. Don't skip.
      </p>

      <form action={submitHitlCorrection} className="card">
        <input type="hidden" name="issueId" value={issue.id} />

        <div className="form-row">
          <label htmlFor="reason">Correction reason *</label>
          <select id="reason" name="reason" required defaultValue="">
            <option value="" disabled>— choose one —</option>
            <option value="false_positive">False positive (not actually a GPS issue)</option>
            <option value="wrong_category">Wrong category</option>
            <option value="missed_urgency">Missed urgency (model under-rated)</option>
            <option value="wrong_geo">Wrong geo</option>
            <option value="wrong_actors">Wrong primary actors</option>
            <option value="other">Other (note required)</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="note">Note (optional unless reason = other)</label>
          <textarea id="note" name="note" rows={3} maxLength={2000} />
        </div>

        <h2 style={{ marginTop: 24 }}>Optional corrections</h2>
        <p className="muted" style={{ fontSize: 12 }}>Only the fields you change get patched. Empty = leave alone.</p>

        <div className="form-row">
          <label htmlFor="correctedTitle">Title</label>
          <input id="correctedTitle" name="correctedTitle" defaultValue={issue.title} minLength={8} maxLength={240} />
        </div>

        <div className="form-row">
          <label htmlFor="correctedCategory">Category</label>
          <select id="correctedCategory" name="correctedCategory" defaultValue={issue.category}>
            <option value="">— no change —</option>
            <option value="geopolitical">geopolitical</option>
            <option value="physical_security">physical_security</option>
            <option value="supply_chain">supply_chain</option>
            <option value="regulatory">regulatory</option>
            <option value="hostile_narrative">hostile_narrative</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="correctedUrgency">Urgency (1–5)</label>
          <input
            id="correctedUrgency"
            name="correctedUrgency"
            type="number"
            min={1}
            max={5}
            defaultValue={issue.urgencyScore}
          />
        </div>

        <button className="btn" type="submit">Submit correction</button>
      </form>
    </div>
  );
}
