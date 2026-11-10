-- The rule that must never break: two active bookings or blocks cannot overlap
-- on the same court. A constraint cannot span two tables, so active bookings and
-- all blocks each keep one row in court_occupancy, and the exclusion constraint
-- lives there. Triggers keep it in sync; a clash raises error 23P01.

create table public.court_occupancy (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  court_id uuid not null references public.courts (id) on delete cascade,
  time_range tstzrange not null,
  booking_id uuid unique references public.bookings (id) on delete cascade,
  block_id uuid unique references public.blocks (id) on delete cascade,
  check (num_nonnulls(booking_id, block_id) = 1),
  constraint court_occupancy_no_overlap
    exclude using gist (court_id with =, time_range with &&)
);
create index court_occupancy_owner_id_idx on public.court_occupancy (owner_id);

create function private.sync_booking_occupancy() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status in ('pending_payment', 'confirmed', 'checked_in', 'completed') then
    insert into public.court_occupancy (owner_id, court_id, time_range, booking_id)
    values (new.owner_id, new.court_id, new.time_range, new.id)
    on conflict (booking_id) do update
      set court_id = excluded.court_id, time_range = excluded.time_range;
  else
    delete from public.court_occupancy where booking_id = new.id;
  end if;
  return new;
end $$;

create function private.sync_block_occupancy() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.court_occupancy (owner_id, court_id, time_range, block_id)
  values (new.owner_id, new.court_id, new.time_range, new.id)
  on conflict (block_id) do update
    set court_id = excluded.court_id, time_range = excluded.time_range;
  return new;
end $$;

create trigger bookings_sync_occupancy
  after insert or update of court_id, time_range, status on public.bookings
  for each row execute function private.sync_booking_occupancy();

create trigger blocks_sync_occupancy
  after insert or update of court_id, time_range on public.blocks
  for each row execute function private.sync_block_occupancy();

create function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger bookings_touch_updated_at
  before update on public.bookings
  for each row execute function private.touch_updated_at();
