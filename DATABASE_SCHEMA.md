# Hackatone Database Schema

This document defines the recommended Supabase/PostgreSQL database model for Hackatone.

Use this with:

- `APP_SPEC.md`
- `USER_FLOWS.md`
- `DESIGN.md`
- `DEPLOYMENT_PLAN.md`

---

# 1. Database Principles

- Use Supabase Auth for authentication.
- Use PostgreSQL tables in the `public` schema for app data.
- Enable Row Level Security on all user-accessible tables.
- Scope most data by `organization_id` and/or `hackathon_id`.
- Use random UUID primary keys.
- Use random non-guessable QR tokens.
- Keep public pages limited to published/safe data.
- Do not expose participant emails or phone numbers publicly.

Official reference: Supabase recommends protecting tables with Row Level Security when using Auth and browser/mobile clients.

---

# 2. Core Enums

```sql
create type public.platform_role as enum (
  'platform_admin',
  'organization_owner',
  'organizer',
  'judge',
  'participant',
  'mentor'
);

create type public.hackathon_status as enum (
  'draft',
  'registration_open',
  'registration_closed',
  'active',
  'judging',
  'completed',
  'archived'
);

create type public.registration_status as enum (
  'pending',
  'accepted',
  'rejected',
  'waitlisted',
  'withdrawn'
);

create type public.team_mode as enum (
  'organizer_assigns',
  'participant_creates',
  'team_code',
  'invite_link',
  'hybrid'
);

create type public.submission_status as enum (
  'draft',
  'submitted',
  'locked',
  'withdrawn'
);

create type public.message_scope as enum (
  'team',
  'hackathon',
  'judge',
  'announcement'
);

create type public.notification_channel as enum (
  'in_app',
  'email',
  'push'
);
```

---

# 3. Tables

## 3.1 profiles

Extends Supabase Auth users.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  organization_or_company text,
  major_or_job_title text,
  skill_level text,
  skills text[] default '{}',
  github_url text,
  portfolio_url text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 3.2 organizations

```sql
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  owner_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 3.3 organization_members

```sql
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.platform_role not null,
  invited_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);
```

## 3.4 hackathons

```sql
create table public.hackathons (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  registration_deadline timestamptz,
  submission_deadline timestamptz,
  max_participants int,
  min_team_size int default 1,
  max_team_size int default 5,
  team_mode public.team_mode not null default 'organizer_assigns',
  solo_allowed boolean not null default true,
  status public.hackathon_status not null default 'draft',
  rules text,
  prizes text,
  score_min int not null default 1,
  score_max int not null default 5,
  passing_score numeric,
  leaderboard_published boolean not null default false,
  public_gallery_enabled boolean not null default false,
  chat_enabled boolean not null default true,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);
```

## 3.5 hackathon_tracks

```sql
create table public.hackathon_tracks (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);
```

## 3.6 registrations

```sql
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  organization_or_company text,
  major_or_job_title text,
  skill_level text,
  skills text[] default '{}',
  preferred_track_id uuid references public.hackathon_tracks(id),
  github_url text,
  portfolio_url text,
  team_preference text,
  status public.registration_status not null default 'pending',
  decision_note text,
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  qr_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  checked_in_at timestamptz,
  checked_in_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hackathon_id, email)
);
```

## 3.7 teams

```sql
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  track_id uuid references public.hackathon_tracks(id),
  name text not null,
  join_code text unique,
  invite_token text unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hackathon_id, name)
);
```

## 3.8 team_members

```sql
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  unique (team_id, user_id),
  unique (hackathon_id, user_id)
);
```

## 3.9 submissions

```sql
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  title text not null,
  description text,
  track_id uuid references public.hackathon_tracks(id),
  github_url text,
  demo_url text,
  presentation_url text,
  video_url text,
  screenshot_urls text[] default '{}',
  status public.submission_status not null default 'draft',
  submitted_at timestamptz,
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id)
);
```

## 3.10 judging_criteria

```sql
create table public.judging_criteria (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  name text not null,
  description text,
  weight numeric not null default 1,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
```

## 3.11 judge_assignments

```sql
create table public.judge_assignments (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  judge_id uuid not null references public.profiles(id) on delete cascade,
  submission_id uuid references public.submissions(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (hackathon_id, judge_id, submission_id)
);
```

If `submission_id` is null, judge can score all submissions in the hackathon.

## 3.12 scores

```sql
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  submission_id uuid not null references public.submissions(id) on delete cascade,
  judge_id uuid not null references public.profiles(id) on delete cascade,
  criteria_id uuid not null references public.judging_criteria(id) on delete cascade,
  score numeric not null,
  comment text,
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (submission_id, judge_id, criteria_id)
);
```

## 3.13 leaderboard_results

```sql
create table public.leaderboard_results (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  submission_id uuid not null references public.submissions(id) on delete cascade,
  total_score numeric not null default 0,
  impact_score numeric,
  rank int,
  is_winner boolean not null default false,
  manual_rank_override int,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hackathon_id, submission_id)
);
```

## 3.14 announcements

```sql
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  title text not null,
  body text not null,
  audience text not null default 'accepted_participants',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
