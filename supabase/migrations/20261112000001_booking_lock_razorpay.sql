-- Change set 01: no super admin, plans on owners, Razorpay-only payments,
-- BookMyShow-style slot lock (book_slot / confirm_online_payment / hold expiry cron).

-- 1. Super admin out ---------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['owners', 'members', 'turfs', 'courts', 'price_bands', 'customers',
                           'bookings', 'blocks', 'payments', 'court_occupancy', 'audit_log']
  loop
    execute format('drop policy if exists "admin reads all" on public.%I', t);
  end loop;
end $$;

drop function private.is_super_admin();
drop table public.super_admins; -- drops its "own row" policy too

-- 2. Plans (changed only in the Supabase dashboard / service role) ------------
alter table public.owners
  add column plan text not null default 'free' check (plan in ('free', 'starter', 'pro')),
  add column plan_started_at timestamptz,
  add column plan_renews_at timestamptz;

-- owners may update name and phone only; plan, plan dates, status, email are ours
revoke update on public.owners from authenticated;
grant update (name, phone) on public.owners to authenticated;

-- 3. Razorpay only -----------------------------------------------------------
alter table public.turfs drop column upi_id, drop column upi_qr_url;
-- 'online' = Razorpay; 'cash' / 'upi' = money the owner records by hand at the counter
alter type public.payment_mode add value if not exists 'online';

-- 4. Locking columns ---------------------------------------------------------
alter table public.turfs alter column hold_minutes set default 5;
update public.turfs set hold_minutes = 5;
alter table public.turfs drop column approval_mode;

alter table public.bookings add column payment_order_id text unique;
alter table public.payments
  add column gateway text,
  add column gateway_payment_id text unique;

