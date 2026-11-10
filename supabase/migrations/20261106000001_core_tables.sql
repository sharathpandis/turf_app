-- S1.1 core tables. Money = integer rupees; times = timestamptz (UTC).
-- Every table except owners carries owner_id; composite foreign keys keep it
-- consistent with the parent row, so RLS can rely on it.

create extension if not exists btree_gist with schema extensions;
create schema if not exists private;

create type public.owner_status as enum ('active', 'inactive');
create type public.booking_status as enum (
  'pending_payment', 'confirmed', 'checked_in', 'completed',
  'cancelled', 'rejected', 'expired', 'no_show'
);
create type public.booking_source as enum ('phone', 'walk_in', 'whatsapp', 'other_app');
create type public.payment_mode as enum ('cash', 'upi');
create type public.payment_type as enum ('advance', 'balance', 'refund');

create table public.owners (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  phone text not null default '',
  status public.owner_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Phase 1: owner only. To add staff later, replace this check in a new migration.
  role text not null default 'owner' check (role in ('owner')),
  phone text,
  unique (owner_id, user_id)
);
create index members_user_id_idx on public.members (user_id);

create table public.super_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table public.turfs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners (id) on delete cascade,
  name text not null,
  booking_code text unique check (booking_code = upper(booking_code)),
  address text,
  maps_link text,
  hold_minutes int not null default 15 check (hold_minutes between 5 and 60),
  approval_mode boolean not null default false,
  upi_id text,
  upi_qr_url text,
  advance_type text not null default 'none' check (advance_type in ('none', 'fixed', 'percent')),
  advance_value int not null default 0 check (advance_value >= 0),
  cancellation_policy text,
  reminder_hours int not null default 2 check (reminder_hours >= 0),
  summary_time time not null default '21:00',
  created_at timestamptz not null default now(),
  unique (id, owner_id)
);
create index turfs_owner_id_idx on public.turfs (owner_id);

create table public.courts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  turf_id uuid not null,
  name text not null,
  sport text,
  slot_minutes int not null default 60 check (slot_minutes between 15 and 240),
  open_time time not null default '06:00',
  -- close_time <= open_time means the court is open past midnight
  close_time time not null default '23:00',
  base_price int not null default 0 check (base_price >= 0),
  active boolean not null default true,
  unique (id, owner_id),
  unique (turf_id, name),
  foreign key (turf_id, owner_id) references public.turfs (id, owner_id) on delete cascade
);
create index courts_owner_id_idx on public.courts (owner_id);

create table public.price_bands (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  court_id uuid not null,
  days_of_week smallint[] not null default '{1,2,3,4,5,6,7}' -- ISO: 1 = Monday
    check (days_of_week <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[] and cardinality(days_of_week) > 0),
  start_time time not null,
  end_time time not null,
  price int not null check (price >= 0),
  tag text,
  whatsapp_bookable boolean not null default true,
  foreign key (court_id, owner_id) references public.courts (id, owner_id) on delete cascade
);
create index price_bands_owner_id_idx on public.price_bands (owner_id);
create index price_bands_court_id_idx on public.price_bands (court_id);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners (id) on delete cascade,
  name text not null default '',
  phone text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (owner_id, phone),
  unique (id, owner_id)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  court_id uuid not null,
  customer_id uuid,
  time_range tstzrange not null
    check (lower(time_range) is not null and upper(time_range) is not null and not isempty(time_range)),
  status public.booking_status not null default 'confirmed',
  source public.booking_source not null default 'phone',
  price int not null default 0 check (price >= 0),
  price_overridden boolean not null default false,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  cancel_reason text,
  hold_expires_at timestamptz,
  payment_proof_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, owner_id),
  foreign key (court_id, owner_id) references public.courts (id, owner_id),
  foreign key (customer_id, owner_id) references public.customers (id, owner_id)
);
create index bookings_owner_id_idx on public.bookings (owner_id);
create index bookings_court_range_idx on public.bookings using gist (court_id, time_range);
create index bookings_customer_id_idx on public.bookings (customer_id);
create index bookings_hold_idx on public.bookings (hold_expires_at) where status = 'pending_payment';

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  court_id uuid not null,
  time_range tstzrange not null
    check (lower(time_range) is not null and upper(time_range) is not null and not isempty(time_range)),
  reason text, -- e.g. maintenance, Playo / Hudle / other app, private event
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (court_id, owner_id) references public.courts (id, owner_id)
);
create index blocks_owner_id_idx on public.blocks (owner_id);
create index blocks_court_id_idx on public.blocks (court_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  booking_id uuid not null,
  amount int not null check (amount > 0),
  mode public.payment_mode not null,
  type public.payment_type not null,
  recorded_by uuid references auth.users (id) on delete set null,
  paid_at timestamptz not null default now(),
  foreign key (booking_id, owner_id) references public.bookings (id, owner_id) on delete cascade
);
create index payments_owner_id_idx on public.payments (owner_id);
create index payments_booking_id_idx on public.payments (booking_id);

-- Who changed what, when (filled by triggers; see audit migration).
create table public.audit_log (
  id bigint generated always as identity primary key,
  owner_id uuid not null, -- no FK on purpose: must survive owner deletion cascades
  table_name text not null,
  row_id uuid not null,
  action text not null,
  changed_by uuid,
  changed_at timestamptz not null default now(),
  old_data jsonb,
  new_data jsonb
);
create index audit_log_row_idx on public.audit_log (table_name, row_id);
create index audit_log_owner_id_idx on public.audit_log (owner_id);