```

## 3.15 chat_channels

```sql
create table public.chat_channels (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  scope public.message_scope not null,
  name text not null,
  created_at timestamptz not null default now()
);
```

## 3.16 chat_messages

```sql
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.chat_channels(id) on delete cascade,
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);
```

## 3.17 notifications

```sql
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  hackathon_id uuid references public.hackathons(id) on delete cascade,
  channel public.notification_channel not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
```

## 3.18 push_tokens

```sql
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expo_push_token text not null unique,
  device_platform text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 3.19 audit_events

```sql
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  hackathon_id uuid references public.hackathons(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);
```

---

# 4. Useful Views

## 4.1 submission_score_totals

```sql
create view public.submission_score_totals as
select
  s.hackathon_id,
  s.submission_id,
  sum(s.score * jc.weight) as total_score,
  avg(s.score) as average_score,
  count(*) as score_count
from public.scores s
join public.judging_criteria jc on jc.id = s.criteria_id
where s.is_final = true
group by s.hackathon_id, s.submission_id;
```

## 4.2 hackathon_dashboard_stats

```sql
create view public.hackathon_dashboard_stats as
select
  h.id as hackathon_id,
  count(distinct r.id) as registrations_count,
  count(distinct r.id) filter (where r.status = 'accepted') as accepted_count,
  count(distinct r.id) filter (where r.checked_in_at is not null) as checked_in_count,
  count(distinct t.id) as teams_count,
  count(distinct s.id) filter (where s.status = 'submitted') as submissions_count
from public.hackathons h
left join public.registrations r on r.hackathon_id = h.id
left join public.teams t on t.hackathon_id = h.id
left join public.submissions s on s.hackathon_id = h.id
group by h.id;
```

---

# 5. RLS Policy Outline

Enable RLS:

```sql
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.hackathons enable row level security;
alter table public.registrations enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.submissions enable row level security;
alter table public.judging_criteria enable row level security;
alter table public.judge_assignments enable row level security;
alter table public.scores enable row level security;
alter table public.announcements enable row level security;
alter table public.chat_channels enable row level security;
alter table public.chat_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.push_tokens enable row level security;
alter table public.audit_events enable row level security;
```

Recommended helper functions:

```sql
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.role in ('platform_admin', 'organization_owner', 'organizer')
  );
$$;

create or replace function public.is_accepted_participant(h_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.registrations r
    where r.hackathon_id = h_id
      and r.user_id = auth.uid()
      and r.status = 'accepted'
  );
$$;
```

Policy examples:

```sql
create policy "Users can read own profile"
on public.profiles for select
using (id = auth.uid());

create policy "Users can update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Organization members can read organization hackathons"
on public.hackathons for select
using (public.is_org_member(organization_id));

create policy "Organization admins can manage hackathons"
on public.hackathons for all
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));
```

Need detailed RLS policies before production.

---

# 6. Storage Buckets

Recommended Supabase Storage buckets:

- `avatars`
- `submission-screenshots`
- `organization-logos`
- `certificates`

Rules:

- Public read only for assets intended to be public.
- Private participant files must require auth.
- Submission screenshots can become public only after project gallery is published.

---

# 7. Seed Data

For demos, create:

- 1 organization.
- 1 organization owner.
- 1 organizer.
- 2 judges.
- 1 hackathon.
- 3 tracks.
- 15 participants.
- 5 teams.
- 5 submissions.
- Scores for each submission.
- Published leaderboard.
- Sample announcements.
- Sample chat messages.

