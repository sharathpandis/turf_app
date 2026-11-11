# Database

Built from `supabase/migrations/` (7 files, applied to local and to the remote dev project `turf-app-dev`). Seed data: `supabase/seed.sql` (local only).

## Tables
Full table list, columns and relation diagram: `docs/SCHEMA.md`.

- **owners** — one per business: name, phone, email, status (active/inactive). Created by the first-login trigger.
- **members** — which auth user belongs to which owner. `role` allows only `'owner'` in Phase 1 (staff may return later).
- **super_admins** — auth users who are our team (read access to everything).
- **turfs** — owner's turf: booking code, UPI, hold minutes, approval mode, advance rule, cancellation text, reminder and summary settings. Belongs to an owner.
- **courts** — belong to a turf: slot length, open/close time (close at or before open means past midnight), base price.
- **price_bands** — peak/off-peak price per court: days, time window, price, tag, bookable on WhatsApp.
- **customers** — per owner, unique by phone.
- **bookings** — court, customer, time range (`tstzrange`), status, source, price, override flag, hold expiry, payment proof, who created it.
- **blocks** — blocked time on a court with a reason (maintenance, Playo / Hudle / other app, private event).
- **payments** — advance, balance or refund per booking: amount, cash/UPI, who recorded it. Payment status is calculated from these.
- **court_occupancy** — system table behind the overlap rule (below). Not written by the app.
- **audit_log** — who changed what and when, for bookings and payments (filled by triggers).

Every table except `owners` carries `owner_id`. Composite foreign keys make sure a child row's owner matches its parent's owner. Money is integer rupees; times are `timestamptz`.

## Double-booking constraint
Two active bookings or blocks can never overlap on the same court. Postgres cannot put one constraint across two tables, so every active booking (Pending payment, Confirmed, Checked-in, Completed) and every block keeps one row in `court_occupancy`, and that table refuses overlapping time ranges for the same court. Triggers keep it in step: cancelling, rejecting, expiring or marking no-show removes the row and frees the slot. A clash fails with error 23P01, which the app shows as "Slot just got booked — refresh". Back-to-back slots (one ends when the next starts) are allowed.

## RLS rules per role
RLS is on for every table.
- **Owner:** full read/write on rows of their own, active owner account (found through `members`). Can read `members`, `court_occupancy` and `audit_log`; cannot write them. Can edit own owner name and phone, not status.
- **Super admin:** read-only on everything. Activating/deactivating an owner is done from server code with the service-role key (S6.3).
- **Anon:** no access.
- An inactive owner loses access (the helper only returns active owners).
- First login creates an owner and a `members` row automatically, when the email (or phone) is confirmed, i.e. the OTP is verified, not when an OTP is requested. The email is copied to `owners.email` and `members.email`.

## Cron jobs
None yet (hold expiry is S4.2).

## Storage buckets
None yet (UPI QR bucket is S2.1).
