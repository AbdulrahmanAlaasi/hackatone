-- Hackatone — demo seed data
--
-- Creates one organization, an owner, an organizer, 2 judges, 15 participants,
-- 5 teams, 5 submissions, scores, a published leaderboard, announcements, and chat.
--
-- Notes:
-- - Auth users are inserted directly into auth.users with a known password hash
--   (password = "Hackatone!23") so the demo can log in immediately.
--   In a hosted Supabase project, prefer using the Auth admin API or Studio.
-- - All UUIDs are fixed for repeatability.

-- =========================================================================
-- Auth users
-- =========================================================================
-- Password for all demo users is "Hackatone!23" (hashed inline via crypt() below).

create extension if not exists pgcrypto;

with new_users(id, email, full_name) as (
  values
    ('11111111-1111-1111-1111-111111111101'::uuid, 'owner@hackatone.demo',     'Olivia Owner'),
    ('11111111-1111-1111-1111-111111111102'::uuid, 'organizer@hackatone.demo', 'Omar Organizer'),
    ('11111111-1111-1111-1111-111111111103'::uuid, 'judge1@hackatone.demo',    'Jamie Judge'),
    ('11111111-1111-1111-1111-111111111104'::uuid, 'judge2@hackatone.demo',    'Jules Judge'),
    ('22222222-2222-2222-2222-222222222201'::uuid, 'alex@hackatone.demo',     'Alex Rivera'),
    ('22222222-2222-2222-2222-222222222202'::uuid, 'bea@hackatone.demo',      'Bea Kim'),
    ('22222222-2222-2222-2222-222222222203'::uuid, 'cody@hackatone.demo',     'Cody Patel'),
    ('22222222-2222-2222-2222-222222222204'::uuid, 'dana@hackatone.demo',     'Dana Lopez'),
    ('22222222-2222-2222-2222-222222222205'::uuid, 'eli@hackatone.demo',      'Eli Brown'),
    ('22222222-2222-2222-2222-222222222206'::uuid, 'fay@hackatone.demo',      'Fay Wong'),
    ('22222222-2222-2222-2222-222222222207'::uuid, 'gus@hackatone.demo',      'Gus Hansen'),
    ('22222222-2222-2222-2222-222222222208'::uuid, 'han@hackatone.demo',      'Han Tran'),
    ('22222222-2222-2222-2222-222222222209'::uuid, 'iris@hackatone.demo',     'Iris Mehta'),
    ('22222222-2222-2222-2222-222222222210'::uuid, 'jay@hackatone.demo',      'Jay Cole'),
    ('22222222-2222-2222-2222-222222222211'::uuid, 'kit@hackatone.demo',      'Kit Singh'),
    ('22222222-2222-2222-2222-222222222212'::uuid, 'lia@hackatone.demo',      'Lia Park'),
    ('22222222-2222-2222-2222-222222222213'::uuid, 'mo@hackatone.demo',       'Mo Diallo'),
    ('22222222-2222-2222-2222-222222222214'::uuid, 'noa@hackatone.demo',      'Noa Stein'),
    ('22222222-2222-2222-2222-222222222215'::uuid, 'oz@hackatone.demo',       'Oz Khoury')
)
insert into auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
)
select
  id,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  email,
  crypt('Hackatone!23', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', full_name),
  now(),
  now(),
  '', '', '', ''
from new_users
on conflict (id) do nothing;

-- The on_auth_user_created trigger from 0004 will create profiles automatically.
-- Backfill any phone/company details now.
update public.profiles set phone = '+15551112200', organization_or_company = 'Hackatone Org', major_or_job_title = 'Owner'
  where id = '11111111-1111-1111-1111-111111111101';
update public.profiles set phone = '+15551112201', organization_or_company = 'Hackatone Org', major_or_job_title = 'Organizer'
  where id = '11111111-1111-1111-1111-111111111102';
update public.profiles set organization_or_company = 'AcmeAI', major_or_job_title = 'Principal Engineer'
  where id = '11111111-1111-1111-1111-111111111103';
update public.profiles set organization_or_company = 'NorthLab', major_or_job_title = 'CTO'
  where id = '11111111-1111-1111-1111-111111111104';

-- =========================================================================
-- Organization
-- =========================================================================
insert into public.organizations (id, name, slug, owner_id)
values (
  '33333333-3333-3333-3333-333333333301',
  'Hackatone Demo Org',
  'hackatone-demo',
  '11111111-1111-1111-1111-111111111101'
)
on conflict (id) do nothing;

insert into public.organization_members (organization_id, user_id, role)
values
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', 'organization_owner'),
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111102', 'organizer'),
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111103', 'judge'),
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111104', 'judge')
on conflict do nothing;

-- =========================================================================
-- Hackathon + tracks
-- =========================================================================
insert into public.hackathons (
  id, organization_id, title, slug, description, location,
  starts_at, ends_at, registration_deadline, submission_deadline,
  max_participants, min_team_size, max_team_size, team_mode, solo_allowed,
  status, rules, prizes, leaderboard_published, public_gallery_enabled,
  chat_enabled, created_by
)
values (
  '44444444-4444-4444-4444-444444444401',
  '33333333-3333-3333-3333-333333333301',
  'Hackatone Spring Demo 2026',
  'spring-demo-2026',
  'A two-day demo hackathon used to showcase the Hackatone platform end-to-end.',
  'Riyadh, SA',
  now() + interval '7 days',
  now() + interval '9 days',
  now() + interval '5 days',
  now() + interval '9 days',
  200, 2, 5, 'hybrid', false,
  'registration_open',
  'Be respectful. Build something original. No prior work older than 30 days.',
  'Cash prizes + cloud credits for top 3 teams.',
  true, true, true,
  '11111111-1111-1111-1111-111111111102'
)
on conflict (id) do nothing;

insert into public.hackathon_tracks (id, hackathon_id, name, description) values
  ('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', 'AI for Good',     'Use AI to solve a real community problem.'),
  ('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444401', 'Developer Tools', 'Tools that make developers faster.'),
  ('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444401', 'Open Track',      'Anything goes.')
on conflict (id) do nothing;

-- =========================================================================
-- Judging criteria
-- =========================================================================
insert into public.judging_criteria (id, hackathon_id, name, description, weight, sort_order) values
  ('66666666-6666-6666-6666-666666666601', '44444444-4444-4444-4444-444444444401', 'Innovation',                'Originality of idea.',         1, 1),
  ('66666666-6666-6666-6666-666666666602', '44444444-4444-4444-4444-444444444401', 'Technical implementation',  'Code quality, complexity.',    1, 2),
  ('66666666-6666-6666-6666-666666666603', '44444444-4444-4444-4444-444444444401', 'Design / user experience',  'Usability and craft.',         1, 3),
  ('66666666-6666-6666-6666-666666666604', '44444444-4444-4444-4444-444444444401', 'Impact / usefulness',       'Real-world value.',            1.5, 4),
  ('66666666-6666-6666-6666-666666666605', '44444444-4444-4444-4444-444444444401', 'Presentation',              'Pitch clarity.',                1, 5)
on conflict (id) do nothing;

-- =========================================================================
-- Registrations (15 participants, all accepted, checked in)
-- =========================================================================
insert into public.registrations (hackathon_id, user_id, full_name, email, status, decided_by, decided_at, checked_in_at, checked_in_by)
select
  '44444444-4444-4444-4444-444444444401',
  p.id,
  p.full_name,
  p.email,
  'accepted',
  '11111111-1111-1111-1111-111111111102',
  now(),
  now(),
  '11111111-1111-1111-1111-111111111102'
from public.profiles p
where p.id::text like '22222222-2222-2222-2222-2222222222%'
on conflict (hackathon_id, email) do nothing;

-- =========================================================================
-- Teams + members (5 teams of 3)
-- =========================================================================
insert into public.teams (id, hackathon_id, track_id, name, join_code, created_by) values
  ('77777777-7777-7777-7777-777777777701', '44444444-4444-4444-4444-444444444401', '55555555-5555-5555-5555-555555555501', 'Team Aurora',  'AUR123', '22222222-2222-2222-2222-222222222201'),
  ('77777777-7777-7777-7777-777777777702', '44444444-4444-4444-4444-444444444401', '55555555-5555-5555-5555-555555555502', 'Team Borealis','BOR456', '22222222-2222-2222-2222-222222222204'),
  ('77777777-7777-7777-7777-777777777703', '44444444-4444-4444-4444-444444444401', '55555555-5555-5555-5555-555555555503', 'Team Cipher',  'CIP789', '22222222-2222-2222-2222-222222222207'),
  ('77777777-7777-7777-7777-777777777704', '44444444-4444-4444-4444-444444444401', '55555555-5555-5555-5555-555555555501', 'Team Delta',   'DEL012', '22222222-2222-2222-2222-222222222210'),
  ('77777777-7777-7777-7777-777777777705', '44444444-4444-4444-4444-444444444401', '55555555-5555-5555-5555-555555555502', 'Team Echo',    'ECH345', '22222222-2222-2222-2222-222222222213')
on conflict (id) do nothing;

insert into public.team_members (team_id, hackathon_id, user_id, role) values
  ('77777777-7777-7777-7777-777777777701','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222201','lead'),
  ('77777777-7777-7777-7777-777777777701','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222202','member'),
  ('77777777-7777-7777-7777-777777777701','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222203','member'),
  ('77777777-7777-7777-7777-777777777702','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222204','lead'),
  ('77777777-7777-7777-7777-777777777702','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222205','member'),
  ('77777777-7777-7777-7777-777777777702','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222206','member'),
  ('77777777-7777-7777-7777-777777777703','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222207','lead'),
  ('77777777-7777-7777-7777-777777777703','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222208','member'),
  ('77777777-7777-7777-7777-777777777703','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222209','member'),
  ('77777777-7777-7777-7777-777777777704','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222210','lead'),
  ('77777777-7777-7777-7777-777777777704','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222211','member'),
  ('77777777-7777-7777-7777-777777777704','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222212','member'),
  ('77777777-7777-7777-7777-777777777705','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222213','lead'),
  ('77777777-7777-7777-7777-777777777705','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222214','member'),
  ('77777777-7777-7777-7777-777777777705','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222215','member')
on conflict do nothing;

-- =========================================================================
-- Submissions
-- =========================================================================
insert into public.submissions (id, hackathon_id, team_id, title, description, track_id, github_url, demo_url, status, submitted_at) values
  ('88888888-8888-8888-8888-888888888801','44444444-4444-4444-4444-444444444401','77777777-7777-7777-7777-777777777701','Aurora: Volunteer Matchmaker','AI that matches volunteers to nonprofits by skill.',          '55555555-5555-5555-5555-555555555501','https://github.com/demo/aurora','https://aurora.demo','submitted', now()),
  ('88888888-8888-8888-8888-888888888802','44444444-4444-4444-4444-444444444401','77777777-7777-7777-7777-777777777702','Borealis CLI',               'Terminal companion that summarizes git history.',              '55555555-5555-5555-5555-555555555502','https://github.com/demo/borealis','https://borealis.demo','submitted', now()),
  ('88888888-8888-8888-8888-888888888803','44444444-4444-4444-4444-444444444401','77777777-7777-7777-7777-777777777703','Cipher: Privacy Vault',      'End-to-end encrypted notes with passphrase recovery.',          '55555555-5555-5555-5555-555555555503','https://github.com/demo/cipher','https://cipher.demo','submitted', now()),
  ('88888888-8888-8888-8888-888888888804','44444444-4444-4444-4444-444444444401','77777777-7777-7777-7777-777777777704','Delta Health Insights',      'Personal health timeline aggregator with anomaly alerts.',      '55555555-5555-5555-5555-555555555501','https://github.com/demo/delta','https://delta.demo','submitted', now()),
  ('88888888-8888-8888-8888-888888888805','44444444-4444-4444-4444-444444444401','77777777-7777-7777-7777-777777777705','Echo Code Review',           'AI reviewer that explains PR diffs in plain English.',          '55555555-5555-5555-5555-555555555502','https://github.com/demo/echo','https://echo.demo','submitted', now())
on conflict (id) do nothing;

-- =========================================================================
-- Judge assignments (both judges score all submissions)
-- =========================================================================
insert into public.judge_assignments (hackathon_id, judge_id, submission_id, assigned_by)
select '44444444-4444-4444-4444-444444444401', j.judge, s.id, '11111111-1111-1111-1111-111111111102'
from (values ('11111111-1111-1111-1111-111111111103'::uuid),('11111111-1111-1111-1111-111111111104'::uuid)) as j(judge)
cross join public.submissions s
where s.hackathon_id = '44444444-4444-4444-4444-444444444401'
on conflict do nothing;

-- =========================================================================
-- Scores — every judge scores every criterion for every submission
-- =========================================================================
insert into public.scores (hackathon_id, submission_id, judge_id, criteria_id, score, is_final, comment)
select
  '44444444-4444-4444-4444-444444444401',
  s.id,
  j.judge,
  c.id,
  -- deterministic-ish score 3..5
  3 + ((abs(hashtext(s.id::text || j.judge::text || c.id::text)) % 3)),
  true,
  'Solid work on ' || c.name || '.'
from public.submissions s
cross join (values
  ('11111111-1111-1111-1111-111111111103'::uuid),
  ('11111111-1111-1111-1111-111111111104'::uuid)
) j(judge)
cross join public.judging_criteria c
where s.hackathon_id = '44444444-4444-4444-4444-444444444401'
  and c.hackathon_id = '44444444-4444-4444-4444-444444444401'
on conflict (submission_id, judge_id, criteria_id) do nothing;

-- =========================================================================
-- Leaderboard (from submission_score_totals view)
-- =========================================================================
insert into public.leaderboard_results (hackathon_id, submission_id, total_score, impact_score, rank, is_winner, published_at)
select
  t.hackathon_id,
  t.submission_id,
  t.total_score,
  (select avg(sc.score) from public.scores sc
     where sc.submission_id = t.submission_id
       and sc.criteria_id = '66666666-6666-6666-6666-666666666604') as impact_score,
  row_number() over (order by t.total_score desc),
  row_number() over (order by t.total_score desc) = 1,
  now()
from public.submission_score_totals t
where t.hackathon_id = '44444444-4444-4444-4444-444444444401'
on conflict (hackathon_id, submission_id) do nothing;

-- =========================================================================
-- Announcements + chat
-- =========================================================================
insert into public.announcements (hackathon_id, title, body, created_by) values
  ('44444444-4444-4444-4444-444444444401','Welcome to Hackatone Spring Demo!','Check-in opens at 9am. Coffee and snacks in the main hall.','11111111-1111-1111-1111-111111111102'),
  ('44444444-4444-4444-4444-444444444401','Submission deadline reminder','Submissions close in 6 hours. Don''t forget your video link.','11111111-1111-1111-1111-111111111102');

insert into public.chat_channels (id, hackathon_id, team_id, scope, name) values
  ('99999999-9999-9999-9999-999999999901','44444444-4444-4444-4444-444444444401','77777777-7777-7777-7777-777777777701','team','Team Aurora'),
  ('99999999-9999-9999-9999-999999999902','44444444-4444-4444-4444-444444444401','77777777-7777-7777-7777-777777777702','team','Team Borealis'),
  ('99999999-9999-9999-9999-999999999910','44444444-4444-4444-4444-444444444401', null,                                       'hackathon','General')
on conflict (id) do nothing;

insert into public.chat_messages (channel_id, hackathon_id, sender_id, body) values
  ('99999999-9999-9999-9999-999999999901','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222201','Kickoff in 10 minutes!'),
  ('99999999-9999-9999-9999-999999999901','44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222202','I''ll handle the API.'),
  ('99999999-9999-9999-9999-999999999910','44444444-4444-4444-4444-444444444401','11111111-1111-1111-1111-111111111102','Welcome everyone — good luck!');
