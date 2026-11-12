-- Change set 01: proves the slot lock + online payment functions. One transaction, always rolls back
-- (the final RAISE shows the results).
-- Run: supabase db query --remote --yes -f supabase/tests/booking_lock.sql
-- Note: a single script cannot run two sessions at once, so "simultaneous" bookings are two calls on
-- one slot; the exclusion constraint is what makes the second one lose, which is the same guarantee.
do $$
declare
  r text := '';
  v_owner uuid; v_turf uuid := gen_random_uuid(); v_court uuid := gen_random_uuid();
  v_user uuid := gen_random_uuid();
  t timestamptz := ((current_date + 30) + time '18:00') at time zone 'Asia/Kolkata';
  s1 tstzrange; s2 tstzrange; s3 tstzrange; s4 tstzrange; s5 tstzrange;
  a jsonb; b jsonb; c jsonb; v_id uuid; n int;
begin
  insert into auth.users (instance_id,id,aud,role,phone,phone_confirmed_at,created_at,updated_at)
  values ('00000000-0000-0000-0000-000000000000', v_user,'authenticated','authenticated','910000000098',now(),now(),now());
  select owner_id into v_owner from public.members where user_id = v_user;
  insert into public.turfs(id,owner_id,name,advance_type,advance_value) values (v_turf,v_owner,'lock test','fixed',300);
  insert into public.courts(id,owner_id,turf_id,name,base_price) values (v_court,v_owner,v_turf,'C1',800);
  s1 := tstzrange(t, t + interval '1 hour');
  s2 := tstzrange(t + interval '2 hours', t + interval '3 hours');
  s3 := tstzrange(t + interval '4 hours', t + interval '5 hours');
  s4 := tstzrange(t + interval '6 hours', t + interval '7 hours');
  s5 := tstzrange(t + interval '8 hours', t + interval '9 hours');

  -- 1 two bookings on one slot: one wins
  a := private.book_slot(v_turf, v_court, s1, '919000000001', 'A', 'whatsapp');
  b := private.book_slot(v_turf, v_court, s1, '919000000002', 'B', 'whatsapp');
  r := r || case when a->>'status' = 'pending_payment' and b->>'error' = 'slot_taken'
    then E'PASS  1 second booking on the same slot returns slot_taken\n'
    else E'FAIL  1 got '||a::text||' / '||b::text||E'\n' end;
  r := r || case when (a->>'hold_expires_at')::timestamptz between now() + interval '299 seconds' and now() + interval '301 seconds'
                  and (a->>'advance_due')::int = 300
    then E'PASS  1b hold is 5 minutes, advance due 300\n' else E'FAIL  1b '||a::text||E'\n' end;

  -- 2 expired hold is re-bookable
  update public.bookings set hold_expires_at = now() - interval '1 minute' where id = (a->>'booking_id')::uuid;
  c := private.book_slot(v_turf, v_court, s1, '919000000002', 'B', 'whatsapp');
  r := r || case when c->>'status' = 'pending_payment'
        and (select status from public.bookings where id = (a->>'booking_id')::uuid) = 'expired'
    then E'PASS  2 expired hold re-bookable, old booking marked expired\n' else E'FAIL  2 '||c::text||E'\n' end;

  -- 3 confirm within the hold
  a := private.book_slot(v_turf, v_court, s2, '919000000003', 'C', 'whatsapp');
  update public.bookings set payment_order_id = 'order_3' where id = (a->>'booking_id')::uuid;
  b := private.confirm_online_payment('order_3', 'pay_3', 300);
  r := r || case when b->>'result' = 'confirmed'
        and (select status from public.bookings where id = (a->>'booking_id')::uuid) = 'confirmed'
        and (select hold_expires_at from public.bookings where id = (a->>'booking_id')::uuid) is null
        and (select count(*) from public.payments where gateway_payment_id = 'pay_3' and mode = 'online' and type = 'advance') = 1
    then E'PASS  3 payment within hold -> confirmed, hold cleared, payment recorded\n' else E'FAIL  3 '||b::text||E'\n' end;

  -- 6 duplicate webhook
  c := private.confirm_online_payment('order_3', 'pay_3', 300);
  select count(*) into n from public.payments where gateway_payment_id = 'pay_3';
  r := r || case when c->>'result' = 'duplicate' and n = 1
    then E'PASS  6 duplicate webhook is a no-op (one payment row)\n' else E'FAIL  6 '||c::text||' rows='||n||E'\n' end;

  -- 4 late payment, slot still free
  a := private.book_slot(v_turf, v_court, s3, '919000000004', 'D', 'whatsapp');
  update public.bookings set payment_order_id = 'order_4', hold_expires_at = now() - interval '1 minute'
    where id = (a->>'booking_id')::uuid;
  perform private.expire_holds();
  b := private.confirm_online_payment('order_4', 'pay_4', 300);
  r := r || case when b->>'result' = 'confirmed'
        and (select status from public.bookings where id = (a->>'booking_id')::uuid) = 'confirmed'
    then E'PASS  4 late payment, slot free -> re-locked and confirmed\n' else E'FAIL  4 '||b::text||E'\n' end;

  -- 5 late payment, slot taken by someone else
  a := private.book_slot(v_turf, v_court, s4, '919000000005', 'E', 'whatsapp');
  update public.bookings set payment_order_id = 'order_5', hold_expires_at = now() - interval '1 minute'
    where id = (a->>'booking_id')::uuid;
  perform private.expire_holds();
  c := private.book_slot(v_turf, v_court, s4, '919000000006', 'F', 'whatsapp');
  b := private.confirm_online_payment('order_5', 'pay_5', 300);
  r := r || case when c->>'status' = 'pending_payment' and b->>'result' = 'refund_needed'
        and (select status from public.bookings where id = (a->>'booking_id')::uuid) = 'expired'
        and not exists (select 1 from public.payments where gateway_payment_id = 'pay_5')
    then E'PASS  5 late payment, slot taken -> refund_needed, no payment row, booking stays expired\n'
    else E'FAIL  5 '||b::text||E'\n' end;

  -- 7 cron job expires holds; turf without advance confirms at once
  a := private.book_slot(v_turf, v_court, s5, '919000000007', 'G', 'whatsapp');
  update public.bookings set hold_expires_at = now() - interval '1 second' where id = (a->>'booking_id')::uuid;
  n := private.expire_holds();
  r := r || case when n = 1 and (select status from public.bookings where id = (a->>'booking_id')::uuid) = 'expired'
    then E'PASS  7 expire_holds expires a lapsed hold\n' else E'FAIL  7 n='||n||E'\n' end;
  r := r || case when exists (select 1 from cron.job where jobname = 'expire-holds' and schedule = '* * * * *')
    then E'PASS  7b pg_cron job expire-holds scheduled every minute\n' else E'FAIL  7b cron job missing\n' end;
  update public.turfs set advance_type = 'none' where id = v_turf;
  a := private.book_slot(v_turf, v_court, tstzrange(t + interval '10 hours', t + interval '11 hours'), '919000000008', 'H', 'whatsapp');
  r := r || case when a->>'status' = 'confirmed' and a->>'hold_expires_at' is null
    then E'PASS  8 no-advance turf -> confirmed immediately, no hold\n' else E'FAIL  8 '||a::text||E'\n' end;

  -- 9 permissions
  r := r || case when not has_function_privilege('anon', 'private.book_slot(uuid,uuid,tstzrange,text,text,public.booking_source)', 'execute')
        and not has_function_privilege('authenticated', 'private.book_slot(uuid,uuid,tstzrange,text,text,public.booking_source)', 'execute')
        and not has_function_privilege('authenticated', 'private.confirm_online_payment(text,text,int)', 'execute')
        and has_function_privilege('service_role', 'private.book_slot(uuid,uuid,tstzrange,text,text,public.booking_source)', 'execute')
        and has_function_privilege('service_role', 'private.confirm_online_payment(text,text,int)', 'execute')
    then E'PASS  9 functions callable by service_role only\n' else E'FAIL  9 function privileges wrong\n' end;
  r := r || case when not has_column_privilege('authenticated', 'public.owners', 'plan', 'update')
        and not has_column_privilege('authenticated', 'public.owners', 'status', 'update')
        and not has_column_privilege('authenticated', 'public.owners', 'plan_renews_at', 'update')
        and has_column_privilege('authenticated', 'public.owners', 'name', 'update')
    then E'PASS 10 owners cannot change plan, plan dates or status\n' else E'FAIL 10 owners column grants wrong\n' end;
  r := r || case when to_regclass('public.super_admins') is null and to_regprocedure('private.is_super_admin()') is null
        and not exists (select 1 from pg_policies where policyname = 'admin reads all')
    then E'PASS 11 super admin table, function and policies are gone\n' else E'FAIL 11 super admin leftovers\n' end;

  raise exception E'BOOKING LOCK RESULTS (rolled back, nothing saved):\n%', r;
end $$;
