-- Run once in Supabase SQL Editor. No service-role key belongs in the app.
begin;
create table if not exists public.player_lives (
 user_id uuid primary key references auth.users(id) on delete cascade,
 lives integer not null default 5 check(lives between 0 and 99),
 points integer not null default 0 check(points between 0 and 90 and points % 10 = 0),
 timezone text not null, topup_day date not null
);
create table if not exists public.life_rounds (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 level integer not null check(level between 1 and 20), outcome text check(outcome in ('win','loss','abandoned')),
 created_at timestamptz not null default now()
);
create unique index if not exists one_open_life_round on public.life_rounds(user_id) where outcome is null;
create table if not exists public.life_ad_tickets (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(), granted boolean not null default false,
 transaction_id text unique
);
create table if not exists public.life_configuration (
 singleton boolean primary key default true check(singleton),
 allow_test_rewards boolean not null default false
);
insert into public.life_configuration(singleton) values(true) on conflict do nothing;
alter table public.player_lives enable row level security;
alter table public.life_rounds enable row level security;
alter table public.life_ad_tickets enable row level security;
alter table public.life_configuration enable row level security;
revoke all on public.player_lives,public.life_rounds,public.life_ad_tickets,public.life_configuration from anon,authenticated;

-- Internal function: locks account until transaction end. Never directly callable by clients.
create or replace function public.life_lock(p_timezone text) returns public.player_lives
language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); z text; d date; s public.player_lives;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 select name into z from pg_timezone_names where name = p_timezone;
 if z is null then z := 'UTC'; end if;
 insert into public.player_lives(user_id,timezone,topup_day) values(u,z,(now() at time zone z)::date) on conflict do nothing;
 select * into s from public.player_lives where user_id=u for update;
 d := (now() at time zone s.timezone)::date;
 if d > s.topup_day then
  update public.player_lives set lives=greatest(5,lives),topup_day=d where user_id=u returning * into s;
 end if;
 return s;
end $$;
revoke all on function public.life_lock(text) from public,anon,authenticated;

create or replace function public.life_action(p_action text,p_timezone text default 'UTC',p_id uuid default null,p_level integer default 1)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare s public.player_lives; r public.life_rounds; tid uuid; done boolean := false; rewarded boolean := false; rid uuid;
begin
 s := public.life_lock(p_timezone);
 if p_action = 'status' then null;
 elsif p_action = 'begin' then
  if p_id is null or p_level not between 1 and 20 then raise exception 'INVALID_ROUND'; end if;
  select * into r from public.life_rounds where id=p_id;
  if found then
   if r.user_id <> auth.uid() or r.outcome is not null then raise exception 'ROUND_CLOSED'; end if;
   rid := r.id;
  else
   if s.lives = 0 then raise exception 'NO_LIVES'; end if;
   update public.life_rounds set outcome='abandoned' where user_id=auth.uid() and outcome is null;
   insert into public.life_rounds(id,user_id,level) values(p_id,auth.uid(),p_level);
   rid := p_id;
  end if;
 elsif p_action in ('win','loss','abandon') then
  select * into r from public.life_rounds where id=p_id and user_id=auth.uid() for update;
  if not found then raise exception 'ROUND_NOT_FOUND'; end if;
  if r.outcome is null then
   if p_action = 'win' then
    rewarded := s.points=90 and s.lives<99;
    update public.player_lives set lives=least(99,lives+case when points=90 then 1 else 0 end),points=(points+10)%100 where user_id=auth.uid() returning * into s;
   elsif p_action = 'loss' then
    update public.player_lives set lives=greatest(0,lives-1) where user_id=auth.uid() returning * into s;
   end if;
   update public.life_rounds set outcome=case p_action when 'win' then 'win' when 'loss' then 'loss' else 'abandoned' end where id=p_id;
  elsif r.outcome <> (case p_action when 'win' then 'win' when 'loss' then 'loss' else 'abandoned' end) then
   raise exception 'ROUND_CLOSED';
  end if;
  done := true;
 elsif p_action = 'ad_ticket' then
  insert into public.life_ad_tickets(user_id) values(auth.uid()) returning id into tid;
 elsif p_action = 'ad_status' then
  select granted into rewarded from public.life_ad_tickets where id=p_id and user_id=auth.uid();
  if not found then raise exception 'TICKET_NOT_FOUND'; end if;
 elsif p_action = 'test_reward' then
  if not (select allow_test_rewards from public.life_configuration where singleton) then raise exception 'TEST_REWARDS_DISABLED'; end if;
  update public.life_ad_tickets set granted=true,transaction_id='test:'||id::text
   where id=p_id and user_id=auth.uid() and not granted and created_at > now()-interval '1 hour' returning id into tid;
  if found then
   update public.player_lives set lives=least(99,lives+1) where user_id=auth.uid() returning * into s;
  end if;
  select granted into rewarded from public.life_ad_tickets where id=p_id and user_id=auth.uid();
 else raise exception 'INVALID_ACTION';
 end if;
 return jsonb_build_object('lives',s.lives,'points',s.points,'day',s.topup_day::text,'round_id',rid,'ticket_id',tid,'settled',done,'rewarded',coalesce(rewarded,false));
end $$;
revoke all on function public.life_action(text,text,uuid,integer) from public,anon;
grant execute on function public.life_action(text,text,uuid,integer) to authenticated;

-- Only a signature-verifying Edge Function holding the server key can call this.
create or replace function public.life_ad_grant(p_ticket uuid,p_transaction text) returns void
language plpgsql security definer set search_path = '' as $$
declare t public.life_ad_tickets;
begin
 select * into t from public.life_ad_tickets where id=p_ticket;
 if not found then raise exception 'TICKET_NOT_FOUND'; end if;
 perform 1 from public.player_lives where user_id=t.user_id for update;
 update public.player_lives set lives=greatest(5,lives),topup_day=(now() at time zone timezone)::date
  where user_id=t.user_id and (now() at time zone timezone)::date > topup_day;
 select * into t from public.life_ad_tickets where id=p_ticket for update;
 if t.granted then return; end if;
 if t.created_at < now()-interval '1 hour' or length(p_transaction) not between 1 and 256 then raise exception 'INVALID_REWARD'; end if;
 update public.life_ad_tickets set granted=true,transaction_id=p_transaction where id=p_ticket;
 update public.player_lives set lives=least(99,lives+1) where user_id=t.user_id;
end $$;
revoke all on function public.life_ad_grant(uuid,text) from public,anon,authenticated;
grant execute on function public.life_ad_grant(uuid,text) to service_role;
commit;
