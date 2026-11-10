-- Owners log in with an email OTP for now (phone OTP later). Keep the contact email on
-- owners and members (auth.users is not readable by the app; the super admin list needs it),
-- and create the owner account once email OR phone is confirmed.

alter table public.owners add column email text;
alter table public.members add column email text;

drop trigger if exists on_auth_user_confirmed on auth.users;

create or replace function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare new_owner_id uuid;
begin
  if exists (select 1 from public.members where user_id = new.id) then
    return new;
  end if;
  insert into public.owners (phone, email) values (coalesce(new.phone, ''), new.email)
  returning id into new_owner_id;
  insert into public.members (owner_id, user_id, role, phone, email)
  values (new_owner_id, new.id, 'owner', new.phone, new.email);
  return new;
end $$;

create trigger on_auth_user_confirmed
  after insert or update of phone_confirmed_at, email_confirmed_at on auth.users
  for each row
  when (new.phone_confirmed_at is not null or new.email_confirmed_at is not null)
  execute function private.handle_new_user();
