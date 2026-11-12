# Phase 1 Development Plan

Nov 6, 2026 · @Sharath

Six sprints of building, then a 5-turf pilot. Durations will be added later. Each sprint ends with something working on a phone. Spec: the Phase 1 requirements doc (`docs/requirements.md` in the repo).

## How we work

One feature per Claude Code session: plan, build, test on a phone, commit, clear. This keeps Claude fast and cheap, and every step can be rolled back.

**Each feature (one session)**

1. `/clear` in Claude Code, then plan mode (Shift+Tab).
2. Paste the prompt from this plan; it names the section of `docs/requirements.md` to read.
3. Review the plan; ask questions; approve.
4. Claude builds; it runs `npm run lint` and `npm run build` before saying done.
5. Test on your phone (Vercel preview URL) against the "Done when" line in the requirements.
6. `git add . && git commit -m "<feature>" && git push`.

**Git branches**

- `main` = always working; Vercel deploys it.
- One branch per feature (e.g., `feature/calendar`); merge to `main` when it passes the phone test. Vercel gives each branch its own preview link.

**Database changes**

- Only through migration files + `supabase db push`; regenerate types after each one.
- Supabase MCP: read schema, logs and security advisors only.

**End of each sprint**

- Demo on a phone to the team (15 min).
- Run Supabase security advisors; fix any warnings.
- Update the requirements doc if anything changed.

## Sprint 1: foundation

Goal: an owner can log in on a phone and land on an empty home screen, backed by the full database. Nothing else is built until the double-booking rule is proven.

**Tasks**

- [x] **S1.1 Database schema** — tables, double-booking constraint, RLS, seed. Approve plan, then `supabase db push`, generate types. (2026-11-10)
- [x] **S1.2 Prove the overlap rule** — in the SQL Editor, an overlapping booking and a booking over a block must both fail. (2026-11-10)
- [x] **S1.3 Supabase client setup** — browser + server clients, middleware (Next 16: `proxy.ts`) that refreshes the session and protects owner pages. (2026-11-10)
- [x] **S1.4 Login (screen 1)** — email OTP (phone OTP later); first login creates owner + member rows. (2026-11-10)
- [ ] **S1.5 App shell** — bottom nav (Calendar, Customers, More), header with turf switcher, PWA manifest + icons, "Add to Home Screen" works.
- [ ] **S1.6 Deploy** — connect the repo to Vercel, add env variables, preview links per branch.

**Prompts**

S1.1:

```
Read CLAUDE.md, then "Users and roles", "Booking rules", "Working with existing booking software"
and "Data model" in docs/requirements.md. Design the Supabase schema for the owner app (skip
wa_sessions and calendar_feeds). Include tables, foreign keys, the double-booking exclusion
constraint (bookings and blocks must not overlap each other), RLS with a helper function,
owner + member creation on first login (members.role allows only 'owner' for now), and a seed (1 owner, 1 turf, 2 courts, price bands,
5 bookings, 1 block). Check the project with Supabase MCP first. Plan only.
```

S1.3–S1.5:

```
Build Supabase client setup, middleware, screen 1 (Login) and the app shell from
docs/requirements.md. Email OTP login; bottom nav; PWA manifest and icons.
Mobile-first at 360px. Plan first.
```

**Done when:** you log in on your phone with an email OTP, the app opens from the home-screen icon, and the overlap tests fail as they should.

## Sprint 2: setup wizard, courts and pricing

Goal: a new owner sets up a real turf in under 10 minutes, and the app knows every slot and its price.

**Tasks**

- [ ] **S2.1 Setup wizard (screen 2)** — turf details → courts → hours → slot length → base price.
- [ ] **S2.2 Courts and pricing settings (screen 8)** — edit courts and hours, peak/off-peak bands, slot tags, "bookable on WhatsApp" per band, close a court for dates.
- [ ] **S2.3 Slot engine** — one shared function: given a court and a date, return every slot with price, tag and status (free, pending, booked, blocked). Handles courts open past midnight. Unit tests for pricing bands and midnight.
- [ ] **S2.4 Turf settings (part of screen 10)** — advance rule, hold minutes, cancellation policy text, booking code.

**Prompts**

```
Build screen 2 (Setup wizard) from docs/requirements.md. Mobile-first. Plan first.
```

```
Build a slot engine in lib/slots: for a court and date, return all slots with price, tag and
status, using "Booking rules" and price_bands. Support courts open past midnight. Write unit
tests first. Plan first.
```

```
Build screen 8 (Courts and pricing settings) and the turf settings from screen 10 that the
"Working with existing booking software" section needs. Plan first.
```

**Done when:** a teammate who has never seen the app sets up a turf with 2 courts on their phone in under 10 minutes, and slot prices match the bands in the unit tests.

## Sprint 3: calendar, bookings, blocks, payments

Goal: the owner runs a full day of bookings from the phone. This is the heart of the product.

**Part A — calendar and booking**

