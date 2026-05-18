-- Hackatone - auto-create a hackathon-wide General chat channel.

-- 1. Merge duplicate hackathon-wide channels, keeping the oldest one per hackathon.
with ranked as (
  select id,
         hackathon_id,
         created_at,
         row_number() over (partition by hackathon_id order by created_at, id) as rn
    from public.chat_channels
   where scope = 'hackathon' and team_id is null
),
canonicals as (
  select hackathon_id, id as canonical_id
    from ranked
   where rn = 1
),
dupes as (
  select r.id as dup_id, c.canonical_id
    from ranked r
    join canonicals c on c.hackathon_id = r.hackathon_id
   where r.rn > 1
)
update public.chat_messages cm
   set channel_id = d.canonical_id
  from dupes d
 where cm.channel_id = d.dup_id;

delete from public.chat_channels
 where id in (
   select id
     from (
       select id,
              row_number() over (partition by hackathon_id order by created_at, id) as rn
         from public.chat_channels
        where scope = 'hackathon' and team_id is null
     ) ranked
    where rn > 1
 );

-- 2. Prevent future duplicate General channels.
create unique index if not exists chat_channels_hackathon_general_unique
  on public.chat_channels (hackathon_id)
  where scope = 'hackathon' and team_id is null;

-- 3. Create General on hackathon insert, and when chat is enabled later.
create or replace function public.ensure_hackathon_general_chat_channel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.chat_enabled then
    insert into public.chat_channels (hackathon_id, team_id, scope, name)
    select new.id, null, 'hackathon', 'General'
    where not exists (
      select 1
        from public.chat_channels c
       where c.hackathon_id = new.id
         and c.scope = 'hackathon'
         and c.team_id is null
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ensure_hackathon_general_chat_channel on public.hackathons;
create trigger trg_ensure_hackathon_general_chat_channel
after insert or update of chat_enabled on public.hackathons
for each row execute function public.ensure_hackathon_general_chat_channel();

-- 4. Backfill General for existing chat-enabled hackathons.
insert into public.chat_channels (hackathon_id, team_id, scope, name)
select h.id, null, 'hackathon', 'General'
  from public.hackathons h
 where h.chat_enabled = true
   and not exists (
     select 1
       from public.chat_channels c
      where c.hackathon_id = h.id
        and c.scope = 'hackathon'
        and c.team_id is null
   );
