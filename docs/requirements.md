# Phase 1 Requirements – Turf Owner Booking App

Phase 1 Requirements – Turf Owner Booking
App
 Nov 5, 2026  ·  @Sharath
Phase 1 has two parts: an owner app where owners and staff manage every booking in one
calendar, and a WhatsApp booking bot where players see free slots and book by chat. No
player app and no payment gateway in this phase; players pay the advance to the owner's
UPI and the owner confirms it. Target: build in 8 weeks, pilot with 5 turfs in weeks 9–10.
## Scope
Phase 1 solves the owner's daily problem: double bookings, missed advances and no-
shows. Everything players do happens through WhatsApp messages the system sends.
## In scope
1. Owner sign-up and login with phone OTP.
2. Turf and court setup: hours, slot length, prices, peak/off-peak, slot tags.
3. Calendar per court (day and week view).
4. Add, edit, reschedule and cancel bookings (phone, walk-in, WhatsApp bot, other app).
5. Block slots (maintenance, Playo/Hudle booking, private event).
6. Record advance and balance (cash or UPI) and mark check-in / no-show.
7. Customer list built automatically from bookings.
8. WhatsApp booking bot for players: pick court, date and slot; get the owner's UPI
details; see and cancel their bookings.
9. Booking requests: bot bookings wait as "Pending payment" until the owner confirms
the advance, or auto-confirm if the owner turns off advance.
10. Per-turf WhatsApp booking link and QR code (opens the bot with that turf selected).
11. WhatsApp confirmation, reminder and cancellation messages to the player.
12. Owner alerts on WhatsApp for new bot requests, plus a daily summary.
13. Basic reports: revenue, occupancy, no-shows, bookings by source.
14. Staff login with limited access.
15. Super admin page for our team.
Also in scope: safe use alongside other booking software (Playo, Hudle, others) without
double bookings — see "Working with existing booking software".
## Out of scope (later phases)
Player mobile app or player login.

Payment gateway and automatic payment confirmation (owner confirms UPI advance
by hand).
A separate WhatsApp number for each turf (Phase 1 uses one platform number).
AI / free-text chat understanding (Phase 1 bot uses buttons and lists).
Public turf pages, Google "Book" link, city directory.
Academy batches, memberships, leagues, tournaments.
Subscription billing inside the app (pilot is free).
## Users and roles
Three roles log in to the app; the player never logs in and uses only WhatsApp.
One owner can have several turfs, and one turf can have several courts (e.g., 2 football
turfs + 1 pickleball court).
Screens and functional requirements
The app has 11 owner screens plus the WhatsApp bot and the booking-requests flow (13 in
total). Each lists what it must do and when it counts as done (acceptance criteria).
Priority: P0 = needed for pilot, P1 = can follow during pilot.
Role Logs in? Can do Cannot do
Owner Yes (phone
OTP)
Everything for their own turfs:
setup, prices, bookings,
reports, staff
See other owners' data
Staff Yes (phone OTP,
invited by
owner)
View calendar, add/edit
bookings, block slots, record
payments, check-in
Change prices or turf
settings, see reports,
manage staff
Super admin
(our team)
Yes View all owners, turfs and
bookings; activate/deactivate
owners; see message usage
Edit an owner's
bookings (view only,
except support fixes)
Player No Book, view and cancel
bookings by WhatsApp chat;
receive confirmation,
reminder, cancellation
messages
—

1. Login (P0)
Phone number + OTP; first login creates an owner account.
Staff log in with the number the owner invited.
Done when: a new owner reaches the setup wizard in under 1 minute; an uninvited
number cannot access any turf.
2. Setup wizard (P0)
Steps: turf name, address, Google Maps link → courts (name, sport) → opening hours
→ slot length (30/60/90 min) → base price → UPI ID / QR image.
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
phone, and the view updates within 3 seconds when staff add a booking on another
phone.
4. Add / edit booking (P0)
Fields: court, date, start time, duration (1 or more slots), customer phone (auto-fills
name if known), name, source (phone, walk-in, WhatsApp, Playo, Hudle, other), price
(auto from rules, editable), advance amount, payment mode (cash/UPI), notes.
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
10. Staff and settings (P1)
Invite staff by phone number; remove staff.
Settings: UPI ID / QR, advance rule (fixed amount or %), cancellation policy text,
reminder timing, daily summary on/off and time.
Done when: removed staff lose access immediately.
11. Super admin (P0)
List of owners and turfs with status, bookings per day, messages sent.

