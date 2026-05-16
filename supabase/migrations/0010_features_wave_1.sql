-- Hackatone — Wave 1 schema additions.
--
-- 1. CV + AI analysis on profiles (filled by Wave 2 AI feature).
-- 2. Hackathon visibility (public listings vs invite-only QR) + free-form field.
-- 3. Hidden flag on announcements (soft-hide without deleting history).

-- ============================================================
-- profiles: CV + AI analysis
-- ============================================================
alter table public.profiles
  add column if not exists cv_url text,
  add column if not exists ai_skills text[] default '{}',
  add column if not exists ai_level text,                 -- e.g. 'beginner' / 'intermediate' / 'advanced' / 'expert'
  add column if not exists ai_strengths text[] default '{}',
  add column if not exists ai_summary text,
  add column if not exists ai_analyzed_at timestamptz;

-- ============================================================
-- hackathons: visibility + field/category
-- ============================================================
create type public.hackathon_visibility as enum ('public', 'private');

alter table public.hackathons
  add column if not exists visibility public.hackathon_visibility not null default 'private',
  add column if not exists field text;

create index if not exists idx_hackathons_visibility on public.hackathons (visibility);
create index if not exists idx_hackathons_field on public.hackathons (field);

-- ============================================================
-- announcements: soft hide
-- ============================================================
alter table public.announcements
  add column if not exists hidden boolean not null default false;

-- ============================================================
-- storage bucket for CV uploads
-- ============================================================
insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;

-- Authenticated users can upload only into their own folder (auth.uid()/...)
create policy "users upload own cv"
  on storage.objects for insert
  with check (
    bucket_id = 'cvs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users read own cv"
  on storage.objects for select
  using (
    bucket_id = 'cvs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users update own cv"
  on storage.objects for update
  using (
    bucket_id = 'cvs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
