# Phase 1 Requirements – Turf Owner Booking App

Phase 1 Requirements – Turf Owner Booking
App
 Nov 5, 2026  ·  @Sharath
Phase 1 has two parts: an owner app where owners manage every booking in one
calendar, and player booking through a public booking link and a WhatsApp AI agent. No
player app in this phase; players pay the advance online through Razorpay and the slot
confirms automatically. Target: build in 8 weeks, pilot with 5 turfs in weeks 9–10.
## Scope
Phase 1 solves the owner's daily problem: double bookings, missed advances and no-
shows. Players book through the booking link or the WhatsApp agent, and get messages the system sends.
## In scope
1. Owner sign-up and login with email OTP (phone OTP later).
2. Turf and court setup: hours, slot length, prices, peak/off-peak, slot tags.
3. Calendar per court (day and week view).
4. Add, edit, reschedule and cancel bookings (phone, walk-in, booking link, WhatsApp agent, other app).
5. Block slots (maintenance, Playo/Hudle booking, private event).
6. Record advance and balance (online, cash or UPI) and mark check-in / no-show.
7. Customer list built automatically from bookings.
8. WhatsApp AI agent for players: tells slot availability and books slots.
9. Public booking link per turf: free slots and prices, then online payment (Razorpay).
10. 5-minute slot lock while the player pays; paid in time confirms automatically.
11. Per-turf WhatsApp link, web booking link and QR code.
12. WhatsApp confirmation, reminder and cancellation messages to the player.
13. Owner daily summary on WhatsApp.
14. Basic reports: revenue, occupancy, no-shows, bookings by source.
Also in scope: safe use alongside other booking software (Playo, Hudle, others) without
double bookings — see "Working with existing booking software".
## Out of scope (later phases)
Player mobile app or player login.
Staff access (staff login with limited permissions); may return in a later phase.

A separate WhatsApp number for each turf (Phase 1 uses one platform number).
Agent features beyond availability and booking (the agent hands everything else to the turf).
Public turf pages, Google "Book" link, city directory.
Academy batches, memberships, leagues, tournaments.
Subscription billing inside the app (pilot is free).
## Users and roles
Two roles: owner and player. Only owners log in to the app; our team manages owners (plan, status) in the Supabase dashboard. The player never logs in and books through the booking link or WhatsApp.
One owner can have several turfs, and one turf can have several courts (e.g., 2 football
turfs + 1 pickleball court).
Screens and functional requirements
The app has 10 owner screens plus the WhatsApp AI agent, the public booking link and the
payment page (13 in total). Each lists what it must do and when it counts as done (acceptance criteria).
Priority: P0 = needed for pilot, P1 = can follow during pilot.
Role Logs in? Can do Cannot do
Owner Yes (phone
OTP)
Everything for their own turfs:
setup, prices, bookings,
reports
See other owners' data
Player No Book and pay online via the
booking link or WhatsApp
agent; receive confirmation,
reminder, cancellation
messages
—

1. Login (P0)
Email + OTP code (phone OTP later, once an SMS provider is chosen); first login creates an owner account.
Done when: a new owner reaches the setup wizard in under 1 minute; an uninvited
number cannot access any turf.
2. Setup wizard (P0)
Steps: turf name, address, Google Maps link → courts (name, sport) → opening hours
→ slot length (30/60/90 min) → base price.
Can skip and finish later; shows progress.
Done when: an owner sets up 1 turf with 2 courts in under 10 minutes and lands on the
calendar.
3. Calendar — home screen (P0)
Day view (default) and week view; switch court with tabs.
Each slot shows: free / pending payment / booked / blocked, customer name, payment
status (unpaid, advance paid, fully paid), source colour.
Tap a free slot → Add booking; tap a booked slot → Booking detail.
Date picker, "Today" button, swipe for next/previous day.
Done when: the owner sees today's full schedule for a court in one screen on a 6-inch
phone, and the view updates within 3 seconds when a booking is added on another
phone.
4. Add / edit booking (P0)
Fields: court, date, start time, duration (1 or more slots), customer phone (auto-fills
name if known), name, source (phone, walk-in, WhatsApp, Playo, Hudle, other), price
(auto from rules, editable), advance amount, payment mode (online/cash/UPI), notes.
Option: send WhatsApp confirmation (on by default).
Recurring booking: repeat weekly for N weeks (P1).
Done when: a booking is saved in under 30 seconds; saving an overlapping booking on
the same court is blocked with a clear message.
5. Booking detail (P0)
Shows all booking info and payment history.
Actions: record balance payment, mark checked-in, mark no-show, reschedule, cancel
(with reason), resend WhatsApp, call customer, open WhatsApp chat.

