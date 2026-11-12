# Change set 01 — review decisions (super admin, tech stack, AI agent, slot locking, payments)

Apply everything below as ONE change set. Plan first and wait for my OK.
Rules: new migrations only (never edit existing ones). No Docker / `supabase start`;
use the linked remote dev project. Pricing logic stays exactly as it is now (to be decided later).

## 1. Decisions

1. Product: one app sold to many turf owners. Each owner = one tenant (`owners`), fully isolated by RLS.
2. No super admin in the app. Our team manages owners (plan, status) in the Supabase dashboard.
3. Tech stack: Next.js for front end AND API (route handlers). Supabase for database, auth, storage,
   realtime, cron (pg_cron). Do NOT use Supabase Edge Functions.
4. Phase 1 has two parts: the owner admin panel, and a public booking link page per turf for players.
5. WhatsApp: an AI agent (not a button bot). Only job: tell players slot availability and book slots.
   It reaches the backend only through an MCP server with two tools: `check_availability`, `book_slot`.
6. Slot locking works like BookMyShow: a player's chosen slot is locked for 5 minutes for online payment.
   Paid in time -> confirmed automatically. Not paid -> released; the player starts again.
   The owner never confirms payments. No booking-requests screen. No approval mode.
7. Online payments: Razorpay ONLY, behind an adapter (`lib/payments`), test mode for development.
   Players never get the owner's UPI ID or QR. Every player payment in the booking flow
   (booking link and WhatsApp agent) goes through Razorpay checkout.
   Money flow (our account + payouts vs owner's own account) is decided before the pilot — keep the
   adapter neutral.

## 2. Database (one new migration)

Super admin and plans:
- Drop `super_admins`, `private.is_super_admin()` and every "admin reads all" policy.
- `owners`: add `plan text not null default 'free' check (plan in ('free','starter','pro'))`,
  `plan_started_at timestamptz`, `plan_renews_at timestamptz`. Authenticated users must not be able to
  change plan, plan dates or status (keep update grant on name and phone only).

Razorpay only:
- Drop `turfs.upi_id` and `turfs.upi_qr_url` (no direct UPI for players).
- Add value 'online' to `payment_mode` (Razorpay payments); 'cash' and 'upi' stay only for money the
  owner collects at the counter and records by hand (e.g. walk-ins, balance at the turf).

Locking:
- `turfs.hold_minutes`: default 5 (keep the 5–60 check); set existing rows to 5.
- Drop `turfs.approval_mode`.
- `bookings`: add `payment_order_id text unique` (gateway order for the online advance).
- `payments`: add `gateway text`, `gateway_payment_id text unique` (idempotency: one webhook = one row).
- Function `private.book_slot(turf_id, court_id, time_range, customer_phone, customer_name, source)`:
  1. mark `pending_payment` bookings on that court whose `hold_expires_at < now()` as `expired`;
  2. find or create the customer (per owner, by phone);
  3. if the turf's advance_type is 'none' -> insert as `confirmed`;
     else insert as `pending_payment` with `hold_expires_at = now() + hold_minutes`;
  4. on overlap (23P01) return a clear "slot_taken" result, never an unhandled error;
  5. return booking id, status, price, advance due, hold_expires_at.
  Only callable by server code (service role), never by `anon` or `authenticated`.
- Function `private.confirm_online_payment(order_id, gateway_payment_id, amount)`:
  - booking `pending_payment` and hold not expired -> record payment (type advance), set `confirmed`,
    clear hold;
  - booking already `expired` and the slot is still free -> re-lock, record payment, set `confirmed`;
  - slot taken by someone else -> return 'refund_needed' (server code refunds and notifies);
  - same `gateway_payment_id` twice -> no-op (idempotent).
  Only callable by server code.
- pg_cron job every minute: `pending_payment` past `hold_expires_at` -> `expired`.
- Owner-created bookings (phone, walk-in, other app) stay `confirmed` directly through RLS, no hold.
- Do NOT create the AI agent tables yet; document them as planned for Sprint 4:
  `conversations` (owner_id, turf_id, player_phone, last_message_at),
  `messages` (conversation_id, role, content, tool_calls jsonb, created_at),
  `agent_settings` (turf_id, enabled, language).
- Update `supabase/seed.sql` and `supabase/tests` to match.
- Tests (SQL): two simultaneous `book_slot` on one slot -> one succeeds; expired hold is re-bookable;
  confirm within hold -> confirmed; late payment with free slot -> confirmed; late payment with slot
  taken -> refund_needed; duplicate webhook -> no second payment row.

After the migration: `supabase db push`, regenerate `lib/database.types.ts`, run the SQL tests,
`npm run build`.

## 3. Code (only this, nothing else yet)

- Remove any super admin code, routes, components and types.
- Remove any approval-mode or booking-requests code if it exists.
- Keep `lib/notify` as a stub. No payment, agent or webhook code yet (that is Sprint 4).

## 4. Docs (update all to match)

`docs/requirements.md`
- Users and roles: Owner and Player only; owners managed by our team in the Supabase dashboard.
- Remove screen 11 (Super admin) and screen 13 (Booking requests); remove approval mode everywhere.
- Replace the button bot screen with "WhatsApp AI agent": availability + booking only; confirms slot
  and price before booking; sends the payment page link; hands anything else to the turf's phone
  number; turf and player phone come from the webhook, never from the AI.
- Add "Public booking link" (`/b/[booking_code]`): free slots and prices; player enters name + phone;
  book_slot; goes to the payment page.
- Add "Payment page" (`/pay/[booking_id]`): 5-minute countdown, Razorpay checkout, success / expired
  states.
- Remove the owner's UPI ID / QR everywhere: setup wizard, turf settings, WhatsApp confirmation
  template, bot text. Players pay only through Razorpay.
- Booking rules: replace the hold/confirm text with the 5-minute BookMyShow-style lock and the edge
  cases (late payment, no-advance turfs, page closed, owner bookings).
- Working with other booking software: remove approval mode; keep WhatsApp-bookable bands and quick
  block.
- Tech stack: Next.js API instead of Edge Functions; Razorpay; MCP server; AI agent.
- Payment scope: online payment via Razorpay is now IN Phase 1 (was out of scope).
- Open questions: AI model provider; does the booking link need player OTP; Razorpay money flow.

`docs/dev-plan.md` (keep existing ticks; add a Change log line for each change)
- Sprint 6: remove the super admin task, renumber.
- S2.1 Setup wizard and S2.4 Turf settings: remove UPI ID / QR; S2.4 also remove approval mode.
- Replace Sprint 4 with "Booking service, payments, booking link, WhatsApp AI agent":
  - S4.1 Booking service: availability function + `book_slot` wrapper in `lib/booking`
  - S4.2 Hold expiry: cron + `book_slot` clean-up (verify on the remote)
  - S4.3 Payments: `lib/payments` Razorpay adapter (test mode), `/pay/[booking_id]` page with
    5-minute countdown, webhook route with signature check, `confirm_online_payment`, automatic refund
  - S4.4 Public booking link page `/b/[booking_code]`
  - S4.5 MCP server with `check_availability` and `book_slot` (wraps the booking service; returns the
    payment link)
  - S4.6 AI agent: model provider, system prompt, confirm-before-booking
  - S4.7 WhatsApp webhook (Next.js route) + conversations, messages, agent_settings tables
  - S4.8 Message sending through the WhatsApp provider (`lib/notify` adapter)
  - S4.9 Per-turf WhatsApp link, web booking link and QR code

`docs/DATABASE.md`, `docs/ARCHITECTURE.md`, `README.md`: new schema, no super admin, Next.js API,
locking + payment flow, MCP server and AI agent (planned).

`CLAUDE.md`: stack (no Edge Functions; Razorpay only, never show owner UPI to players); replace bot wording with the AI agent + MCP design and
its safety rules; add "players' slots lock for 5 minutes; only `book_slot` / `confirm_online_payment`
change booking status for player flows".

`docs/PROGRESS.md`: add each decision with today's date.

## 5. Output

Show the plan first. After I approve and you finish: list files changed, the migration name, SQL test
results, build result, and a one-line commit message. Don't commit; I will.
