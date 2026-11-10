-- First login (phone OTP creates an auth user) creates one owner account and an
-- owner membership. The business name is filled in later by the setup wizard.

create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare new_owner_id uuid;
begin
  insert into public.owners (phone) values (coalesce(new.phone, ''))
  returning id into new_owner_id;
  insert into public.members (owner_id, user_id, role, phone)
  values (new_owner_id, new.id, 'owner', new.phone);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