Done when: each action updates the calendar immediately and is recorded in the
booking history (who, when).
6. Block slots (P0)
Block one or many slots on a court with a reason (maintenance, other app booking,
private event, rain).
Done when: blocked slots cannot be booked and show the reason on the calendar.
7. Customers (P1)
List built automatically from bookings: name, phone, total bookings, last visit, no-show
count, total paid.
Search by name or phone; tap to see booking history.
Done when: a repeat customer's details auto-fill when their phone number is typed in
Add booking.
8. Courts and pricing settings (P0)
Edit courts, hours, slot length, base price.
Peak / off-peak price bands by day and time (e.g., Mon–Fri 6–10pm = ₹ 1,500; weekdays
10am–4pm = ₹ 800).
Slot tags: night, women-only, kids, coaching.
Close a court for a date range (holiday, repair).
Done when: price on Add booking matches the band for that day and time.
9. Reports (P1)
Today / this week / this month: total bookings, revenue collected, pending balance,
occupancy % by court and by hour, no-shows, bookings by source.
Done when: report totals match the sum of bookings for the period.
10. Settings (P1)
Settings: advance rule (fixed amount or %), cancellation policy text,
reminder timing, daily summary on/off and time.
Done when: a changed setting applies to the next booking immediately.
11. WhatsApp AI agent — player side (P0)
Player opens the turf's link or QR (e.g., wa.me/<platform number>?text=GREENARENA);
the turf and the player's phone come from the webhook, never from the AI.
The agent has one job: tell the player which slots are free and book them. It uses only
two tools (via the MCP server): check_availability and book_slot.
Before booking it repeats the slot and price and waits for the player's yes. It then sends
the payment page link (screen 13); the slot is locked for 5 minutes.
Anything else (cancel, change, questions) → it gives the turf's phone number.
Done when: a new player books a slot in under 60 seconds; two players picking the
same slot at once → only the first gets it, the second is told "Just taken — pick another".
12. Public booking link (P0)
Page at /b/[booking_code]: pick court and date, see free slots with prices. Player
enters name + phone, taps Book; the system locks the slot (book_slot) and opens the
payment page.
Done when: a player books from a phone browser in under 60 seconds; a taken slot
shows "Just taken — pick another".
13. Payment page (P0)
Page at /pay/[booking_id]: booking summary, 5-minute countdown, Razorpay checkout.
States: success (booking confirmed) and expired (slot released, "Book again" button).
Done when: paying inside the countdown confirms the booking without any owner action.
## Booking rules
The one rule that must never break: two active bookings or blocks cannot overlap on the
same court. This is enforced in the database, not only in the app.

