-- Create the owner account only once the phone number is confirmed (OTP verified),
-- not when an OTP is merely requested. Replaces the trigger from the first-login migration.

drop trigger if exists on_auth_user_created on auth.users;

create or replace function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare new_owner_id uuid;
begin
  if exists (select 1 from public.members where user_id = new.id) then
    return new;
  end if;
  insert into public.owners (phone) values (coalesce(new.phone, ''))
  returning id into new_owner_id;
  insert into public.members (owner_id, user_id, role, phone)
  values (new_owner_id, new.id, 'owner', new.phone);
  return new;
end $$;

create trigger on_auth_user_confirmed
  after insert or update of phone_confirmed_at on auth.users
  for each row
  when (new.phone_confirmed_at is not null)
  execute function private.handle_new_user();
