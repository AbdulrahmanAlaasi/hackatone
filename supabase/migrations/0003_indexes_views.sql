-- Hackatone — indexes and dashboard views

create index on public.hackathons (organization_id);
create index on public.hackathons (status);
create index on public.hackathon_tracks (hackathon_id);
create index on public.registrations (hackathon_id);
create index on public.registrations (status);
create index on public.registrations (email);
create index on public.registrations (user_id);
create index on public.teams (hackathon_id);
create index on public.team_members (hackathon_id);
create index on public.team_members (user_id);
create index on public.submissions (hackathon_id);
create index on public.submissions (status);
create index on public.judging_criteria (hackathon_id);
create index on public.judge_assignments (hackathon_id);
create index on public.judge_assignments (judge_id);
create index on public.scores (hackathon_id);
create index on public.scores (submission_id);
create index on public.scores (judge_id);
create index on public.leaderboard_results (hackathon_id);
create index on public.announcements (hackathon_id);
create index on public.chat_channels (hackathon_id);
create index on public.chat_channels (team_id);
create index on public.chat_messages (channel_id);
create index on public.chat_messages (hackathon_id, created_at desc);
create index on public.notifications (user_id, read_at);
create index on public.audit_events (organization_id, created_at desc);
create index on public.audit_events (hackathon_id, created_at desc);

create or replace view public.submission_score_totals as
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

create or replace view public.hackathon_dashboard_stats as
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
