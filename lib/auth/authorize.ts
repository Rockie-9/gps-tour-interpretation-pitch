import type { UserRole } from "@prisma/client";

// SPEC §6.8 — Authorization matrix. Application-layer enforcement
// (we dropped Supabase RLS in ADR-002). Every Server Action that mutates
// state MUST call `requireRole()` before touching the database.

export type Resource = "issues" | "sources" | "prompts" | "users" | "correlation_suggestions";
export type Action =
  | "read"
  | "update_status"
  | "comment"
  | "hitl_correct"
  | "reassign"
  | "manage"
  | "decide_correlation"
  | "all";

interface Rule {
  role: UserRole;
  resource: Resource;
  action: Action;
  scope: "all" | "self_owned";
}

// Direct transcription of the §6.8 matrix. Add rows here; don't add
// special-case branches in callers.
export const AUTHZ_MATRIX: readonly Rule[] = [
  // viewer
  { role: "viewer", resource: "issues", action: "read", scope: "all" },

  // analyst
  { role: "analyst", resource: "issues", action: "read", scope: "all" },
  { role: "analyst", resource: "issues", action: "update_status", scope: "all" },
  { role: "analyst", resource: "issues", action: "comment", scope: "all" },
  { role: "analyst", resource: "issues", action: "hitl_correct", scope: "all" },
  { role: "analyst", resource: "issues", action: "reassign", scope: "self_owned" },
  { role: "analyst", resource: "correlation_suggestions", action: "decide_correlation", scope: "all" },

  // admin — covers everything via `action: "all"`
  { role: "admin", resource: "issues", action: "all", scope: "all" },
  { role: "admin", resource: "sources", action: "manage", scope: "all" },
  { role: "admin", resource: "prompts", action: "manage", scope: "all" },
  { role: "admin", resource: "users", action: "manage", scope: "all" },
  { role: "admin", resource: "correlation_suggestions", action: "decide_correlation", scope: "all" },
] as const;

export interface AuthzContext {
  user: { id: string; role: UserRole } | null;
  resource: Resource;
  action: Action;
  /** Resource-owner id for self_owned checks. */
  ownerId?: string;
}

export function can(ctx: AuthzContext): boolean {
  if (!ctx.user) return false;
  for (const rule of AUTHZ_MATRIX) {
    if (rule.role !== ctx.user.role) continue;
    if (rule.resource !== ctx.resource) continue;
    if (rule.action !== ctx.action && rule.action !== "all") continue;
    if (rule.scope === "self_owned" && ctx.ownerId !== ctx.user.id) continue;
    return true;
  }
  return false;
}

export class AuthorizationError extends Error {
  constructor(public readonly ctx: AuthzContext) {
    super(`forbidden: ${ctx.user?.role ?? "anonymous"} cannot ${ctx.action} on ${ctx.resource}`);
    this.name = "AuthorizationError";
  }
}

export function requireRole(ctx: AuthzContext): void {
  if (!can(ctx)) throw new AuthorizationError(ctx);
}
