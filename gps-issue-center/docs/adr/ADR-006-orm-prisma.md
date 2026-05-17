# ADR-006: Prisma for ORM (not Drizzle)

- Status: accepted
- Date: 2026-05-17
- Spec ref: §12.1

## Context

Spec §12.1 is explicit that this is a coin-toss between two defensible options:

- **Prisma** — schema-first, more polished tooling (Studio, migrations), heavier runtime.
- **Drizzle** — TypeScript-first, transparent SQL, lighter, less mature tooling.

Both are portable to Phase 3 internal Postgres.

## Decision

**Prisma.** Drivers:

1. Prisma Studio is genuinely useful for solo-dev maintenance — being able to point at the DB and inspect rows during an incident saves real time. Spec §14.5 makes this a priority.
2. Migrations are routine — `prisma migrate dev` is well-trodden; team transfer in Phase 3 is easier.
3. SKIP LOCKED in `$queryRaw` is acceptable. The §6.2 queue claim is the only raw-SQL site; one-time cost.

## Consequences

### Good
- Out-of-the-box `prisma studio` for incident response and HITL spot-checks.
- Auth.js Prisma adapter is the default — saves writing user/account/session models.
- Schema diff and migration history are first-class.

### Bad / tradeoffs
- Larger bundle. Not an issue on Vercel Serverless within current limits.
- Raw SQL has worse ergonomics than Drizzle's query builder. We use `$queryRaw` in exactly one place (queue claim).
- Prisma migrate against shadow DB requires DIRECT_URL — already in `.env.example`.

### Neutral
- Either ORM would work. This is a soft decision — switching costs less than one work-week, but we'd rather not pay it.

## Alternatives considered

### A. Drizzle
Reasonable. Rejected because Prisma Studio's value-add to solo-dev maintenance beats Drizzle's SQL-transparency value-add in this codebase.

## How to revisit

If `$queryRaw` use grows beyond ~3 sites, the case for Drizzle improves. Set the trigger at 5 raw-SQL sites or a Prisma upgrade that breaks our migrations.