Slots and time
Slots are generated from the court's opening hours and slot length; a booking covers
one or more consecutive slots.
Courts open past midnight (e.g., 6am–2am) are supported; the booking belongs to the
day it starts.
All times are stored in UTC and shown in India time (IST).
No bookings in the past, except the owner may log a walk-in for the current slot.
Double-booking prevention
Database constraint on (court, time range) for bookings with status Pending payment,
Confirmed, Checked-in or Completed, and for blocks.
If two phones save the same slot at the same moment, the second save fails with "Slot
just got booked — refresh".
Cancelled, Expired and No-show bookings free the slot. A database cron job runs every
minute to expire Pending payment bookings past their hold time.
Slot lock for players (like BookMyShow)
When a player books through the booking link or the WhatsApp agent, book_slot locks the
slot for 5 minutes (turf setting, 5–60) while they pay online with Razorpay.
Paid in time → confirmed automatically. Not paid → the hold expires and the slot is
released; the player starts again. The owner never confirms payments.
Late payment (hold already expired): if the slot is still free it is locked again and
confirmed; if someone else took it, the payment is refunded automatically.
Turfs with no advance: the booking is confirmed instantly, no hold.
Player closes the page: nothing to do; the hold expires by the cron job.
Owner-created bookings (phone, walk-in, other app) are confirmed directly, no hold.
Only book_slot and confirm_online_payment change booking status in player flows.
Pricing
Price = sum of each slot's price; a slot uses the matching peak/off-peak band, else the
base price.
Owner can override the price on a booking; the override is recorded.
Advance and payments
Owner sets an advance rule: fixed amount (e.g., ₹ 300) or % of price, or none.
Payment status is calculated: Unpaid → Advance paid → Fully paid.
Each payment is recorded with amount, mode (online/cash/UPI), time and who recorded it.
Online = Razorpay, recorded by the webhook. Cash and UPI are only money the owner collects
at the counter and records by hand. Players never get the owner's UPI ID or QR.
Booking statuses
Status Meaning Next possible status
Pending
payment
Player booking waiting for online advance;
slot locked for the hold time (5 min)
Confirmed, Expired
Confirmed Booked, slot held Checked-in, Cancelled, No-
show
Checked-in Team arrived Completed
Completed Game over (auto after end time if
checked-in)
—

