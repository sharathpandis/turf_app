# Progress

Project state: status, decisions, issues. Task list and next task: [dev-plan.md](dev-plan.md).

## Current status
Phase 1A (owner app). Database schema (incl. slot lock and online-payment functions) live on the remote dev project (turf-app-dev); login and app shell built. Sprint 1: S1.1–S1.4 done. Change set 01 applied 2026-11-12.

## Done (newest first)
- 2026-11-12 — Change set 01: migration `20261112000001_booking_lock_razorpay.sql` (no super admin, owner plans, Razorpay-only, `book_slot`, `confirm_online_payment`, `expire-holds` cron), tests `supabase/tests/booking_lock.sql` (13 checks pass on turf-app-dev), `lib/notify` stub, docs updated.
- 2026-11-10 — S1.2 Prove overlap rule: 10 checks pass on turf-app-dev (overlap, booking vs block, block vs booking, reschedule into block rejected; back-to-back, other court, cancelled, rebook accepted). Files: `supabase/tests/overlap_rule.sql`.
- 2026-11-10 — S1.1 Database schema: 12 tables, overlap rule, RLS, first-login trigger, audit trail, seed; pushed to turf-app-dev; types generated. Files: `supabase/migrations/*`, `supabase/seed.sql`, `lib/database.types.ts`.
- 2026-11-06 — Project setup: Next.js app created, Supabase project linked (`supabase/config.toml`), `.env.local` set, CLAUDE.md and `docs/requirements.md` added.

## Done (S1.3, S1.4 — 2026-11-10)
- Supabase clients, `proxy.ts` route guard, and email OTP login (Gmail custom SMTP on dev). Verified: code email arrives, login works, owner + members rows created with email.

## In progress / blockers
- None. Next: S1.5 app shell, then S1.6 Vercel deploy.

## Decisions
- 2026-11-06 — Phase 1A is owner app only; WhatsApp calls are logged stubs in `lib/notify/`. Reason: bot needs Meta verification and is a later phase.
- 2026-11-06 — `docs/dev-plan.md` is the task checklist and source of truth for what to build next. Reason: full sprint plan supplied by the team.

- 2026-11-06 — Removed staff role from Phase 1. Reason: Keep Phase 1 simple. Only owner and super admin log in; `members` table stays (role 'owner' only) so staff can return later.

- 2026-11-10 — Overlap rule lives on a `court_occupancy` table kept in sync by triggers. Reason: an exclusion constraint cannot span the bookings and blocks tables.
- 2026-11-10 — Owner login is email OTP, not phone OTP (phone later). Reason: no SMS provider available yet.
- 2026-11-10 — Owner account is created when the email is confirmed (OTP verified), not when an OTP is requested. Reason: stops junk owner rows from unverified addresses.
- 2026-11-10 — Route guard is `proxy.ts`, not `middleware.ts`. Reason: Next.js 16 renamed the convention.
- 2026-11-10 — Dropped `eslint-config-next` mismatch by upgrading it to 16.4.5 to match `next`. Reason: lint was broken.
- 2026-11-12 — One app sold to many turf owners; each owner is a tenant (`owners`) isolated by RLS. Reason: product is multi-tenant.
- 2026-11-12 — No super admin in the app; our team manages owners (plan, status) in the Supabase dashboard. Reason: keep the app simple. Plan/status are not writable by owners.
- 2026-11-12 — Next.js is front end AND API; Supabase for DB, auth, storage, realtime, pg_cron; no Supabase Edge Functions. Reason: one codebase and deploy.
- 2026-11-12 — Phase 1 = owner admin panel + public booking link page per turf (`/b/[booking_code]`). Reason: players need a web path besides WhatsApp.
- 2026-11-12 — WhatsApp is an AI agent (not a button bot) that only reports availability and books, through an MCP server with `check_availability` and `book_slot`. Reason: simpler, safer surface for the AI.
- 2026-11-12 — Slots lock for 5 minutes for online payment (BookMyShow-style); paid in time → confirmed automatically, else released. No owner confirmation, no booking-requests screen, no approval mode. Reason: removes owner work and stale holds.
- 2026-11-12 — Razorpay only, behind `lib/payments`; players never get the owner's UPI ID/QR. Money flow (our account vs owner's) is decided before the pilot. Reason: automatic confirmation needs a gateway.
- 2026-11-12 — Pricing logic unchanged; `book_slot` uses a placeholder price (court base price prorated). Reason: pricing is decided later.

## Known issues / tech debt
- Do NOT run a full `supabase config push --remote`: local config.toml differs from the remote in ~15 unrelated settings (email, MFA, pooler, storage). Change phone auth in the dashboard, or push a minimal config after checking `supabase config diff --remote`.
- Stack packages from CLAUDE.md not installed yet (shadcn/ui, Supabase client, zod, test runner).
- Remote dev project has no seed data (seed runs locally only).
- The Supabase CLI labels turf-app-dev as "production"; `db push` needs `--remote`.
- Local Supabase: auth (gotrue) and vector containers fail with "exec format error" on this Mac, so start with `supabase start -x gotrue,vector`. Database works; local phone login (S1.4) will need a fix or the remote dev project.
- Docker images can corrupt if the disk fills; remove the image and re-pull.
- Leftover MySQL install in /usr/local/mysql-8.0.26-macos11-arm64 needs sudo to delete (unused).
- No `.env.example`.
- `private.*` functions are not reachable through the Supabase API; S4.1 needs a service-role-only wrapper or direct DB connection.
- `booking_source` has no 'web' value for booking-link bookings yet; `bookings.payment_proof_url` and enum value `rejected` are now unused.
- The 'two simultaneous bookings' SQL test is sequential (one session); the exclusion constraint is the actual guarantee.
