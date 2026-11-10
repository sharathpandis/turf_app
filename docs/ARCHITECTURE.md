# Architecture

## Purpose
Booking system for turf owners: all bookings (phone, walk-in, other apps) in one calendar on a phone. Phase 1A is the owner PWA; players booking via WhatsApp comes later.

## Tech stack
Next.js (App Router) + TypeScript strict, Tailwind CSS, shadcn/ui (not yet installed), Supabase (Postgres, Auth, Storage, Realtime), hosted on Vercel + Supabase.

## Folder structure
Current:
- `app/` — Next.js routes (starter page, `login` with email + OTP server actions)
- `components/ui/` — shadcn/ui components; `lib/auth-input.ts` — email/OTP validation
- `proxy.ts` — route guard: signed-out visitors go to `/login`
- `lib/supabase/` — `client.ts` (browser), `server.ts` (server), `proxy.ts` (session refresh helper)
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
Supabase Auth with email OTP for owners (and super admin). Login screen built (S1.4). The login email templates must show the code (`supabase/templates/login_code.html`). Production needs custom SMTP; phone OTP with an SMS provider is Planned. Access to data is by `members` of an owner account; role is 'owner' only in Phase 1.

## Realtime
Supabase Realtime keeps the calendar in sync across devices. Planned.

## Integrations
- Supabase — linked; schema applied to the dev project. Local stack: `supabase start -x gotrue,vector` (auth container does not start on this Mac).
- Vercel — hosting. Planned (S1.6).
- WhatsApp provider — Planned (later phase).
- SMTP provider for login emails — Planned (production). SMS OTP provider — Planned (only for phone login later).

## Environment variables (names only)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

Stored in `.env.local` (git-ignored) and in Vercel settings.

## Deployment
Planned: Vercel for the app, Supabase for the database; migrations applied with the Supabase CLI.