- [ ] **S3.1 Calendar (screen 3)** — day view per court using the slot engine, colours by status and source, swipe between days, "Today" button, week view.
- [ ] **S3.2 Live updates** — Supabase Realtime on bookings; a booking added on one phone shows on another within 3 seconds.
- [ ] **S3.3 Add / edit booking (screen 4)** — bottom sheet from a free slot; customer auto-fill by phone; price from the slot engine; advance + mode; friendly error when the slot was just taken.

**Part B — detail, blocks, payments**

- [ ] **S3.4 Booking detail (screen 5)** — record balance, check-in, no-show, reschedule, cancel with reason, call / open WhatsApp chat.
- [ ] **S3.5 Block slots (screen 6)** — single or multiple slots, reason incl. "Playo / Hudle / other app".
- [ ] **S3.6 Payments** — payments table drives Unpaid / Advance paid / Fully paid; refunds recorded.
- [ ] **S3.7 Audit trail** — who changed what and when, shown in booking detail.
- [ ] **S3.8 Notify stub** — every place a WhatsApp message will go calls `lib/notify` (logs only for now).

**Prompts**

```
Build screen 3 (Calendar) from docs/requirements.md using lib/slots. Day view per court with
tabs, swipe days, week view, Realtime updates. Must fit a 360px screen. Plan first.
```

```
Build screen 4 (Add / edit booking) as a bottom sheet opened from a free slot. Handle the
database overlap error with a clear message. Call lib/notify stub on save. Plan first.
```

```
Build screens 5 (Booking detail) and 6 (Block slots), payments and the audit trail. Plan first.
```

**Done when:** two phones logged in as the same owner add, edit, block and cancel bookings for the same court at the same time with no double booking, and every change shows on both phones.

## Sprint 4: booking service, payments, booking link, WhatsApp AI agent

Goal: a player books and pays for a slot through a public booking link or the WhatsApp AI agent. The slot locks for 5 minutes, Razorpay confirms it automatically, and the owner never approves anything. Needs Razorpay test keys; Part B also needs the WhatsApp test number and an AI model provider.

**Part A — works without WhatsApp**

- [ ] **S4.1 Booking service** — availability function + `book_slot` wrapper in `lib/booking` (server only; wraps `private.book_slot` through a service-role-only wrapper or direct connection).
- [ ] **S4.2 Hold expiry** — pg_cron job (created in migration 20261112000001) + `book_slot` clean-up; verify on the remote that lapsed holds expire.
- [ ] **S4.3 Payments** — `lib/payments` Razorpay adapter (test mode), `/pay/[booking_id]` page with 5-minute countdown, webhook route with signature check, `confirm_online_payment`, automatic refund on `refund_needed`.
- [ ] **S4.4 Public booking link** — `/b/[booking_code]`: free slots and prices, player enters name + phone, `book_slot`, then the payment page.

**Part B — AI agent on WhatsApp (needs the test number and a model provider)**

- [ ] **S4.5 MCP server** — tools `check_availability` and `book_slot` only; wraps the booking service; returns the payment link.
- [ ] **S4.6 AI agent** — model provider, system prompt, confirm slot and price before booking; anything else is handed to the turf's phone number.
- [ ] **S4.7 WhatsApp webhook** — Next.js route; `conversations`, `messages`, `agent_settings` tables (migration). Turf and player phone come from the webhook, never from the AI.
- [ ] **S4.8 Message sending** — `lib/notify` adapter sends real messages through the WhatsApp provider.
- [ ] **S4.9 Per-turf links** — WhatsApp link, web booking link and downloadable QR code in settings.

**Prompts**

```
Build the booking service in lib/booking (availability + book_slot wrapper), verify hold expiry on
the remote, then the Razorpay adapter in lib/payments (test mode), the /pay/[booking_id] page and
the webhook route. Read the Booking rules in docs/requirements.md. Plan first.
```

```
Build the public booking link page /b/[booking_code] from docs/requirements.md. Plan first.
```

```
Build the MCP server (check_availability, book_slot) and the WhatsApp AI agent with its webhook,
conversations, messages and agent_settings tables. Provider: <name from the team>. Plan first.
```

**Done when:** a player books and pays through the booking link and through WhatsApp; an unpaid slot frees itself after 5 minutes; a late payment re-locks a free slot or is refunded; two players choosing the same slot → only one gets it.

## Sprint 5: notifications, reminders, daily summary

Goal: every message in the requirements goes out automatically and is logged. Needs the templates approved by Meta, so submit them at the start of the project.

**Tasks**

- [ ] **S5.1 message\_log table** (migration) and logging in `lib/notify`: template, phone, status, cost.
- [ ] **S5.2 Templates wired** — confirmed, rescheduled, cancelled / rejected / expired.
- [ ] **S5.3 Reminder job** — cron every 5 minutes; sends X hours before start; skips late bookings and cancelled ones.
- [ ] **S5.4 Daily summary job** — at each owner's chosen time.
- [ ] **S5.5 Delivery status webhook** — sent / delivered / failed; "Message failed — resend" in booking detail.

**Prompt**

```
Read "WhatsApp notifications" in docs/requirements.md. Add message_log, wire every template
through lib/notify, and add cron jobs for reminders and the daily summary. A failed message must
never block or undo a booking. Plan first.
```