Activate / deactivate an owner; view any booking (read-only).
Done when: our team can see all pilot turfs' activity on one page.
12. WhatsApp booking bot — player side (P0)
Player opens the turf's link or QR (e.g., wa.me/<platform number>?text=BOOK
GREENARENA); the code tells the bot which turf. If a player messages without a
code, the bot asks for the turf name or code.
Menu (buttons): Book a slot / My bookings / Cancel a booking / Talk to turf.
Book flow: choose court/sport → choose date (today + next 6 days) → list of free slots
with price (up to 10 per list; "more slots" for the rest) → confirm name → booking
summary.
If the turf needs an advance: bot sends amount, owner's UPI ID and QR, and says "Slot
held for 15 minutes — send payment screenshot here". Status = Pending payment.
If no advance needed: booking is Confirmed immediately.
My bookings: shows upcoming bookings for that phone number at that turf. Cancel:
pick a booking → confirm → cancellation policy shown → owner notified.
Talk to turf: bot sends the owner's phone number and alerts the owner.
Any free-text message the bot doesn't understand → shows the menu again.
Done when: a new player books a slot in under 60 seconds using only taps; two
players picking the same slot at once → only the first gets it, the second sees "Just
taken — pick another".
13. Booking requests — owner side (P0)
New bot booking → owner and staff get a WhatsApp alert and an in-app badge.
Requests list: player name, phone, court, time, amount due, payment screenshot (if
sent), time left on hold.
Actions: Confirm (advance received), Confirm without advance, Reject (with
reason, player notified).
Hold expiry: if not confirmed in 15 minutes (owner can change, 5–60 min), the slot is
released and the player is told.
Done when: the owner confirms a request in 2 taps from the WhatsApp alert or the
app, and the player gets the confirmation message immediately.
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
If two staff save the same slot at the same moment, the second save fails with "Slot
just got booked — refresh".
Cancelled, Rejected, Expired and No-show bookings free the slot. A job runs every
minute to expire unconfirmed Pending payment bookings.
Pricing
Price = sum of each slot's price; a slot uses the matching peak/off-peak band, else the
base price.
Owner can override the price on a booking; the override is recorded.
Advance and payments
Owner sets an advance rule: fixed amount (e.g., ₹ 300) or % of price, or none.
Payment status is calculated: Unpaid → Advance paid → Fully paid.
Each payment is recorded with amount, mode (cash/UPI), time and staff name. No
online gateway in Phase 1.
Booking statuses
Status Meaning Next possible status
Pending
payment
Bot booking waiting for owner to confirm
advance; slot held for the hold time
Confirmed, Rejected,
Expired
Confirmed Booked, slot held Checked-in, Cancelled, No-
show
Checked-in Team arrived Completed
Completed Game over (auto after end time if
checked-in)
—

