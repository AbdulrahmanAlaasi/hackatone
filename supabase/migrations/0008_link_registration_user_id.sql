-- Hackatone — auto-link registrations to existing auth users by email.
--
-- Migration 0004's handle_new_user() handles the case where someone REGISTERS first
-- then SIGNS UP later. This trigger handles the opposite case: someone SIGNS UP
-- first (creating an auth user), then REGISTERS for a hackathon. Without it, the
-- registration's user_id stays NULL and RLS hides the row from the mobile app.

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

-- Backfill any existing orphan registrations.
update public.registrations r
   set user_id = u.id
  from auth.users u
 where r.user_id is null
   and lower(r.email) = lower(u.email);
