import { NextResponse } from "next/server";
import { Resend } from "resend";
import { evaluateBudgetCircuitBreaker } from "@/lib/cost/budget";

export const dynamic = "force-dynamic";

// SPEC §9.2 — Daily 09:00 budget cron. Sums yesterday's cost_log,
// flips ingestion_paused if > 1.5× daily cap, emails Rockie.
// Manual recovery only — no auto-uncap.

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const status = await evaluateBudgetCircuitBreaker();

  if (status.tripped && process.env.RESEND_API_KEY && process.env.ALERT_EMAIL_TO) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.ALERT_EMAIL_FROM ?? "alerts@example.com",
      to: process.env.ALERT_EMAIL_TO,
      subject: "[GPS Issue Center] Budget circuit breaker tripped",
      text: [
        `Yesterday spend: $${status.yesterdayUsd.toFixed(2)}`,
        `Daily cap (1.5×): $${(status.dailyBudgetUsd * 1.5).toFixed(2)}`,
        ``,
        `Ingestion has been paused. Inference will continue draining the queue.`,
        `Recover manually by clearing system_flags row for ingestion_paused after`,
        `you've confirmed root cause. Runbook: docs/runbook.md`,
      ].join("\n"),
    });
  }

  return NextResponse.json(status);
}
