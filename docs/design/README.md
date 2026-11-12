# Design handoff — Turf App

Source of truth for the UI. Each file in `screens/` is a static mockup (HTML with inline styles).
Read it for layout, spacing, colours and copy; build the real screen with our components
(Tailwind + shadcn/ui). Ignore the mockup wrapper tags (`<x-dc>`, `<helmet>`, the `<script>` at the end).
Example names, numbers and prices in the mockups are sample data — real values come from the database.

## Design tokens

| Token | Value | Use |
|---|---|---|
| brand | #0E6B43 | primary buttons, booked slots, active nav |
| brand-soft | #E3F1E9 | selected states, soft buttons |
| held / held-bg / held-text | #E9A23B / #FFF1D6 / #7A4A00 | slots held for payment (5-min lock) |
| danger / danger-bg | #B42318 / #FDECEA | cancel |
| ink | #13201A | text |
| muted | #5B6B63 | labels, secondary text |
| ground | #F6F7F4 | page background |
| line | #E2E6E1 | borders |
| blocked | stripes #ECEEEC / #E0E4E0, text #3F4A44 | blocked slots |

Fonts: Inter (text), Space Grotesk (headings, times, prices). Radius: 12px controls, 16px cards.
Touch targets at least 44px (main buttons 48–52px). Status is always shown as a word, not colour only.

## Responsive rule (one codebase)

- Phone (< 1024px, Tailwind below `lg`): bottom nav; one court at a time; add booking = bottom sheet;
  booking detail = full screen.
- Desktop (`lg` and up): left sidebar; calendar shows all courts side by side; add booking and booking
  detail open in a right side panel.
- Other screens on desktop: same content, centred, max width ~920px.

## Screens -> routes -> data

| # | Mockup | Route | Reads / writes |
|---|---|---|---|
| 00 | style-guide | — | tokens above |
| 01 | login | `/login` | Supabase Auth email OTP (6-digit code). Trigger creates `owners` + `members` on first confirmed login |
| 02 | setup-courts | `/setup` (owner with no turf is sent here) | 4 steps: turf details (`turfs.name, address, maps_link`) → courts (`courts.name, sport, slot_minutes, open_time, close_time, base_price`) → prices (`price_bands`) → booking settings (`turfs.advance_type, advance_value, hold_minutes, cancellation_policy, booking_code`) |
| 03 / 08 | calendar mobile / desktop | `/calendar?date=` | `courts`, slot engine (`lib/slots`: base price + `price_bands`), `bookings` (status, source, time_range, hold_expires_at, customer), `blocks`, `payments` (to show "due" / "paid") |
| 04 | add-booking | sheet / panel on `/calendar` | find customer by phone (`customers`, unique per owner) → insert `bookings` as `confirmed` (owner booking, no hold) → optional `payments` (type advance, mode cash/upi) |
| 05 | booking-detail | `/bookings/[id]` on phone, side panel on desktop | `bookings`, `customers`, `payments`, `audit_log`; actions: check in, no-show, cancel (cancel_reason), reschedule (time_range), record balance (`payments` type balance) |
| 09 | desktop-courts | `/courts` | `courts`, `price_bands`; "Bookable online" = `price_bands.whatsapp_bookable` (applies to WhatsApp AND the booking link) |
| — | turf settings | `/settings` | `turfs` (same fields as setup step 4) |
| 06 | booking-link | `/b/[booking_code]` (public) | turf by `booking_code`; slot engine (online-bookable slots only); name + phone → `private.book_slot` (server only) with source `booking_link` |
| 07 | payment | `/pay/[booking_id]` (public) | countdown from `bookings.hold_expires_at`; advance from `turfs.advance_type/value`; Razorpay order (`bookings.payment_order_id`); webhook → `private.confirm_online_payment` |

Slot colours map to booking status: free = no booking/block · held = `pending_payment` ·
booked = `confirmed` / `checked_in` / `completed` · blocked = `blocks` row · closed = outside court hours.
