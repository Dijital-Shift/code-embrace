-- Lane type: avoid (don't do it) or complete (do it)
alter table public.lanes
  add column if not exists lane_type text not null default 'avoid'
  check (lane_type in ('avoid', 'complete'));

-- Replace checkin_time with bedtime (default 10PM)
alter table public.profiles
  rename column checkin_time to bedtime;

alter table public.profiles
  alter column bedtime set default '22:00:00';

-- Store precomputed UTC notification hour for efficient cron matching
-- (bedtime - 1 hour, converted from user timezone to UTC)
alter table public.profiles
  add column if not exists reminder_utc_hour smallint;

-- Max 10 active lanes per user
create or replace function check_user_lane_limit()
returns trigger language plpgsql as $$
begin
  if (
    select count(*) from public.lanes
    where user_id = new.user_id
      and status = 'active'
      and lane_id <> coalesce(new.lane_id, gen_random_uuid())
  ) >= 10 then
    raise exception 'Maximum of 10 active lanes allowed';
  end if;
  return new;
end;
$$;

create trigger enforce_user_lane_limit
before insert or update on public.lanes
for each row execute function check_user_lane_limit();
