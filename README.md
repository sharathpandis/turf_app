# Turf Owner Booking App

Booking system for turf owners. Every booking (phone, walk-in, other apps) lives in one calendar on the owner's phone, preventing double bookings, missed advances and no-shows. Phase 1A is the owner app, an installable mobile PWA. Player booking through a WhatsApp bot comes later.

## Features
Done:
- Project scaffold, Supabase linked
- Database schema with double-booking protection and row-level security

Planned:
- Email OTP login, setup wizard, courts and pricing
- Calendar, add/edit/cancel bookings, block slots, payments
- Customers, reports, super admin
- WhatsApp bot and messages (later phase)

## Tech stack
Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase (Postgres, Auth, Storage, Realtime), Vercel.

## Run locally
1. `npm install`
2. Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. `supabase start -x gotrue,vector` (local database; Docker must be running)
4. `npm run dev`

## Migrations
All database changes live in `supabase/migrations/`.
- `supabase db reset` — re-apply migrations and seed locally
- `supabase db push --remote` — apply to the linked project
- `supabase gen types typescript --local > lib/database.types.ts` — regenerate types

## Docs
- [Progress](docs/PROGRESS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [Requirements](docs/requirements.md)
