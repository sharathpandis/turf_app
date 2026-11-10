# Turf Owner Booking App

Booking system for turf owners. Owners manage every booking (phone, walk-in, other apps) in one calendar on their phone. Later, players book through a WhatsApp bot.

## Current focus
Phase 1A: the **owner app only** (installable PWA, used on mobile).
Do NOT build WhatsApp features yet. Where a message would be sent, call a stub in `lib/notify/` that only logs.

## Requirements
Full spec: `docs/requirements.md`. Read ONLY the section named in the task, not the whole file.

## Stack
- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui (no other UI libraries without asking)
- Supabase: Postgres, Auth (phone OTP), Storage, Realtime
- Hosting: Vercel + Supabase

## Rules that must never break
1. **No double booking.** Enforced in Postgres with an exclusion constraint (`btree_gist`, `tstzrange`) per court, for active booking statuses and blocks. App checks are extra, never the only check.
2. **Row Level Security on every table.** A user reaches only data of owner accounts they belong to (via `members`).
3. **No secrets in the browser.** Service-role key only in server code.
4. Times stored as `timestamptz` (UTC), shown in `Asia/Kolkata`.
5. Money stored as integer rupees.

## UI rules
- Mobile-first: design for 360px width first, then scale up.
- Touch targets at least 44px; bottom navigation; one main action per screen.
- Fast: show skeletons while loading; no layout jumps.

## Code conventions
- Create all database objects (tables, RLS, storage buckets, cron jobs) through migrations, never by hand in the dashboard.
- Database changes only via migrations in `supabase/migrations/`; regenerate types after each migration (`supabase gen types typescript --local > lib/database.types.ts`).
- Writes go through server actions or route handlers, with input validated by zod.
- Keep files small and named by feature (`app/(owner)/calendar/...`).

## How to work
- For any feature larger than one file: show a short plan first and wait for my OK.
- After changes: run `npm run lint` and `npm run build`; fix errors before saying done.
- Write tests for booking logic (overlap, pricing bands, payment status).
- Don't add packages without saying why.
- Keep replies short. Don't repeat unchanged code.
- Start each session with /start; finish each feature with /done.
- docs/PROGRESS.md is the source of truth for project state.
- Never store secrets or key values in any doc.
- docs/dev-plan.md is the task checklist and the source of truth for what to build next.
- When a task is finished and its "Done when" is met, change "- [ ]" to "- [x]" and add the date at the end of the line.
- If a schema change, flow change or new decision changes any task (adds, removes, splits or reorders tasks, or changes a prompt or "Done when"), update dev-plan.md in the same session and add a line to its Change log. Ask me before removing a task.
- Never tick a task that isn't fully working.

## Commands
- `npm run dev` start app
- `supabase start` local database
- `supabase db reset` re-apply migrations + seed
- `npm run lint` / `npm run build`
