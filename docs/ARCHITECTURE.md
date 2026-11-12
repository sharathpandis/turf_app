# Architecture

## Purpose
Booking system for turf owners: all bookings (phone, walk-in, other apps) in one calendar on a phone. Phase 1 is the owner admin panel plus a public booking link page per turf for players. Players pay online through Razorpay; a WhatsApp AI agent that tells availability and books slots follows (Sprint 4).

## Tech stack
Next.js (App Router) + TypeScript strict for the front end AND the API (route handlers), Tailwind CSS, shadcn/ui, Supabase (Postgres, Auth, Storage, Realtime, pg_cron), Razorpay behind an adapter, hosted on Vercel + Supabase. No Supabase Edge Functions. One app serves many turf owners; each owner is a tenant isolated by RLS.

## Folder structure
Current:
- `app/` — Next.js routes (starter page, `login` with email + OTP server actions)
- `components/ui/` — shadcn/ui components; `lib/auth-input.ts` — email/OTP validation
- `proxy.ts` — route guard: signed-out visitors go to `/login`
- `lib/supabase/` — `client.ts` (browser), `server.ts` (server), `proxy.ts` (session refresh helper)
- `docs/` — requirements, progress, architecture, database
- `supabase/` — `config.toml`, `migrations/` (8 files), `seed.sql`
- `lib/database.types.ts` — generated types

Planned:
- `app/(owner)/<feature>/` — owner screens, one folder per feature
- `lib/notify/` — notification stub (log only; exists now)
- `lib/booking/`, `lib/payments/` — booking service and Razorpay adapter (S4.1, S4.3)
- `app/b/[booking_code]`, `app/pay/[booking_id]` — public booking link and payment page (S4.3, S4.4)
- MCP server + AI agent (S4.5–S4.7)
- `supabase/migrations/` — all DB changes

## Data flow
Phone (PWA) -> Next.js (server actions / route handlers, zod-validated) -> Supabase Postgres. Reads from the browser use the publishable key and are limited by Row Level Security. Writes go through server code. The service-role key is used only on the server. Planned.

## Slot locking and payment flow
Player picks a slot (booking link or WhatsApp agent) → server calls `private.book_slot` → the slot locks for 5 minutes (`pending_payment`) → the player pays on `/pay/[booking_id]` through Razorpay → the webhook (signature checked) calls `private.confirm_online_payment` → `confirmed`. Unpaid holds are expired by the `expire-holds` pg_cron job every minute. Late payment re-locks the slot if free, otherwise the server refunds. The owner never confirms payments. Planned (S4.1–S4.4); the database part exists.

## WhatsApp AI agent (planned, S4.5–S4.7)
WhatsApp webhook (Next.js route) → AI agent → MCP server with two tools only, `check_availability` and `book_slot` → booking service. The agent only reports availability and books; anything else is handed to the turf's phone number. Turf and player phone come from the webhook, never from the AI. It confirms slot and price before booking and sends the payment page link.

## Auth
Supabase Auth with email OTP for owners. Our team manages owners (plan, status) in the Supabase dashboard; there is no super admin in the app. Login screen built (S1.4). The login email templates must show the code (`supabase/templates/login_code.html`). Production needs custom SMTP; phone OTP with an SMS provider is Planned. Access to data is by `members` of an owner account; role is 'owner' only in Phase 1.

## Realtime
Supabase Realtime keeps the calendar in sync across devices. Planned.

## Integrations
- Supabase — linked; schema applied to the dev project. Local stack: `supabase start -x gotrue,vector` (auth container does not start on this Mac).
- Cloudflare Workers (OpenNext) — hosting. Live at https://turf-app.sharath-dev.workers.dev (S1.6). See `docs/DEPLOY.md`.
- Razorpay — Planned (S4.3), test mode first; money flow (our account vs the owner's) is decided before the pilot.
- WhatsApp provider + AI model provider — Planned (S4.6–S4.8).
- SMTP provider for login emails — Planned (production). SMS OTP provider — Planned (only for phone login later).

## Environment variables (names only)
| Name | Type | Local | Cloudflare |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public, inlined at build | `.env.local` | Workers Builds build variable (and your shell when running `npm run deploy`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public, inlined at build | `.env.local` | Workers Builds build variable |
| `SUPABASE_SERVICE_ROLE_KEY` | secret, server only | `.dev.vars` | `wrangler secret put` |
| Razorpay key id / key secret / webhook secret (Sprint 4) | secret, server only | `.dev.vars` | `wrangler secret put` |
| WhatsApp token (Sprint 4) | secret, server only | `.dev.vars` | `wrangler secret put` |

`.env.local` and `.dev.vars` are git-ignored. Never commit values.

## Deployment
Cloudflare Workers (OpenNext adapter) for the app, Supabase for the database; migrations applied with the Supabase CLI.