Cancellation and reschedule
Owner writes their policy as text (e.g., "Full advance refund if cancelled 6+ hours
before"); it is shown in the confirmation message.
Refunds happen outside the app (cash/UPI); owner records the refund amount.
Reschedule moves the booking to a new free slot and sends an updated WhatsApp
message.
Working with existing booking software
Many owners also take bookings on Playo, Hudle or their own software. We can't assume
we'll get live access to those systems, so Phase 1 uses four safeguards that work without
any integration. Together they make a double booking very unlikely, and the owner always
has the final say.
Safeguard 1 — Owner chooses what the bot can sell (P0)
Per court and per time band, the owner sets "Bookable on WhatsApp: yes / no".
Example: Court 1 evenings on WhatsApp only; Court 2 kept for Playo. Slots set to "no"
never appear in the bot.
This is the safest option: the two systems never sell the same slot.
Safeguard 2 — Owner approval mode (P0)
Setting per turf: "Every WhatsApp booking needs my approval" (default ON when the
owner says they use other software).
Bot bookings stay as Pending until the owner confirms, even with no advance; the
owner checks the other app before tapping Confirm.
The player is told "Request received — the turf will confirm shortly", not "Confirmed".
Safeguard 3 — Quick block from other apps (P0)
Status Meaning Next possible status
Cancelled Cancelled by owner or player; reason
saved
—
Rejected Owner declined a bot request; reason sent
to player
—
Expired Hold time ran out without confirmation;
slot released
—
No-show Team didn't come; counts on customer
record
—

When a Playo/Hudle/other booking comes in, the owner or staff blocks that slot in 2
taps ("Block → source: Playo").
A WhatsApp shortcut to the owner number also works: forward or type "block 7pm
court 2" (P1).
Blocked slots disappear from the bot at once.
Safeguard 4 — Calendar sync where the other software allows it (P1, explore)
If the other software can export a calendar link (iCal / Google Calendar), we import it
every 5 minutes and block those times automatically.
We can also publish our bookings as a calendar link for the other software to import.
Limit: sync has a delay of a few minutes, so Safeguard 2 stays on for those turfs.
Not in Phase 1: direct live integration with Playo or Hudle. We will ask their partner teams
whether an API exists; until then, safeguards 1–3 apply.
During onboarding we ask every owner: which other apps/software they use, how many
bookings come from each, and whether that software can export a calendar.
Done when: in the pilot, a turf that also uses another app has zero double bookings for 2
weeks.
WhatsApp notifications
Phase 1 uses one platform WhatsApp number for every turf. It runs the booking bot
(players chat and book) and sends notifications. Bot replies inside a chat the player
started are normal session messages; messages we start (confirmations later, reminders,
owner alerts) need Meta-approved templates.
Template Sent to Trigger Content
Booking confirmed Player Booking confirmed (by
owner, or instantly when
no advance)
Turf name, court, date,
time, price, advance paid,
balance due, owner's UPI
ID, cancellation policy,
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
To get from the team that built WhatsApp bots before: provider or API used, Meta
verification steps, template approval time, cost per message, and any reusable code.
WhatsApp setup and build plan
Don't wait for the app to be finished. Ask the team to start the WhatsApp setup now, and
build the bot against a test number from week 1. Meta verification and template approval
take time we can't speed up, and connecting at the end hides problems until the pilot.
Part A — Setup (ask the team that built WhatsApp bots before, about 2–3 days of their
time)
Template Sent to Trigger Content
Booking cancelled /
rejected / expired
Player Status changes to
Cancelled, Rejected or
Expired
Date/time, reason, refund
note, "book again" button
New booking request Owner +
staff
Player books through the
bot
Player name, phone, court,
time, amount; Confirm /
Reject buttons
Daily summary Owner Every day at owner's
chosen time (default
8am)
Today's bookings count,
first and last slot, empty
peak slots, pending
balances, open requests
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
(us) → app features weeks 2–4 → bot weeks 5–7 → live number week 8 → pilot weeks 9–10.
## Data model
Eleven tables cover Phase 1, plus a calendar_feeds table (court_id, feed_url, direction
import/export, last_synced_at) for the P1 calendar sync. Every table except owners
carries the owner's id, so Row Level Security can keep each owner's data private.
Submit the templates in this doc (confirmation, reminder, reschedule,
cancel/reject/expire, new request alert, daily summary).
Share the costs: per-message rates and any monthly provider fee.
Share reusable code, webhook samples and lessons learned.
Week 1: webhook endpoint (Supabase Edge Function) that receives messages and
replies "hello" on the test number.
Week 1: a small "message sender" module so the rest of the app never calls WhatsApp
directly. Switching provider later changes one file.
Weeks 5–6: chat sessions, menu, book flow, my bookings, cancel, talk to turf.
Week 7: template messages, owner alerts with Confirm/Reject buttons.
Week 8: switch from the test number to the live number; test with 5 internal phones.
Business verified and display name approved.
All templates approved.
Message log shows sent/delivered for every template.
Tested: two phones booking the same slot at once; hold expiry; owner confirm from
WhatsApp alert.
Table Key fields Notes
owners id, name, phone, status
(active/inactive), created_at
One per business
members id, owner_id, user_id, role (owner/staff),
phone
Who can log in to which owner
account

Added for the WhatsApp bot: a wa_sessions table (id, phone, turf_id, current_step,
selected_court, selected_date, selected_slot, updated_at) stores where each player is in
the chat, so the bot remembers their choices between messages. Sessions older than 30
minutes reset to the menu. Each turf's booking_code (e.g., GREENARENA) links a chat to
the right turf.
An audit trail (who changed what, when) is kept for bookings and payments, either as an
extra table or with Supabase triggers.
Table Key fields Notes
turfs id, owner_id, name, booking_code,
address, maps_link, hold_minutes,
approval_mode, upi_id, upi_qr_url,
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
payment_proof_url
Overlap constraint on court +
time_range for active statuses
blocks id, court_id, time_range, reason,
created_by
Also in the overlap check
payments id, booking_id, amount, mode
(cash/UPI), type
(advance/balance/refund),
recorded_by, paid_at
Payment status is calculated
from these
message_log id, owner_id, booking_id, template,
phone, status, cost, sent_at
For debugging and cost tracking

Tech stack and non-functional requirements
One Next.js web app, installable on phones, with Supabase as the backend. Built by one
developer with Claude Code.
Non-functional requirements
Mobile-first: every screen works on a 6-inch Android phone over 4G; key actions in 2
taps.
Speed: calendar loads in under 2 seconds; saving a booking under 1 second.
Data privacy: Row Level Security on every table; an owner or staff can only reach
their own owner account's data.
Secrets: WhatsApp and service keys only in Edge Functions, never in the browser.
Reliability: a failed message never blocks or loses a booking; daily database backups.
Language: English UI in Phase 1; text kept in one file so Tamil/Hindi can be added later.
Testing: automated tests for overlap prevention, pricing bands, payment status and
reminder timing.
Part Choice
Frontend (owner, staff, admin) Next.js (App Router) + TypeScript, installable as a
PWA
UI Tailwind CSS + shadcn/ui
Database, auth, storage Supabase (PostgreSQL, phone OTP, file storage for
QR/photos)
Server logic Supabase Edge Functions (WhatsApp webhook for
the bot + message sending) + database functions
Scheduled jobs Supabase cron (expire unpaid holds every minute,
reminders every 5 min, daily summary, auto-
complete)
Real-time calendar Supabase Realtime on bookings and blocks
WhatsApp Provider the internal team used (or Meta Cloud
API)
Hosting Vercel (app) + Supabase (backend), India-nearest
regions
Code and tracking GitHub repo; docs/requirements.md  +
CLAUDE.md  in the repo

Milestones, success criteria and open questions
Ten weeks from start to the end of the pilot; the WhatsApp bot adds about 2 weeks. Meta
verification starts in week 1 because approval can take time, and the bot can't go live
without it.
Milestones
1. Week 1: set up tools and repo, database design, rough screens; start Meta business
verification, get the platform number, submit templates.
2. Week 2: login, setup wizard, courts and pricing settings.
3. Weeks 3–4: calendar, add/edit booking, block slots, booking detail, payments.
4. Weeks 5–6: WhatsApp bot: webhook, chat sessions, menu, book flow, my bookings,
cancel; booking requests screen and hold expiry.
5. Week 7: confirmation, reminder, cancellation, owner alerts, daily summary.
6. Week 8: staff access, customers, reports, super admin; testing (especially two players
booking the same slot).
7. Weeks 9–10: pilot with 5 turfs (one small turf, one Playo/Hudle-listed turf, one
pickleball court), daily fixes.
Pilot success criteria
5 turfs using the app every day for 2 weeks.
80%+ of each turf's bookings entered in the app.
30%+ of bookings come through the WhatsApp bot by the end of the pilot.
Owners confirm bot requests within 15 minutes on average.
Zero double bookings.
No-shows lower than the owner's estimate before the pilot.
At least 3 owners say they would pay ₹ 499+/month.
Open questions
Launch city and the 5 pilot turfs?
Which WhatsApp provider / API did the internal team use, and can we reuse it?
App and brand name, domain?
Do owners need a Tamil or Hindi interface in the pilot?
Should staff see customer phone numbers?
Who gives Meta verification documents (company GST, website, address proof)?
