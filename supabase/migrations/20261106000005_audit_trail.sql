-- Audit trail for bookings and payments: who changed what, and when.

create function private.audit_row() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_log (owner_id, table_name, row_id, action, changed_by, old_data, new_data)
  values (
    coalesce(new.owner_id, old.owner_id),
    tg_table_name,
    coalesce(new.id, old.id),
    tg_op,
    (select auth.uid()),
    case when tg_op <> 'INSERT' then to_jsonb(old) end,
    case when tg_op <> 'DELETE' then to_jsonb(new) end
  );
  return null;
end $$;

create trigger bookings_audit
  after insert or update or delete on public.bookings
  for each row execute function private.audit_row();

create trigger payments_audit
  after insert or update or delete on public.payments
  for each row execute function private.audit_row();