**Done when:** a booking made for 2 hours from now gets a confirmation at once and a reminder on time; the owner gets the summary at the set time; the log shows delivered for each.

## Sprint 6: customers, reports, go-live prep

Goal: everything a pilot owner needs, on a production setup in the company accounts.

**Tasks**

- [ ] **S6.1 Customers (screen 7)** — list, search, history, no-show count.
- [ ] **S6.2 Reports (screen 9)** — today / week / month; totals checked against the bookings.
- [ ] **S6.3 Production setup** — company Supabase project on Pro (Mumbai), `supabase db push`, secrets, custom SMTP for login emails, live WhatsApp number, Vercel env variables, custom domain.
- [ ] **S6.4 Full test day** — run a fake turf for a day with 2 phones: owner and player. Check every "Done when" in the requirements.
- [ ] **S6.5 Owner guide** — one-page "how to use" with screenshots, plus the setup checklist our team follows when onboarding a turf.

**Prompt**

```
Build screens 7 (Customers), 9 (Reports) and 10 (Settings, remaining parts) from
docs/requirements.md.
Plan first.
```

**Done when:** the production app runs on the company accounts, the test day passes with zero double bookings, and the owner guide is ready.

## Pilot and blockers to clear early

Five outside dependencies can stall the build. Start all of them now; none of them need code.

**Blockers to start now**

| Blocker | Needed before | Who | Action |
| --- | --- | --- | --- |
| WhatsApp test number + API access | Sprint 4 Part B | WhatsApp team | Ask now; share the WhatsApp AI agent section of the requirements doc |
| Meta business verification + templates approved | Sprint 5 | WhatsApp team + admin | Submit company documents and the 6 templates |
| SMTP provider for login emails (Supabase's built-in email is rate-limited and its templates are locked) | Sprint 1 (dev: Gmail app password, set up 2026-11-10); production provider in Sprint 6 | Admin | Pick an SMTP provider; later also an SMS provider + DLT registration (India) if phone OTP is wanted |
| Company Supabase (Pro) + Vercel accounts | Sprint 6 (production) | Admin | Create under the DreamTusk accounts; add you as member |
| App name + domain + privacy policy page | Sprint 5 | Team | Needed for Meta verification and the PWA |

**Pilot plan**

- [ ] **PL.1** Pick 5 turfs from the cold calls: 1 small phone-only turf, 1 turf on Playo/Hudle, 1 pickleball court, 2 others.
- [ ] **PL.2** Onboard each turf in person: setup wizard, WhatsApp booking link + QR poster.
- [ ] **PL.3** Daily check of logs and the Supabase advisors; fix bugs the same day.
- [ ] **PL.4** Short call with each owner midway and at the end of the pilot.
- [ ] **PL.5** Measure against the pilot success criteria in the requirements doc.

**Pilot exit:** go / no-go decision for paid plans and Phase 2, based on the success criteria.

## Change log

| date | change | reason |
| --- | --- | --- |
| 2026-11-06 | Plan imported from Downloads as docs/dev-plan.md; pilot checklist items given ids PL.1–PL.5 | Every task needs an id |
| 2026-11-06 | Removed staff role from Phase 1 (S6.1 Staff task removed, S6.x renumbered; S1.1 prompt, S3 and S6 "Done when"/prompts, PL.2 reworded) | Keep Phase 1 simple |
| 2026-11-10 | S1.1 built: overlap rule uses a `court_occupancy` table (bookings and blocks are separate tables, one constraint cannot span both); `message_log`, `wa_sessions`, `calendar_feeds` left for later tasks | Postgres exclusion constraints work on one table only |
| 2026-11-10 | S1.4 login changed from phone OTP to email OTP; S6.4 and blocker table now need custom SMTP instead of an SMS provider; owners and members get an `email` column | Twilio/SMS provider not available yet; phone OTP stays a later option |
| 2026-11-10 | Custom SMTP needed for S1.4 testing, not only production (Supabase locks email templates and the code without it); dev project now uses Gmail SMTP | Default templates have no `{{ .Token }}` |
| 2026-11-12 | Sprint 6: super admin task removed, tasks renumbered (S6.3–S6.5) | No super admin in the app; our team manages owners in the Supabase dashboard |
| 2026-11-12 | S2.1 and S2.4: removed UPI ID / QR upload; S2.4 also removed approval mode | Players pay only through Razorpay; no approval mode |
| 2026-11-12 | Sprint 4 replaced with S4.1–S4.9 (booking service, hold expiry, Razorpay payments, public booking link, MCP server, AI agent, WhatsApp webhook, message sending, per-turf links); booking requests screen and bot engine removed; `wa_sessions` replaced by `conversations`, `messages`, `agent_settings` | 5-minute BookMyShow-style lock with automatic confirmation; WhatsApp becomes an AI agent behind an MCP server |
| 2026-11-12 | S1.5 nav no longer has a Requests tab; S5.2 no longer has a new-request alert | Booking requests screen removed |
