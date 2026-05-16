-- Hackatone — helper functions, updated_at trigger, new user trigger

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'profiles','organizations','hackathons','registrations',
      'teams','submissions','scores','leaderboard_results','push_tokens'
    ])
  loop
    execute format(
      'create trigger trg_set_updated_at_%s before update on public.%I
       for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end $$;

-- Auto-create profile row on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  -- Link any pending registrations made before user signed up
  update public.registrations
     set user_id = new.id
   where user_id is null
     and lower(email) = lower(new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Authorization helpers (used by RLS policies)
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members om
    where om.organization_id = org_id and om.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.role in ('platform_admin', 'organization_owner', 'organizer')
  );
$$;

create or replace function public.hackathon_org(h_id uuid)
returns uuid
language sql
stable
as $$
  select organization_id from public.hackathons where id = h_id;
$$;

create or replace function public.is_hackathon_admin(h_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_org_admin(public.hackathon_org(h_id));
$$;

create or replace function public.is_accepted_participant(h_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.registrations r
    where r.hackathon_id = h_id
      and r.user_id = auth.uid()
      and r.status = 'accepted'
  );
$$;

create or replace function public.is_assigned_judge(h_id uuid, s_id uuid default null)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.judge_assignments ja
    where ja.hackathon_id = h_id
      and ja.judge_id = auth.uid()
      and (s_id is null or ja.submission_id is null or ja.submission_id = s_id)
  );
$$;

create or replace function public.is_team_member(t_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members tm
    where tm.team_id = t_id and tm.user_id = auth.uid()
  );
$$;
