-- Hackatone — auto-create a team chat channel whenever a team is inserted.

create or replace function public.create_team_chat_channel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.chat_channels (hackathon_id, team_id, scope, name)
  values (new.hackathon_id, new.id, 'team', new.name);
  return new;
end;
$$;

drop trigger if exists trg_create_team_chat_channel on public.teams;
create trigger trg_create_team_chat_channel
after insert on public.teams
for each row execute function public.create_team_chat_channel();

-- Backfill: ensure every existing team has a chat channel.
insert into public.chat_channels (hackathon_id, team_id, scope, name)
select t.hackathon_id, t.id, 'team', t.name
from public.teams t
left join public.chat_channels c on c.team_id = t.id and c.scope = 'team'
where c.id is null;
