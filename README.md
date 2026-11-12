# Turf Owner Booking App

Booking system for turf owners. Every booking (phone, walk-in, other apps) lives in one calendar on the owner's phone, preventing double bookings, missed advances and no-shows. Phase 1 is the owner admin panel (an installable mobile PWA) plus a public booking link page per turf. Players pay online through Razorpay and their slot locks for 5 minutes while they pay. A WhatsApp AI agent for availability and booking follows (planned).

## Features
Done:
- Project scaffold, Supabase linked
- Database schema with double-booking protection and row-level security

Planned:
- Email OTP login, setup wizard, courts and pricing
- Calendar, add/edit/cancel bookings, block slots, payments
- Customers, reports
- Booking service, Razorpay payments, public booking link (`/b/[booking_code]`), payment page (`/pay/[booking_id]`)
- WhatsApp AI agent behind an MCP server (`check_availability`, `book_slot`) and messages

## Tech stack
Next.js (App Router, also the API via route handlers), TypeScript, Tailwind CSS, shadcn/ui, Supabase (Postgres, Auth, Storage, Realtime, pg_cron), Razorpay, Cloudflare Workers (OpenNext). No Supabase Edge Functions.

## Run locally
1. `npm install`
2. Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. `npm run dev` (uses the linked remote dev project; no Docker needed)

## Migrations
All database changes live in `supabase/migrations/`.
- `supabase db push --remote` — apply to the linked project
- `supabase gen types typescript --linked > lib/database.types.ts` — regenerate types

## Docs
- [Progress](docs/PROGRESS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [Requirements](docs/requirements.md)