Cancellation and reschedule
Owner writes their policy as text (e.g., "Full advance refund if cancelled 6+ hours
before"); it is shown in the confirmation message.
Online payments refunded automatically when a late payment loses its slot; other refunds happen outside the app and the owner records the amount.
Reschedule moves the booking to a new free slot and sends an updated WhatsApp
message.
Working with existing booking software
Many owners also take bookings on Playo, Hudle or their own software. We can't assume
we'll get live access to those systems, so Phase 1 uses three safeguards that work without
any integration. Together they make a double booking very unlikely, and the owner always
has the final say.
Safeguard 1 — Owner chooses what players can book (P0)
Per court and per time band, the owner sets "Bookable online (link and WhatsApp): yes / no".
Example: Court 1 evenings on WhatsApp only; Court 2 kept for Playo. Slots set to "no"
never appear to players.
This is the safest option: the two systems never sell the same slot.
Safeguard 2 — Quick block from other apps (P0)
Status Meaning Next possible status
Cancelled Cancelled by owner or player; reason
saved
—
Expired Hold time ran out without payment;
slot released
—
No-show Team didn't come; counts on customer
record
—

When a Playo/Hudle/other booking comes in, the owner blocks that slot in 2
taps ("Block → source: Playo").
A WhatsApp shortcut to the owner number also works: forward or type "block 7pm
court 2" (P1).
Blocked slots disappear for players at once.
Safeguard 3 — Calendar sync where the other software allows it (P1, explore)
If the other software can export a calendar link (iCal / Google Calendar), we import it
every 5 minutes and block those times automatically.
We can also publish our bookings as a calendar link for the other software to import.
Limit: sync has a delay of a few minutes, so keep Safeguard 1 for those turfs.
Not in Phase 1: direct live integration with Playo or Hudle. We will ask their partner teams
whether an API exists; until then, safeguards 1–2 apply.
During onboarding we ask every owner: which other apps/software they use, how many
bookings come from each, and whether that software can export a calendar.
Done when: in the pilot, a turf that also uses another app has zero double bookings for 2
weeks.
WhatsApp notifications
Phase 1 uses one platform WhatsApp number for every turf. It runs the AI agent
(players chat and book) and sends notifications. Agent replies inside a chat the player
started are normal session messages; messages we start (confirmations later, reminders)
need Meta-approved templates.
Template Sent to Trigger Content
Booking confirmed Player Booking confirmed (online
payment received, or
instantly when no advance)
Turf name, court, date,
time, price, advance paid,
balance due, cancellation
policy,
Google Maps link
Reminder Player X hours before start
(default 2, owner can
change)
Turf, court, time, Maps
link, balance due
Booking rescheduled Player Booking moved Old and new date/time

Rules
Reminders are skipped for bookings made less than X hours before start, and for
cancelled bookings.
Every message attempt is logged: template, phone, status (sent, delivered, failed),
cost.
If sending fails, the booking still saves; the owner sees "Message failed — resend".
Owner can turn confirmations off per booking (e.g., regular team that doesn't need it).
To get from the team that built WhatsApp agents before: provider or API used, Meta
verification steps, template approval time, cost per message, and any reusable code.
WhatsApp setup and build plan
Don't wait for the app to be finished. Ask the team to start the WhatsApp setup now, and
build the agent against a test number from week 1. Meta verification and template approval
take time we can't speed up, and connecting at the end hides problems until the pilot.
Part A — Setup (ask the team that built WhatsApp agents before, about 2–3 days of their
time)
Template Sent to Trigger Content
Booking cancelled /
expired
Player Status changes to
Cancelled or Expired
Date/time, reason, refund
note, "book again" button
Daily summary Owner Every day at owner's
chosen time (default
8am)
Today's bookings count,
first and last slot, empty
peak slots, pending
balances
Choose the connection: Meta WhatsApp Cloud API directly, or the provider they used
before (Interakt, AiSensy, WATI, Gupshup). Prefer what they already know.
Create or reuse the Meta Business account; start business verification (company
name, GST/registration, address proof, website with privacy policy).
Get a new phone number for the platform (not active on the normal WhatsApp app).
Set the display name and profile (logo, description, website).
Give the developer a test number and API access for development.

Part B — Build (us, in parallel)
Part C — Before go-live
Order of work: Part A starts this week (team) → Part B week 1 runs on the test number
(us) → app features weeks 2–4 → agent weeks 5–7 → live number week 8 → pilot weeks 9–10.
## Data model
Eleven tables cover Phase 1, plus three planned AI tables (below) and a calendar_feeds table (court_id, feed_url, direction
import/export, last_synced_at) for the P1 calendar sync. Every table except owners
carries the owner's id, so Row Level Security can keep each owner's data private.
Submit the templates in this doc (confirmation, reminder, reschedule,
cancel/expire, daily summary).
Share the costs: per-message rates and any monthly provider fee.
Share reusable code, webhook samples and lessons learned.
Week 1: webhook endpoint (Next.js route handler) that receives messages and
replies "hello" on the test number.
Week 1: a small "message sender" module so the rest of the app never calls WhatsApp
directly. Switching provider later changes one file.
Weeks 5–6: MCP server (check_availability, book_slot), AI agent, payment page, booking link.
Week 7: template messages and daily summary.
Week 8: switch from the test number to the live number; test with 5 internal phones.
Business verified and display name approved.
All templates approved.
Message log shows sent/delivered for every template.
Tested: two phones booking the same slot at once; hold expiry; late payment
(re-lock or refund).
Table Key fields Notes
owners id, name, phone, status
(active/inactive), plan
(free/starter/pro),
plan_started_at,
plan_renews_at, created_at
One per business; plan and status
set by our team in the Supabase
dashboard
members id, owner_id, user_id, role (owner only in Phase 1; staff may return later),
phone
Who can log in to which owner
account

Each turf's booking_code (e.g., GREENARENA) links a booking link or chat to the right turf.
An audit trail (who changed what, when) is kept for bookings and payments, either as an
extra table or with Supabase triggers.
Table Key fields Notes
turfs id, owner_id, name, booking_code,
address, maps_link, hold_minutes (default 5),
advance_rule, cancellation_policy,
reminder_hours, summary_time
One owner → many turfs
courts id, turf_id, name, sport, slot_minutes,
open_time, close_time, base_price,
active
One turf → many courts
price_bands id, court_id, days_of_week, start_time,
end_time, price, tag,
whatsapp_bookable
Peak / off-peak and tags (night,
women-only, kids, coaching)
customers id, owner_id, name, phone, notes Unique per owner + phone
bookings id, court_id, customer_id, time_range
(start–end), status, source, price,
price_overridden, notes, created_by,
cancel_reason, hold_expires_at,
payment_order_id (unique)
Overlap constraint on court +
time_range for active statuses
blocks id, court_id, time_range, reason,
created_by
Also in the overlap check
payments id, booking_id, amount, mode
(online/cash/UPI), type
(advance/balance/refund),
gateway, gateway_payment_id
(unique, so a repeated webhook
adds no row), recorded_by, paid_at
Payment status is calculated
from these
message_log id, owner_id, booking_id, template,
phone, status, cost, sent_at
For debugging and cost tracking
conversations (planned, owner_id, turf_id, player_phone,
Sprint 4) last_message_at
messages (planned, conversation_id, role, content,
Sprint 4) tool_calls (jsonb), created_at
agent_settings turf_id, enabled, language
(planned, Sprint 4)

Tech stack and non-functional requirements
One Next.js web app (front end and API route handlers), installable on phones, with Supabase as the backend. Built by one
developer with Claude Code.
Non-functional requirements
Mobile-first: every screen works on a 6-inch Android phone over 4G; key actions in 2
taps.
Speed: calendar loads in under 2 seconds; saving a booking under 1 second.
Data privacy: Row Level Security on every table; an owner can only reach
their own owner account's data.
Secrets: WhatsApp, Razorpay and service keys only in server code, never in the browser.
Reliability: a failed message never blocks or loses a booking; daily database backups.
Language: English UI in Phase 1; text kept in one file so Tamil/Hindi can be added later.
Testing: automated tests for overlap prevention, pricing bands, payment status and
reminder timing.
Part Choice
Frontend (owner app, booking link, payment page) Next.js (App Router) + TypeScript, installable as a
PWA
UI Tailwind CSS + shadcn/ui
Database, auth, storage Supabase (PostgreSQL, email OTP, file storage for
photos)
Server logic Next.js route handlers (WhatsApp webhook, Razorpay
webhook, message sending) + database functions
(book_slot, confirm_online_payment)
Payments Razorpay only, behind an adapter (lib/payments); test
mode for development
AI agent LLM agent that reaches the backend only through an MCP
server with two tools: check_availability and book_slot
Scheduled jobs Supabase pg_cron (expire unpaid holds every minute,
reminders every 5 min, daily summary, auto-
complete)
Real-time calendar Supabase Realtime on bookings and blocks
WhatsApp Provider the internal team used (or Meta Cloud
API)
Hosting Cloudflare Workers via OpenNext (app) + Supabase (backend), India-nearest
regions
Code and tracking GitHub repo; docs/requirements.md  +
CLAUDE.md  in the repo

Milestones, success criteria and open questions
Ten weeks from start to the end of the pilot; the AI agent and online payments add about 2 weeks. Meta
verification starts in week 1 because approval can take time, and the agent can't go live
without it.
Milestones
1. Week 1: set up tools and repo, database design, rough screens; start Meta business
verification, get the platform number, submit templates.
2. Week 2: login, setup wizard, courts and pricing settings.
3. Weeks 3–4: calendar, add/edit booking, block slots, booking detail, payments.
4. Weeks 5–6: booking service, Razorpay payments, payment page, public booking link,
slot lock and hold expiry; MCP server and AI agent.
5. Week 7: confirmation, reminder, cancellation messages, daily summary.
6. Week 8: customers, reports; testing (especially two players
booking the same slot).
7. Weeks 9–10: pilot with 5 turfs (one small turf, one Playo/Hudle-listed turf, one
pickleball court), daily fixes.
Pilot success criteria
5 turfs using the app every day for 2 weeks.
80%+ of each turf's bookings entered in the app.
30%+ of bookings come through the booking link or WhatsApp agent by the end of the pilot.
90%+ of player bookings that start a payment are paid inside the 5-minute lock.
Zero double bookings.
No-shows lower than the owner's estimate before the pilot.
At least 3 owners say they would pay ₹ 499+/month.
Open questions
Launch city and the 5 pilot turfs?
Which WhatsApp provider / API did the internal team use, and can we reuse it?
Which AI model provider for the WhatsApp agent?
Does the booking link need player OTP (phone verification)?
Razorpay money flow: our account with payouts, or the owner's own account?
App and brand name, domain?
Do owners need a Tamil or Hindi interface in the pilot?
Who gives Meta verification documents (company GST, website, address proof)?
