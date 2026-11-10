# Architecture

## Purpose
Booking system for turf owners: all bookings (phone, walk-in, other apps) in one calendar on a phone. Phase 1A is the owner PWA; players booking via WhatsApp comes later.

## Tech stack
Next.js (App Router) + TypeScript strict, Tailwind CSS, shadcn/ui (not yet installed), Supabase (Postgres, Auth, Storage, Realtime), hosted on Vercel + Supabase.

## Folder structure
Current:
- `app/` — Next.js routes (still the starter page)
- `docs/` — requirements, progress, architecture, database
- `supabase/` — `config.toml`, `migrations/` (5 files), `seed.sql`
- `lib/database.types.ts` — generated types

Planned:
- `app/(owner)/<feature>/` — owner screens, one folder per feature
- `lib/notify/` — notification stubs (log only)
- `supabase/migrations/` — all DB changes

## Data flow
Phone (PWA) -> Next.js (server actions / route handlers, zod-validated) -> Supabase Postgres. Reads from the browser use the publishable key and are limited by Row Level Security. Writes go through server code. The service-role key is used only on the server. Planned.

## Auth
Supabase Auth with phone OTP for owners (and super admin). Planned. Access to data is by `members` of an owner account; role is 'owner' only in Phase 1.

## Realtime
Supabase Realtime keeps the calendar in sync across devices. Planned.

## Integrations
- Supabase — linked; schema applied to the dev project. Local stack: `supabase start -x gotrue,vector` (auth container does not start on this Mac).
- Vercel — hosting. Planned (S1.6).
- WhatsApp provider — Planned (later phase).
- SMS OTP provider — Planned (needed for phone login).

## Environment variables (names only)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

Stored in `.env.local` (git-ignored) and in Vercel settings.

## Deployment
Planned: Vercel for the app, Supabase for the database; migrations applied with the Supabase CLI.
