# Turf Owner Booking App

Booking system sold to many turf owners (each owner is a tenant, isolated by RLS). Owners manage every booking (phone, walk-in, other apps) in one calendar on their phone. Players book through a public booking link and, later, a WhatsApp AI agent.

## Current focus
Phase 1A: the **owner app only** (installable PWA, used on mobile). Sprint 4 adds the booking service, Razorpay payments, the public booking link and the WhatsApp AI agent.
Do NOT build payment, agent or WhatsApp code until Sprint 4. Where a message would be sent, call a stub in `lib/notify/` that only logs.
No super admin in the app: our team manages owners (plan, status) in the Supabase dashboard.

## Requirements
Full spec: `docs/requirements.md`. Read ONLY the section named in the task, not the whole file.

## Stack
- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui (no other UI libraries without asking)
- Next.js is the front end AND the API (route handlers). Do NOT use Supabase Edge Functions.
- Supabase: Postgres, Auth (email OTP; phone OTP later), Storage, Realtime, pg_cron
- Payments: Razorpay ONLY, behind an adapter in `lib/payments`. Never show an owner's UPI ID or QR to players.
- Hosting: Cloudflare Workers (OpenNext adapter `@opennextjs/cloudflare`) + Supabase. `cacheComponents` is OFF in `next.config.ts` (it hangs `/login` on Workers); do not turn it on without testing `npm run preview`.

## Rules that must never break
1. **No double booking.** Enforced in Postgres with an exclusion constraint (`btree_gist`, `tstzrange`) per court, for active booking statuses and blocks. App checks are extra, never the only check.
2. **Row Level Security on every table.** A user reaches only data of owner accounts they belong to (via `members`).
3. **No secrets in the browser.** Service-role key only in server code.
4. Times stored as `timestamptz` (UTC), shown in `Asia/Kolkata`.
5. Money stored as integer rupees
6. **Players' slots lock for 5 minutes.** Only `private.book_slot` / `private.confirm_online_payment` change booking status for player flows (server code, service role only). The owner never confirms payments.

## WhatsApp AI agent (Sprint 4) — safety rules
- The agent reaches the backend only through an MCP server with two tools: `check_availability` and `book_slot`. No other tools, no direct DB access.
- Its only job: tell slot availability and book slots. Anything else is handed to the turf's phone number.
- Turf and player phone come from the webhook, never from the AI.
- It confirms slot and price with the player before booking, then sends the payment page link..

## UI rules
- Mobile-first: design for 360px width first, then scale up.
- Touch targets at least 44px; bottom navigation; one main action per screen.
- Fast: show skeletons while loading; no layout jumps.

## Code conventions
- Create all database objects (tables, RLS, storage buckets, cron jobs) through migrations, never by hand in the dashboard.
- Database changes only via migrations in `supabase/migrations/`; regenerate types after each migration (`supabase gen types typescript --linked > lib/database.types.ts`).
- Writes go through server actions or route handlers, with input validated by zod.
- Keep files small and named by feature (`app/(owner)/calendar/...`).

## How to work
- For any feature larger than one file: show a short plan first and wait for my OK.
- After changes: run `npm run lint` and `npm run build`; fix errors before saying done.
- Write tests for booking logic (overlap, pricing bands, payment status).
- Don't add packages without saying why.
- UI follows docs/design/. Mobile-first, desktop layout at `lg`.
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
- No Docker / `supabase start`: use the linked remote dev project (`supabase db push --remote`)
- `npm run lint` / `npm run build`
- `npm run preview` build + run locally in the Workers runtime; `npm run deploy` build + deploy; `npm run upload` new version without promoting
- Test risky changes (auth, proxy, caching, env vars, new packages) with `npm run preview`, not only `npm run dev`. Deploy steps: `docs/DEPLOY.md`
