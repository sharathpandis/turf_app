# Change set 03 — UI design (phone + desktop) and the sprint list

Designs are in `docs/design/` (read `docs/design/README.md` first; mockups in `docs/design/screens/`).
This prompt is used in TWO ways:
- First run: do PART 1 only, then stop.
- Every run after that: do PART 2 for the NEXT unticked UI task only, then stop.

Rules: plan first and wait for my OK. New migrations only. No Docker. Never run long-running servers
yourself (dev/preview) — ask me to test. Mobile-first, then the `lg` desktop layout. Use Tailwind + shadcn/ui
components; match the mockups' layout, spacing, colours and copy; real data from the database, not the
sample values in the mockups.

## PART 1 — update the plan and fix one schema gap (first run only)

1. New migration: add value `'booking_link'` to the `booking_source` enum (bookings made on the public
   booking link). Push it, regenerate types, build. Update `docs/DATABASE.md`.
2. Update `docs/dev-plan.md` (keep every existing tick; add Change log lines):
   - Add to Sprint 1:
     - **S1.8 Design system + responsive shell** — design tokens (colours, fonts, radius) in the Tailwind
       theme / shadcn variables; app shell: bottom nav below `lg`, left sidebar at `lg`+ (Calendar,
       Courts & prices, Turf settings; Customers appears with S6.1); turf switcher; restyle `/login`
       to mockup 01 (6-digit code). Done when: phone and desktop both match the mockups.
   - Sprint 2:
     - S2.1 Setup wizard → follow mockup 02; 4 steps: turf details → courts → prices → booking settings
       (advance, hold minutes, cancellation policy, booking code). No UPI step.
     - S2.2 Courts and prices → follow mockup 09 (desktop) and the same content single-column on phone;
       label the `whatsapp_bookable` switch "Bookable online" (WhatsApp + booking link).
     - S2.4 Turf settings → same fields as setup step 4.
   - Sprint 3:
     - S3.1 Calendar → mockup 03 on phone (one court, court chips, date strip); mockup 08 on desktop
       (all courts side by side). Held slots show a countdown from `hold_expires_at`. Remove "week view".
     - S3.3 Add booking → bottom sheet on phone (mockup 04), right side panel on desktop.
     - S3.4 Booking detail → full screen on phone (mockup 05), right side panel on desktop (mockup 08).
   - Sprint 4:
     - S4.3 Payment page → mockup 07.
     - S4.4 Booking link → mockup 06, including name + phone before "Hold slot and pay"; source
       `booking_link`.
   - "How we work": add "Each UI task: read docs/design/README.md and the task's mockup; test at phone
     width and at desktop width."
3. Add to `CLAUDE.md` under "How to work": "UI follows docs/design/. Mobile-first, desktop layout at `lg`."
4. `docs/PROGRESS.md`: decision with today's date (designs approved; desktop layout in Phase 1).
5. Stop. Show me the dev-plan changes and the migration result. Don't commit; I will.

## PART 2 — build the next UI task (every run after Part 1)

Order: S1.8 → S2.1 → S2.2 → S2.3 → S2.4 → S3.1 → S3.3 → S3.4 → S3.5 → (then the rest of the plan).
1. Find the first unticked task in that order in `docs/dev-plan.md`.
2. Read only: `docs/design/README.md`, that task's mockup(s), the task's section in
   `docs/requirements.md`, and the code you need.
3. Plan: components, route, data reads/writes (which tables / functions), and how the phone and desktop
   layouts differ. Wait for my OK.
4. Build it. Run lint and build. Then STOP and ask me to test on a phone-width and a desktop browser.
5. When I say it works: tick the task with today's date, update docs if anything changed, and give me
   a one-line commit message. Don't start the next task in the same session.
