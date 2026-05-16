-- Hackatone — dedupe team chat channels and prevent future duplicates.
--
-- Seed data and the auto-create trigger (migration 0007) both created a team
-- channel per team → some teams ended up with two. Merge the duplicates,
-- reparent their messages to the canonical (oldest) channel, then add a
-- unique index so it can never happen again.

-- 1. Compute (team_id → canonical channel id) for the oldest channel per team
--    and (duplicate id → canonical id) for everything else.
with ranked as (
  select id, team_id, created_at,
         row_number() over (partition by team_id order by created_at, id) as rn
    from public.chat_channels
   where scope = 'team' and team_id is not null
),
canonicals as (
  select team_id, id as canonical_id from ranked where rn = 1
),
dupes as (
  select r.id as dup_id, c.canonical_id
    from ranked r
    join canonicals c on c.team_id = r.team_id
   where r.rn > 1
)
-- 2. Reparent messages from duplicates to their canonical channel.
update public.chat_messages cm
   set channel_id = d.canonical_id
  from dupes d
 where cm.channel_id = d.dup_id;

-- 3. Delete the duplicate channel rows.
delete from public.chat_channels
 where id in (
   select r.id
     from (
       select id, row_number() over (partition by team_id order by created_at, id) as rn
         from public.chat_channels
        where scope = 'team' and team_id is not null
     ) r
    where r.rn > 1
 );

-- 4. Prevent future duplicates: at most one 'team' channel per team.
create unique index if not exists chat_channels_team_unique
  on public.chat_channels (team_id) where scope = 'team' and team_id is not null;
