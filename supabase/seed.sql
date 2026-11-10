-- Local/dev seed: 1 owner (via first-login trigger), 1 turf, 2 courts, price bands,
-- 5 bookings, 1 block. Dates are relative to today so the calendar always has data.

insert into auth.users (
  instance_id, id, aud, role, phone, phone_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', '919999900001', now(),
  '{"provider":"phone","providers":["phone"]}', '{}', now(), now()
);

-- the trigger created the owner + member; name the owner
update public.owners set name = 'Green Arena Sports'
where id = (select owner_id from public.members where user_id = '11111111-1111-1111-1111-111111111111');

insert into public.turfs (id, owner_id, name, booking_code, address, upi_id, advance_type, advance_value,
                          cancellation_policy)
select '22222222-2222-2222-2222-222222222201', owner_id, 'Green Arena', 'GREENARENA',
       'Anna Nagar, Chennai', 'greenarena@upi', 'fixed', 300,
       'Full advance refund if cancelled 6+ hours before.'
from public.members where user_id = '11111111-1111-1111-1111-111111111111';

insert into public.courts (id, owner_id, turf_id, name, sport, slot_minutes, open_time, close_time, base_price)
select c.id, t.owner_id, t.id, c.name, c.sport, 60, c.open_time, c.close_time, c.base_price
from public.turfs t,
  (values
    ('33333333-3333-3333-3333-333333333301'::uuid, 'Football Turf 1', 'football', time '06:00', time '02:00', 800),
    ('33333333-3333-3333-3333-333333333302'::uuid, 'Pickleball Court', 'pickleball', time '06:00', time '23:00', 500)
  ) as c(id, name, sport, open_time, close_time, base_price)
where t.id = '22222222-2222-2222-2222-222222222201';

insert into public.price_bands (owner_id, court_id, days_of_week, start_time, end_time, price, tag, whatsapp_bookable)
select owner_id, id, b.days, b.s, b.e, b.price, b.tag, b.wa
from public.courts,
  (values
    ('{1,2,3,4,5,6,7}'::smallint[], time '18:00', time '22:00', 1200, 'peak', true),
    ('{6,7}'::smallint[], time '06:00', time '10:00', 1000, 'weekend morning', true),
    ('{1,2,3,4,5,6,7}'::smallint[], time '22:00', time '02:00', 900, 'night', false)
  ) as b(days, s, e, price, tag, wa)
where name = 'Football Turf 1';

insert into public.customers (id, owner_id, name, phone)
select c.id, t.owner_id, c.name, c.phone
from public.turfs t,
  (values
    ('44444444-4444-4444-4444-444444444401'::uuid, 'Arun Kumar', '919876500001'),
    ('44444444-4444-4444-4444-444444444402'::uuid, 'Priya S', '919876500002'),
    ('44444444-4444-4444-4444-444444444403'::uuid, 'Team Thunder', '919876500003')
  ) as c(id, name, phone)
where t.id = '22222222-2222-2222-2222-222222222201';

-- helper: IST wall-clock time on a day offset from today -> timestamptz
create function pg_temp.ist(day_offset int, t time) returns timestamptz
language sql as $$ select ((current_date + day_offset) + t) at time zone 'Asia/Kolkata' $$;

insert into public.bookings (id, owner_id, court_id, customer_id, time_range, status, source, price, created_by)
select b.id, t.owner_id, b.court_id, b.customer_id, tstzrange(b.s, b.e), b.status::public.booking_status,
       b.source::public.booking_source, b.price, '11111111-1111-1111-1111-111111111111'
from public.turfs t,
  (values
    ('55555555-5555-5555-5555-555555555501'::uuid, '33333333-3333-3333-3333-333333333301'::uuid, '44444444-4444-4444-4444-444444444401'::uuid,
       pg_temp.ist(0, '18:00'), pg_temp.ist(0, '19:00'), 'confirmed', 'phone', 1200),
    ('55555555-5555-5555-5555-555555555502'::uuid, '33333333-3333-3333-3333-333333333301'::uuid, '44444444-4444-4444-4444-444444444402'::uuid,
       pg_temp.ist(0, '19:00'), pg_temp.ist(0, '21:00'), 'confirmed', 'walk_in', 2400),
    ('55555555-5555-5555-5555-555555555503'::uuid, '33333333-3333-3333-3333-333333333302'::uuid, '44444444-4444-4444-4444-444444444403'::uuid,
       pg_temp.ist(1, '07:00'), pg_temp.ist(1, '08:00'), 'pending_payment', 'whatsapp', 500),
    ('55555555-5555-5555-5555-555555555504'::uuid, '33333333-3333-3333-3333-333333333301'::uuid, '44444444-4444-4444-4444-444444444401'::uuid,
       pg_temp.ist(2, '20:00'), pg_temp.ist(2, '21:00'), 'confirmed', 'other_app', 1200),
    ('55555555-5555-5555-5555-555555555505'::uuid, '33333333-3333-3333-3333-333333333302'::uuid, '44444444-4444-4444-4444-444444444402'::uuid,
       pg_temp.ist(-1, '18:00'), pg_temp.ist(-1, '19:00'), 'completed', 'phone', 500)
  ) as b(id, court_id, customer_id, s, e, status, source, price)
where t.id = '22222222-2222-2222-2222-222222222201';

insert into public.payments (owner_id, booking_id, amount, mode, type, recorded_by)
select owner_id, id, 300, 'upi', 'advance', '11111111-1111-1111-1111-111111111111'
from public.bookings where id in ('55555555-5555-5555-5555-555555555501', '55555555-5555-5555-5555-555555555504');
insert into public.payments (owner_id, booking_id, amount, mode, type, recorded_by)
select owner_id, id, 500, 'cash', 'balance', '11111111-1111-1111-1111-111111111111'
from public.bookings where id = '55555555-5555-5555-5555-555555555505';

insert into public.blocks (owner_id, court_id, time_range, reason, created_by)
select owner_id, '33333333-3333-3333-3333-333333333302', tstzrange(pg_temp.ist(1, '20:00'), pg_temp.ist(1, '21:00')),
       'Playo booking', '11111111-1111-1111-1111-111111111111'
from public.turfs where id = '22222222-2222-2222-2222-222222222201';