-- 5. private.book_slot -------------------------------------------------------
-- Server code only (service role). Returns jsonb; a taken slot is a result, not an error.
-- Price below is a PLACEHOLDER (court base price, prorated by slot length); real pricing
-- (price bands) is decided later and will replace the marked line.
create function private.book_slot(
  p_turf_id uuid, p_court_id uuid, p_time_range tstzrange,
  p_customer_phone text, p_customer_name text, p_source public.booking_source
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_turf public.turfs;
  v_court public.courts;
  v_customer uuid;
  v_price int;
  v_advance int;
  v_status public.booking_status;
  v_hold timestamptz;
  v_id uuid;
begin
  if p_time_range is null or lower(p_time_range) is null or upper(p_time_range) is null
     or isempty(p_time_range) then
    return jsonb_build_object('error', 'invalid_range');
  end if;
  if coalesce(trim(p_customer_phone), '') = '' then
    return jsonb_build_object('error', 'phone_required');
  end if;

  select * into v_turf from public.turfs where id = p_turf_id;
  select * into v_court from public.courts
    where id = p_court_id and turf_id = p_turf_id and owner_id = v_turf.owner_id and active;
  if v_turf.id is null or v_court.id is null then
    return jsonb_build_object('error', 'court_not_found');
  end if;

  -- 1. release holds that ran out on this court
  update public.bookings set status = 'expired'
  where court_id = p_court_id and status = 'pending_payment' and hold_expires_at < now();

  -- 2. find or create the customer (per owner, by phone)
  insert into public.customers (owner_id, name, phone)
  values (v_turf.owner_id, coalesce(p_customer_name, ''), trim(p_customer_phone))
  on conflict (owner_id, phone) do update
    set name = case when public.customers.name = '' then excluded.name else public.customers.name end
  returning id into v_customer;

  -- PLACEHOLDER pricing (replace when pricing is decided)
  v_price := round(v_court.base_price * (extract(epoch from upper(p_time_range) - lower(p_time_range)) / 60.0)
                   / v_court.slot_minutes)::int;
  v_advance := case v_turf.advance_type
    when 'fixed' then least(v_turf.advance_value, v_price)
    when 'percent' then least(round(v_price * v_turf.advance_value / 100.0)::int, v_price)
    else 0 end;

  -- 3. no advance -> confirmed at once; otherwise lock the slot for hold_minutes
  if v_turf.advance_type = 'none' or v_advance = 0 then
    v_status := 'confirmed';
  else
    v_status := 'pending_payment';
    v_hold := now() + make_interval(mins => v_turf.hold_minutes);
  end if;

  begin
    insert into public.bookings (owner_id, court_id, customer_id, time_range, status, source, price, hold_expires_at)
    values (v_turf.owner_id, p_court_id, v_customer, p_time_range, v_status, p_source, v_price, v_hold)
    returning id into v_id;
  exception when sqlstate '23P01' then
    -- 4. overlap with a booking or block
    return jsonb_build_object('error', 'slot_taken');
  end;

  -- 5.
  return jsonb_build_object('booking_id', v_id, 'status', v_status, 'price', v_price,
                            'advance_due', v_advance, 'hold_expires_at', v_hold);
end $$;

-- 6. private.confirm_online_payment ------------------------------------------
-- Called by the Razorpay webhook (server code). Idempotent per gateway_payment_id.
-- Returns jsonb {result: confirmed | duplicate | refund_needed | not_found, booking_id}.
create function private.confirm_online_payment(
  p_order_id text, p_gateway_payment_id text, p_amount int
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_b public.bookings;
begin
  select * into v_b from public.bookings where payment_order_id = p_order_id for update;
  if v_b.id is null then
    return jsonb_build_object('result', 'not_found');
  end if;

  -- same webhook twice -> no-op
  if exists (select 1 from public.payments where gateway_payment_id = p_gateway_payment_id) then
    return jsonb_build_object('result', 'duplicate', 'booking_id', v_b.id);
  end if;

  if v_b.status = 'confirmed' then
    -- already confirmed by another payment for this order: this one must be refunded
    return jsonb_build_object('result', 'refund_needed', 'booking_id', v_b.id);
  end if;

  if v_b.status = 'pending_payment' and v_b.hold_expires_at < now() then
    update public.bookings set status = 'expired' where id = v_b.id; -- frees the slot, then try to re-lock
    v_b.status := 'expired';
  end if;

  if v_b.status not in ('pending_payment', 'expired') or p_amount <= 0 then
    return jsonb_build_object('result', 'refund_needed', 'booking_id', v_b.id);
  end if;

  begin
    -- from 'expired' this re-inserts the occupancy row: fails with 23P01 if someone else took the slot
    update public.bookings set status = 'confirmed', hold_expires_at = null where id = v_b.id;
  exception when sqlstate '23P01' then
    return jsonb_build_object('result', 'refund_needed', 'booking_id', v_b.id);
  end;

  insert into public.payments (owner_id, booking_id, amount, mode, type, gateway, gateway_payment_id)
  values (v_b.owner_id, v_b.id, p_amount, 'online', 'advance', 'razorpay', p_gateway_payment_id);

  return jsonb_build_object('result', 'confirmed', 'booking_id', v_b.id);
end $$;

-- 7. Hold expiry cron (every minute) -----------------------------------------
create function private.expire_holds() returns int
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  update public.bookings set status = 'expired'
  where status = 'pending_payment' and hold_expires_at < now();
  get diagnostics n = row_count;
  return n;
end $$;

create extension if not exists pg_cron;
select cron.schedule('expire-holds', '* * * * *', 'select private.expire_holds()');

-- 8. Permissions: server code (service role) only ----------------------------
revoke execute on function private.book_slot(uuid, uuid, tstzrange, text, text, public.booking_source)
  from public, anon, authenticated;
revoke execute on function private.confirm_online_payment(text, text, int) from public, anon, authenticated;
revoke execute on function private.expire_holds() from public, anon, authenticated;
grant usage on schema private to service_role;
grant execute on function private.book_slot(uuid, uuid, tstzrange, text, text, public.booking_source) to service_role;
grant execute on function private.confirm_online_payment(text, text, int) to service_role;
