"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/authorize";
import type { HitlReason, IssueCategory, IssueStatus } from "@prisma/client";

// SPEC §7 — HITL correction MUST require a reason classification.
// The form on /issues/[id]/correct enforces this client-side; this
// action re-validates server-side. Don't make the reason optional.

const HitlInputSchema = z.object({
  issueId: z.string().uuid(),
  reason: z.enum([
    "false_positive",
    "wrong_category",
    "missed_urgency",
    "wrong_geo",
    "wrong_actors",
    "other",
  ]),
  note: z.string().max(2000).optional(),
  // Optional corrected fields. Only the ones the analyst touched.
  correctedCategory: z.string().optional(),
  correctedUrgency: z.coerce.number().int().min(1).max(5).optional(),
  correctedTitle: z.string().min(8).max(240).optional(),
  correctedActors: z.array(z.string()).optional(),
});

export async function submitHitlCorrection(formData: FormData) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: "viewer" | "analyst" | "admin" } | undefined;
  if (!user?.id || !user.role) throw new Error("not authenticated");
  const userId: string = user.id;
  const role: "viewer" | "analyst" | "admin" = user.role;

  requireRole({
    user: { id: userId, role },
    resource: "issues",
    action: "hitl_correct",
  });

  const raw = {
    issueId: formData.get("issueId"),
    reason: formData.get("reason"),
    note: formData.get("note") || undefined,
    correctedCategory: formData.get("correctedCategory") || undefined,
    correctedUrgency: formData.get("correctedUrgency") || undefined,
    correctedTitle: formData.get("correctedTitle") || undefined,
    correctedActors: formData.getAll("correctedActors") as string[] | undefined,
  };
  const input = HitlInputSchema.parse(raw);

  const existing = await prisma.issue.findUnique({ where: { id: input.issueId } });
  if (!existing) throw new Error("issue not found");

  const patch: {
    category?: IssueCategory;
    urgencyScore?: number;
    title?: string;
    primaryActors?: string[];
  } = {};
  if (input.correctedCategory) patch.category = input.correctedCategory as IssueCategory;
  if (input.correctedUrgency) patch.urgencyScore = input.correctedUrgency;
  if (input.correctedTitle) patch.title = input.correctedTitle;
  if (input.correctedActors?.length) patch.primaryActors = input.correctedActors;

  await prisma.$transaction(async (tx) => {
    if (Object.keys(patch).length > 0) {
      await tx.issue.update({ where: { id: input.issueId }, data: patch });
    }
    await tx.issueHistory.create({
      data: {
        issueId: input.issueId,
        action: "hitl_correction",
        actorId: userId,
        payload: {
          before: {
            category: existing.category,
            urgencyScore: existing.urgencyScore,
            title: existing.title,
            primaryActors: existing.primaryActors,
          },
          after: patch,
        },
        hitlCorrectionReason: input.reason as HitlReason,
        hitlCorrectionNote: input.note,
        promptVersion: existing.promptVersion,
        modelVersion: existing.modelVersion,
        rubricVersion: existing.rubricVersion,
      },
    });
  });

  revalidatePath(`/issues/${input.issueId}`);
  revalidatePath("/issues");
}

const StatusInputSchema = z.object({
  issueId: z.string().uuid(),
  status: z.enum(["detected", "triaged", "assigned", "investigating", "resolved", "monitoring"]),
});

export async function updateIssueStatus(formData: FormData) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: "viewer" | "analyst" | "admin" } | undefined;
  if (!user?.id || !user.role) throw new Error("not authenticated");
  const userId: string = user.id;
  const role: "viewer" | "analyst" | "admin" = user.role;

  requireRole({
    user: { id: userId, role },
    resource: "issues",
    action: "update_status",
  });

  const input = StatusInputSchema.parse({
    issueId: formData.get("issueId"),
    status: formData.get("status"),
  });

  const existing = await prisma.issue.findUnique({ where: { id: input.issueId } });
  if (!existing) throw new Error("issue not found");

  await prisma.$transaction([
    prisma.issue.update({
      where: { id: input.issueId },
      data: { status: input.status as IssueStatus },
    }),
    prisma.issueHistory.create({
      data: {
        issueId: input.issueId,
        action: "status_changed",
        actorId: userId,
        payload: { from: existing.status, to: input.status },
      },
    }),
  ]);

  revalidatePath(`/issues/${input.issueId}`);
}

const CorrelationDecisionSchema = z.object({
  suggestionId: z.string().uuid(),
  decision: z.enum(["accepted", "rejected"]),
});

export async function decideCorrelation(formData: FormData) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: "viewer" | "analyst" | "admin" } | undefined;
  if (!user?.id || !user.role) throw new Error("not authenticated");
  const userId: string = user.id;
  const role: "viewer" | "analyst" | "admin" = user.role;

  requireRole({
    user: { id: userId, role },
    resource: "correlation_suggestions",
    action: "decide_correlation",
  });

  const input = CorrelationDecisionSchema.parse({
    suggestionId: formData.get("suggestionId"),
    decision: formData.get("decision"),
  });

  await prisma.correlationSuggestion.update({
    where: { id: input.suggestionId },
    data: {
      status: input.decision,
      decidedBy: userId,
      decidedAt: new Date(),
    },
  });

  // §6.7 — Even when accepted, we do not auto-merge primary Issue records.
  // Acceptance is recorded; a separate "execute merge" action (admin-only)
  // performs the actual combine. Phase 1 scope is just the audit trail.

  revalidatePath("/issues");
}
