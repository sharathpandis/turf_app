# Database

Built from `supabase/migrations/` (8 files, applied to local and to the remote dev project `turf-app-dev`). Seed data: `supabase/seed.sql` (local only).

## Tables
Full table list, columns and relation diagram: `docs/SCHEMA.md`.

- **owners** — one per business (tenant): name, phone, email, status (active/inactive), plan (free/starter/pro) with start and renewal dates. Created by the first-login trigger. Plan and status are changed by our team in the Supabase dashboard, never by the owner.
- **members** — which auth user belongs to which owner. `role` allows only `'owner'` in Phase 1 (staff may return later).
- **turfs** — owner's turf: booking code, hold minutes (default 5), advance rule, cancellation text, reminder and summary settings. Belongs to an owner.
- **courts** — belong to a turf: slot length, open/close time (close at or before open means past midnight), base price.
- **price_bands** — peak/off-peak price per court: days, time window, price, tag, bookable on WhatsApp.
- **customers** — per owner, unique by phone.
- **bookings** — court, customer, time range (`tstzrange`), status, source (`phone`, `walk_in`, `whatsapp`, `other_app`, `booking_link`), price, override flag, hold expiry, Razorpay order id (`payment_order_id`), payment proof (unused, tech debt), who created it.
- **blocks** — blocked time on a court with a reason (maintenance, Playo / Hudle / other app, private event).
- **payments** — advance, balance or refund per booking: amount, mode (`online` = Razorpay; `cash`/`upi` = recorded by hand at the counter), gateway and `gateway_payment_id` (unique, so one webhook = one row), who recorded it. Payment status is calculated from these.
- **court_occupancy** — system table behind the overlap rule (below). Not written by the app.
- **audit_log** — who changed what and when, for bookings and payments (filled by triggers).

Every table except `owners` carries `owner_id`. Composite foreign keys make sure a child row's owner matches its parent's owner. Money is integer rupees; times are `timestamptz`.

## Double-booking constraint
Two active bookings or blocks can never overlap on the same court. Postgres cannot put one constraint across two tables, so every active booking (Pending payment, Confirmed, Checked-in, Completed) and every block keeps one row in `court_occupancy`, and that table refuses overlapping time ranges for the same court. Triggers keep it in step: cancelling, rejecting, expiring or marking no-show removes the row and frees the slot. A clash fails with error 23P01, which the app shows as "Slot just got booked — refresh". Back-to-back slots (one ends when the next starts) are allowed.

## RLS rules per role
RLS is on for every table.
- **Owner:** full read/write on rows of their own, active owner account (found through `members`). Can read `members`, `court_occupancy` and `audit_log`; cannot write them. Can edit own owner name and phone only, not status, plan or plan dates.
- **No super admin in the app.** Our team manages owners (plan, status) in the Supabase dashboard.
- **Anon:** no access.
- An inactive owner loses access (the helper only returns active owners).
- First login creates an owner and a `members` row automatically, when the email (or phone) is confirmed, i.e. the OTP is verified, not when an OTP is requested. The email is copied to `owners.email` and `members.email`.

## Slot locking and payments (server code only)
Players' slots lock for 5 minutes (`turfs.hold_minutes`). Only these functions, callable by the service role only, change booking status in player flows:
- `private.book_slot(turf_id, court_id, time_range, customer_phone, customer_name, source)` — expires lapsed holds on the court, finds or creates the customer, inserts `confirmed` (no-advance turf) or `pending_payment` with `hold_expires_at`; a taken slot returns `{"error":"slot_taken"}`. Price is a placeholder (court base price prorated) until pricing is decided.
- `private.confirm_online_payment(order_id, gateway_payment_id, amount)` — paid in time → `confirmed`; late but slot free → re-locked and `confirmed`; slot taken → `refund_needed` (server refunds and notifies); same payment twice → `duplicate`, no-op.
Owner-created bookings (phone, walk-in, other app) are inserted `confirmed` through RLS with no hold.
Note: `private` is not exposed through the API, so S4.1 adds a service-role-only wrapper or uses a direct connection. `payment_mode` and `booking_status` keep values that can't be dropped (`rejected` is now unused).

## Planned tables (Sprint 4, S4.7)
`conversations` (owner_id, turf_id, player_phone, last_message_at), `messages` (conversation_id, role, content, tool_calls jsonb, created_at), `agent_settings` (turf_id, enabled, language).

## Cron jobs
- `expire-holds` (pg_cron, every minute) — runs `private.expire_holds()`: `pending_payment` bookings past `hold_expires_at` become `expired`.

## Storage buckets
None yet.
