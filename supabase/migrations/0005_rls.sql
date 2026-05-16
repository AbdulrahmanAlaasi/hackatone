-- Hackatone — Row Level Security
-- Starter policies. Tighten further before production.

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.hackathons enable row level security;
alter table public.hackathon_tracks enable row level security;
alter table public.registrations enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.submissions enable row level security;
alter table public.judging_criteria enable row level security;
alter table public.judge_assignments enable row level security;
alter table public.scores enable row level security;
alter table public.leaderboard_results enable row level security;
alter table public.announcements enable row level security;
alter table public.chat_channels enable row level security;
alter table public.chat_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.push_tokens enable row level security;
alter table public.audit_events enable row level security;

-- profiles
create policy "profiles_select_self_or_org_admin"
  on public.profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from public.organization_members om
      where om.user_id = auth.uid()
        and om.role in ('platform_admin','organization_owner','organizer')
    )
  );

create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_insert_self"
  on public.profiles for insert
  with check (id = auth.uid());

-- organizations
create policy "orgs_select_members"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "orgs_admin_all"
  on public.organizations for all
  using (public.is_org_admin(id))
  with check (public.is_org_admin(id));

-- organization_members
create policy "org_members_select_same_org"
  on public.organization_members for select
  using (public.is_org_member(organization_id));

create policy "org_members_admin_manage"
  on public.organization_members for all
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

-- hackathons
create policy "hackathons_select_org_or_participant_or_public"
  on public.hackathons for select
  using (
    public.is_org_member(organization_id)
    or public.is_accepted_participant(id)
    or leaderboard_published = true
    or status in ('registration_open','active')
  );

create policy "hackathons_admin_all"
  on public.hackathons for all
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

-- hackathon_tracks (public so registration page can show them)
create policy "tracks_select_all" on public.hackathon_tracks for select using (true);
create policy "tracks_admin_all" on public.hackathon_tracks for all
  using (public.is_hackathon_admin(hackathon_id))
  with check (public.is_hackathon_admin(hackathon_id));

-- registrations
create policy "registrations_select_self_or_admin"
  on public.registrations for select
  using (
    user_id = auth.uid()
    or public.is_hackathon_admin(hackathon_id)
  );

create policy "registrations_insert_self_or_anon"
  on public.registrations for insert
  with check (
    user_id is null
    or user_id = auth.uid()
  );

create policy "registrations_admin_manage"
  on public.registrations for update
  using (public.is_hackathon_admin(hackathon_id))
  with check (public.is_hackathon_admin(hackathon_id));

create policy "registrations_admin_delete"
  on public.registrations for delete
  using (public.is_hackathon_admin(hackathon_id));

-- teams
create policy "teams_select_org_or_member_or_participant"
  on public.teams for select
  using (
    public.is_hackathon_admin(hackathon_id)
    or public.is_team_member(id)
    or public.is_accepted_participant(hackathon_id)
  );

create policy "teams_admin_all"
  on public.teams for all
  using (public.is_hackathon_admin(hackathon_id))
  with check (public.is_hackathon_admin(hackathon_id));

create policy "teams_participant_create"
  on public.teams for insert
  with check (
    public.is_accepted_participant(hackathon_id)
    and created_by = auth.uid()
  );

-- team_members
create policy "team_members_select_self_or_team_or_admin"
  on public.team_members for select
  using (
    user_id = auth.uid()
    or public.is_team_member(team_id)
    or public.is_hackathon_admin(hackathon_id)
  );

create policy "team_members_self_join"
  on public.team_members for insert
  with check (
    user_id = auth.uid()
    and public.is_accepted_participant(hackathon_id)
  );

create policy "team_members_admin_manage"
  on public.team_members for all
  using (public.is_hackathon_admin(hackathon_id))
  with check (public.is_hackathon_admin(hackathon_id));

create policy "team_members_self_leave"
  on public.team_members for delete
  using (user_id = auth.uid());

-- submissions
create policy "submissions_select_team_or_admin_or_judge_or_published"
  on public.submissions for select
  using (
    public.is_team_member(team_id)
    or public.is_hackathon_admin(hackathon_id)
    or public.is_assigned_judge(hackathon_id, id)
    or exists (
      select 1 from public.hackathons h
      where h.id = hackathon_id and h.public_gallery_enabled = true
    )
  );

create policy "submissions_team_write"
  on public.submissions for insert
  with check (public.is_team_member(team_id));

