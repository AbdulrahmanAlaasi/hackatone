-- Hackatone — apply missing 0008 trigger and enable realtime where needed.
--
-- 1. Re-run migration 0008's link-trigger (was missed when applying via Management API).
-- 2. Add chat_messages + notifications to the supabase_realtime publication so the
--    in-app chat updates live and the notification bell can stream new items.

-- ============ 0008's trigger (idempotent) ============
create or replace function public.link_registration_to_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null and new.email is not null then
    select id into new.user_id
      from auth.users
     where lower(email) = lower(new.email)
     limit 1;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_link_registration_to_user on public.registrations;
create trigger trg_link_registration_to_user
before insert on public.registrations
for each row execute function public.link_registration_to_user();

-- Backfill any orphan registrations
update public.registrations r
   set user_id = u.id
  from auth.users u
 where r.user_id is null
   and lower(r.email) = lower(u.email);

-- ============ Realtime publication ============
-- chat_messages — for the live chat (mobile + web)
alter publication supabase_realtime add table public.chat_messages;
-- notifications — so the bell streams new alerts
alter publication supabase_realtime add table public.notifications;
