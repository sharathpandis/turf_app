# Progress

Project state: status, decisions, issues. Task list and next task: [dev-plan.md](dev-plan.md).

## Current status
Phase 1A (owner app). Database schema live on the remote dev project (turf-app-dev); no auth or UI yet. Sprint 1: S1.1, S1.2 done.

## Done (newest first)
- 2026-11-10 — S1.2 Prove overlap rule: 10 checks pass on turf-app-dev (overlap, booking vs block, block vs booking, reschedule into block rejected; back-to-back, other court, cancelled, rebook accepted). Files: `supabase/tests/overlap_rule.sql`.
- 2026-11-10 — S1.1 Database schema: 12 tables, overlap rule, RLS, first-login trigger, audit trail, seed; pushed to turf-app-dev; types generated. Files: `supabase/migrations/*`, `supabase/seed.sql`, `lib/database.types.ts`.
- 2026-11-06 — Project setup: Next.js app created, Supabase project linked (`supabase/config.toml`), `.env.local` set, CLAUDE.md and `docs/requirements.md` added.

## In progress / blockers
- None.

## Decisions
- 2026-11-06 — Phase 1A is owner app only; WhatsApp calls are logged stubs in `lib/notify/`. Reason: bot needs Meta verification and is a later phase.
- 2026-11-06 — `docs/dev-plan.md` is the task checklist and source of truth for what to build next. Reason: full sprint plan supplied by the team.

- 2026-11-06 — Removed staff role from Phase 1. Reason: Keep Phase 1 simple. Only owner and super admin log in; `members` table stays (role 'owner' only) so staff can return later.

- 2026-11-10 — Overlap rule lives on a `court_occupancy` table kept in sync by triggers. Reason: an exclusion constraint cannot span the bookings and blocks tables.
- 2026-11-10 — Dropped `eslint-config-next` mismatch by upgrading it to 16.4.5 to match `next`. Reason: lint was broken.

## Known issues / tech debt
- Sprint 4 of dev-plan.md includes the WhatsApp bot, but CLAUDE.md says no WhatsApp yet; revisit when Sprint 4 starts.
- Stack packages from CLAUDE.md not installed yet (shadcn/ui, Supabase client, zod, test runner).
- Remote dev project has no seed data (seed runs locally only).
- The Supabase CLI labels turf-app-dev as "production"; `db push` needs `--remote`.
- Local Supabase: auth (gotrue) and vector containers fail with "exec format error" on this Mac, so start with `supabase start -x gotrue,vector`. Database works; local phone login (S1.4) will need a fix or the remote dev project.
- Docker images can corrupt if the disk fills; remove the image and re-pull.
- Leftover MySQL install in /usr/local/mysql-8.0.26-macos11-arm64 needs sudo to delete (unused).
- No `lib/notify/` stub, no tests, no `.env.example`.
