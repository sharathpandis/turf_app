-- Row Level Security on every table. A user reaches only the data of active owner
-- accounts they belong to (via members). Super admins can read everything.

create function private.user_owner_ids() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select m.owner_id
  from public.members m
  join public.owners o on o.id = m.owner_id
  where m.user_id = (select auth.uid()) and o.status = 'active'
$$;

create function private.is_super_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.super_admins where user_id = (select auth.uid()))
$$;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
revoke execute on all functions in schema private from public, anon;
grant execute on function private.user_owner_ids(), private.is_super_admin() to authenticated;

-- anon never touches these tables
revoke all on all tables in schema public from anon;

alter table public.owners enable row level security;
alter table public.members enable row level security;
alter table public.super_admins enable row level security;
alter table public.turfs enable row level security;
alter table public.courts enable row level security;
alter table public.price_bands enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.blocks enable row level security;
alter table public.payments enable row level security;
alter table public.court_occupancy enable row level security;
alter table public.audit_log enable row level security;

-- owners: read own; update name/phone only. Created by the first-login trigger.
-- Status changes (activate/deactivate) are done by super admin via server code.
revoke insert, update, delete on public.owners from authenticated;
grant update (name, phone) on public.owners to authenticated;
create policy "owner reads own" on public.owners for select to authenticated
  using (id in (select private.user_owner_ids()));
create policy "owner updates own" on public.owners for update to authenticated
  using (id in (select private.user_owner_ids()))
  with check (id in (select private.user_owner_ids()));
create policy "admin reads all" on public.owners for select to authenticated
  using (private.is_super_admin());

-- members: read only (rows are created by the trigger; staff may come later)
revoke insert, update, delete on public.members from authenticated;
create policy "owner reads members" on public.members for select to authenticated
  using (owner_id in (select private.user_owner_ids()));
create policy "admin reads all" on public.members for select to authenticated
  using (private.is_super_admin());

create policy "own row" on public.super_admins for select to authenticated
  using (user_id = (select auth.uid()));

-- owner-scoped tables with full owner access
do $$
declare t text;
begin
  foreach t in array array['turfs', 'courts', 'price_bands', 'customers', 'bookings', 'blocks', 'payments']
  loop
    execute format(
      'create policy "owner full access" on public.%I for all to authenticated
         using (owner_id in (select private.user_owner_ids()))
         with check (owner_id in (select private.user_owner_ids()))', t);
    execute format(
      'create policy "admin reads all" on public.%I for select to authenticated
         using (private.is_super_admin())', t);
  end loop;
  -- system-written tables: owners and admins can read, nobody writes directly
  foreach t in array array['court_occupancy', 'audit_log']
  loop
    execute format('revoke insert, update, delete on public.%I from authenticated', t);
    execute format(
      'create policy "owner reads" on public.%I for select to authenticated
         using (owner_id in (select private.user_owner_ids()))', t);
    execute format(
      'create policy "admin reads all" on public.%I for select to authenticated
         using (private.is_super_admin())', t);
  end loop;
end $$;
