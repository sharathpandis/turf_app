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
- [ ] **S1.3 Supabase client setup** — browser + server clients, middleware that refreshes the session and protects owner pages.
- [ ] **S1.4 Login (screen 1)** — phone OTP with a Supabase test number; first login creates owner + member rows.
- [ ] **S1.5 App shell** — bottom nav (Calendar, Requests, Customers, More), header with turf switcher, PWA manifest + icons, "Add to Home Screen" works.
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
docs/requirements.md. Phone OTP with test numbers; bottom nav; PWA manifest and icons.
Mobile-first at 360px. Plan first.
```

**Done when:** you log in on your phone with the test number, the app opens from the home-screen icon, and the overlap tests fail as they should.

## Sprint 2: setup wizard, courts and pricing

Goal: a new owner sets up a real turf in under 10 minutes, and the app knows every slot and its price.

**Tasks**

- [ ] **S2.1 Setup wizard (screen 2)** — turf details → courts → hours → slot length → base price → UPI ID / QR upload (Storage bucket via migration).
- [ ] **S2.2 Courts and pricing settings (screen 8)** — edit courts and hours, peak/off-peak bands, slot tags, "bookable on WhatsApp" per band, close a court for dates.
- [ ] **S2.3 Slot engine** — one shared function: given a court and a date, return every slot with price, tag and status (free, pending, booked, blocked). Handles courts open past midnight. Unit tests for pricing bands and midnight.
- [ ] **S2.4 Turf settings (part of screen 10)** — advance rule, hold minutes, approval mode, cancellation policy text, booking code.

**Prompts**

```
Build screen 2 (Setup wizard) from docs/requirements.md. QR image goes to a Supabase Storage
bucket created by migration. Mobile-first. Plan first.
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

## Sprint 4: booking requests and WhatsApp bot

Goal: a player books a slot by WhatsApp and the owner confirms it in 2 taps. If the WhatsApp test number isn't ready when this sprint starts, build the owner side first and swap the order with Sprint 6.

**Part A — works without WhatsApp**

- [ ] **S4.1 Booking requests (screen 13)** — Pending payment list, Confirm / Confirm without advance / Reject, payment screenshot view, hold timer, badge on the nav.
- [ ] **S4.2 Hold expiry job** — Supabase cron every minute sets unconfirmed holds to Expired (migration).
- [ ] **S4.3 Bot engine** — a pure function: (session state + incoming message) → (new state + reply). Menu, book flow, my bookings, cancel, talk to turf. Unit-tested with fake messages; no WhatsApp needed.
- [ ] **S4.4 Bot rules** — only slots marked "bookable on WhatsApp"; approval mode; turf chosen by booking code.

**Part B — connect WhatsApp (needs the test number)**

- [ ] **S4.5 wa\_sessions table** (migration).
- [ ] **S4.6 Webhook Edge Function** — verify Meta's signature, read the message, run the bot engine, reply with buttons/lists; secrets via `supabase secrets set`.
- [ ] **S4.7 Message sender** — `lib/notify` sends real messages through one provider adapter.
- [ ] **S4.8 Booking link + QR** — per-turf wa.me link and downloadable QR in settings.

**Prompts**

```
Build screen 13 (Booking requests) and a cron job that expires holds, from docs/requirements.md.
Plan first.
```

```
Read screen 12 and "Working with existing booking software". Build the bot engine in lib/bot as a
pure function (state + message -> state + reply), with unit tests for every path. No WhatsApp
calls yet. Plan first.
```

```
Connect the bot engine to WhatsApp: wa_sessions migration, a Supabase Edge Function webhook with
signature check, and a provider adapter in lib/notify. Provider: <name from the team>. Plan first.
```

**Done when:** on the test number, a player books in under 60 seconds with taps only, the owner confirms from the requests screen, and two phones picking the same slot → only one gets it.

## Sprint 5: notifications, reminders, daily summary

Goal: every message in the requirements goes out automatically and is logged. Needs the templates approved by Meta, so submit them at the start of the project.

**Tasks**

- [ ] **S5.1 message\_log table** (migration) and logging in `lib/notify`: template, phone, status, cost.
- [ ] **S5.2 Templates wired** — confirmed, rescheduled, cancelled / rejected / expired, new request alert (with Confirm / Reject buttons that work from WhatsApp).
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

## Sprint 6: customers, reports, admin, go-live prep

Goal: everything a pilot owner needs, on a production setup in the company accounts.

**Tasks**

- [ ] **S6.1 Customers (screen 7)** — list, search, history, no-show count.
- [ ] **S6.2 Reports (screen 9)** — today / week / month; totals checked against the bookings.
- [ ] **S6.3 Super admin (screen 11)** — owners, turfs, activity, activate / deactivate.
- [ ] **S6.4 Production setup** — company Supabase project on Pro (Mumbai), `supabase db push`, secrets, real SMS provider for OTP, live WhatsApp number, Vercel env variables, custom domain.
- [ ] **S6.5 Full test day** — run a fake turf for a day with 2 phones: owner and player. Check every "Done when" in the requirements.
- [ ] **S6.6 Owner guide** — one-page "how to use" with screenshots, plus the setup checklist our team follows when onboarding a turf.

**Prompt**

```
Build screens 7 (Customers), 9 (Reports), 10 (Settings, remaining parts) and 11 (Super
admin) from docs/requirements.md.
Plan first.
```

**Done when:** the production app runs on the company accounts, the test day passes with zero double bookings, and the owner guide is ready.

## Pilot and blockers to clear early

Five outside dependencies can stall the build. Start all of them now; none of them need code.

**Blockers to start now**

| Blocker | Needed before | Who | Action |
| --- | --- | --- | --- |
| WhatsApp test number + API access | Sprint 4 Part B | WhatsApp team | Ask now; share Part A of the requirements doc |
| Meta business verification + templates approved | Sprint 5 | WhatsApp team + admin | Submit company documents and the 6 templates |
| SMS provider for OTP + DLT registration (India) | Sprint 6 (production) | Admin | Pick a provider Supabase supports; start DLT |
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
