-- S1.2: proves the overlap rule. Runs in one transaction and always rolls back (the final RAISE shows the results).
-- Run: supabase db query --remote --yes -f supabase/tests/overlap_rule.sql   (use without --remote for local)
do $$
declare
  r text := '';
  v_owner uuid; v_turf uuid := gen_random_uuid(); v_c1 uuid := gen_random_uuid(); v_c2 uuid := gen_random_uuid();
  v_user uuid := gen_random_uuid(); v_a uuid; v_b uuid;
  d date := current_date + 30;
  t timestamptz := ((current_date + 30) + time '18:00') at time zone 'Asia/Kolkata';
begin
  insert into auth.users (instance_id,id,aud,role,phone,phone_confirmed_at,created_at,updated_at)
  values ('00000000-0000-0000-0000-000000000000', v_user,'authenticated','authenticated','910000000099',now(),now(),now());
  select owner_id into v_owner from public.members where user_id = v_user;
  insert into public.turfs(id,owner_id,name) values (v_turf,v_owner,'S1.2 test');
  insert into public.courts(id,owner_id,turf_id,name) values (v_c1,v_owner,v_turf,'C1'),(v_c2,v_owner,v_turf,'C2');
  insert into public.bookings(owner_id,court_id,time_range,status) values (v_owner,v_c1,tstzrange(t,t+interval '1 hour'),'confirmed') returning id into v_a;
  insert into public.blocks(owner_id,court_id,time_range,reason) values (v_owner,v_c1,tstzrange(t+interval '2 hours',t+interval '3 hours'),'Playo') returning id into v_b;
  r := r || E'setup ok (owner, turf, 2 courts, booking 18-19, block 20-21)\n';

  -- must FAIL (23P01)
  begin insert into public.bookings(owner_id,court_id,time_range,status) values (v_owner,v_c1,tstzrange(t+interval '30 min',t+interval '90 min'),'confirmed'); r := r || E'FAIL  1 partial overlap accepted\n';
  exception when sqlstate '23P01' then r := r || E'PASS  1 partial overlap with a booking rejected\n'; end;
  begin insert into public.bookings(owner_id,court_id,time_range,status) values (v_owner,v_c1,tstzrange(t,t+interval '1 hour'),'confirmed'); r := r || E'FAIL  2 identical range accepted\n';
  exception when sqlstate '23P01' then r := r || E'PASS  2 identical range rejected\n'; end;
  begin insert into public.bookings(owner_id,court_id,time_range,status) values (v_owner,v_c1,tstzrange(t+interval '2 hours',t+interval '3 hours'),'confirmed'); r := r || E'FAIL  3 booking over block accepted\n';
  exception when sqlstate '23P01' then r := r || E'PASS  3 booking over a block rejected\n'; end;
  begin insert into public.blocks(owner_id,court_id,time_range) values (v_owner,v_c1,tstzrange(t,t+interval '1 hour')); r := r || E'FAIL  4 block over booking accepted\n';
  exception when sqlstate '23P01' then r := r || E'PASS  4 block over a booking rejected\n'; end;
  begin insert into public.bookings(owner_id,court_id,time_range,status) values (v_owner,v_c1,tstzrange(t+interval '15 min',t+interval '45 min'),'pending_payment'); r := r || E'FAIL  5 pending booking over booking accepted\n';
  exception when sqlstate '23P01' then r := r || E'PASS  5 pending-payment booking over a booking rejected\n'; end;
  begin update public.bookings set time_range = tstzrange(t+interval '2 hours',t+interval '3 hours') where id = v_a; r := r || E'FAIL  6 moving booking into block accepted\n';
  exception when sqlstate '23P01' then r := r || E'PASS  6 rescheduling a booking into a block rejected\n'; end;

  -- must SUCCEED
  begin insert into public.bookings(owner_id,court_id,time_range,status) values (v_owner,v_c1,tstzrange(t+interval '1 hour',t+interval '2 hours'),'confirmed'); r := r || E'PASS  7 back-to-back slot (19-20) accepted\n';
  exception when others then r := r || E'FAIL  7 back-to-back slot rejected: '||sqlerrm||E'\n'; end;
  begin insert into public.bookings(owner_id,court_id,time_range,status) values (v_owner,v_c2,tstzrange(t,t+interval '1 hour'),'confirmed'); r := r || E'PASS  8 same time on another court accepted\n';
  exception when others then r := r || E'FAIL  8 other court rejected: '||sqlerrm||E'\n'; end;
  begin insert into public.bookings(owner_id,court_id,time_range,status) values (v_owner,v_c1,tstzrange(t,t+interval '1 hour'),'cancelled'); r := r || E'PASS  9 cancelled booking does not occupy the slot\n';
  exception when others then r := r || E'FAIL  9 cancelled booking rejected: '||sqlerrm||E'\n'; end;
  begin
    update public.bookings set status='cancelled' where id = v_a;
    insert into public.bookings(owner_id,court_id,time_range,status) values (v_owner,v_c1,tstzrange(t,t+interval '1 hour'),'confirmed');
    r := r || E'PASS 10 slot free again after cancelling, rebook accepted\n';
  exception when others then r := r || E'FAIL 10 rebook after cancel rejected: '||sqlerrm||E'\n'; end;

  raise exception E'S1.2 RESULTS (rolled back, nothing saved):\n%', r;
end $$;
