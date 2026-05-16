-- Hackatone — core tables

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

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  owner_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.platform_role not null,
  invited_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

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

create table public.hackathon_tracks (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

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

create table public.judging_criteria (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  name text not null,
  description text,
  weight numeric not null default 1,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.judge_assignments (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  judge_id uuid not null references public.profiles(id) on delete cascade,
  submission_id uuid references public.submissions(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (hackathon_id, judge_id, submission_id)
);

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

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  title text not null,
  body text not null,
  audience text not null default 'accepted_participants',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.chat_channels (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  scope public.message_scope not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.chat_channels(id) on delete cascade,
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

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

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expo_push_token text not null unique,
  device_platform text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