create policy "submissions_team_update"
  on public.submissions for update
  using (public.is_team_member(team_id) or public.is_hackathon_admin(hackathon_id))
  with check (public.is_team_member(team_id) or public.is_hackathon_admin(hackathon_id));

create policy "submissions_admin_delete"
  on public.submissions for delete
  using (public.is_hackathon_admin(hackathon_id));

-- judging_criteria
create policy "criteria_select_all"
  on public.judging_criteria for select using (true);

create policy "criteria_admin_all"
  on public.judging_criteria for all
  using (public.is_hackathon_admin(hackathon_id))
  with check (public.is_hackathon_admin(hackathon_id));

-- judge_assignments
create policy "judge_assignments_select_self_or_admin"
  on public.judge_assignments for select
  using (judge_id = auth.uid() or public.is_hackathon_admin(hackathon_id));

create policy "judge_assignments_admin_all"
  on public.judge_assignments for all
  using (public.is_hackathon_admin(hackathon_id))
  with check (public.is_hackathon_admin(hackathon_id));

-- scores
create policy "scores_select_self_or_admin"
  on public.scores for select
  using (judge_id = auth.uid() or public.is_hackathon_admin(hackathon_id));

create policy "scores_judge_write"
  on public.scores for insert
  with check (
    judge_id = auth.uid()
    and public.is_assigned_judge(hackathon_id, submission_id)
  );

create policy "scores_judge_update"
  on public.scores for update
  using (judge_id = auth.uid())
  with check (judge_id = auth.uid());

-- leaderboard_results
create policy "leaderboard_select_published_or_admin"
  on public.leaderboard_results for select
  using (
    public.is_hackathon_admin(hackathon_id)
    or exists (
      select 1 from public.hackathons h
      where h.id = hackathon_id and h.leaderboard_published = true
    )
  );

create policy "leaderboard_admin_all"
  on public.leaderboard_results for all
  using (public.is_hackathon_admin(hackathon_id))
  with check (public.is_hackathon_admin(hackathon_id));

-- announcements
create policy "announcements_select_participants_or_admin"
  on public.announcements for select
  using (
    public.is_hackathon_admin(hackathon_id)
    or public.is_accepted_participant(hackathon_id)
  );

create policy "announcements_admin_write"
  on public.announcements for all
  using (public.is_hackathon_admin(hackathon_id))
  with check (public.is_hackathon_admin(hackathon_id));

-- chat_channels
create policy "channels_select_authorized"
  on public.chat_channels for select
  using (
    public.is_hackathon_admin(hackathon_id)
    or (team_id is not null and public.is_team_member(team_id))
    or (scope = 'hackathon' and public.is_accepted_participant(hackathon_id))
    or (scope = 'announcement' and public.is_accepted_participant(hackathon_id))
  );

create policy "channels_admin_all"
  on public.chat_channels for all
  using (public.is_hackathon_admin(hackathon_id))
  with check (public.is_hackathon_admin(hackathon_id));

-- chat_messages
create policy "messages_select_channel_authorized"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.chat_channels c
      where c.id = channel_id
        and (
          public.is_hackathon_admin(c.hackathon_id)
          or (c.team_id is not null and public.is_team_member(c.team_id))
          or (c.scope = 'hackathon' and public.is_accepted_participant(c.hackathon_id))
        )
    )
  );

create policy "messages_insert_self_authorized"
  on public.chat_messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.chat_channels c
      where c.id = channel_id
        and (
          public.is_hackathon_admin(c.hackathon_id)
          or (c.team_id is not null and public.is_team_member(c.team_id))
          or (c.scope = 'hackathon' and public.is_accepted_participant(c.hackathon_id))
        )
    )
  );

create policy "messages_update_self"
  on public.chat_messages for update
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

create policy "messages_delete_self_or_admin"
  on public.chat_messages for delete
  using (sender_id = auth.uid() or public.is_hackathon_admin(hackathon_id));

-- notifications
create policy "notifications_select_self"
  on public.notifications for select using (user_id = auth.uid());

create policy "notifications_update_self"
  on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- push_tokens
create policy "push_tokens_self_all"
  on public.push_tokens for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- audit_events (admin read-only via UI; writes by server with service role)
create policy "audit_select_org_admin"
  on public.audit_events for select
  using (
    (organization_id is not null and public.is_org_admin(organization_id))
    or (hackathon_id is not null and public.is_hackathon_admin(hackathon_id))
  );
