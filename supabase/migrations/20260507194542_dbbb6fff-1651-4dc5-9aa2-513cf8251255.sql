
-- 001 initial schema
create table public.profiles (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  timezone      text not null default 'America/Chicago',
  checkin_time  time not null default '18:00:00',
  status        text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  created_at    timestamptz not null default now(),
  last_active   timestamptz
);

create table public.lanes (
  lane_id             uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(user_id) on delete cascade,
  partner_id          uuid not null references public.profiles(user_id) on delete restrict,
  title               text not null,
  description         text,
  status              text not null default 'active' check (status in ('active', 'paused', 'archived')),
  escalation_enabled  boolean not null default true,
  created_at          timestamptz not null default now(),
  constraint no_self_partner check (user_id <> partner_id),
  unique (user_id, title)
);

create or replace function check_partner_lane_limit()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if (
    select count(*) from public.lanes
    where partner_id = new.partner_id and status = 'active'
      and lane_id <> coalesce(new.lane_id, gen_random_uuid())
  ) >= 2 then
    raise exception 'Partner already assigned to 2 active lanes';
  end if;
  return new;
end;
$$;

create trigger enforce_partner_lane_limit
before insert or update on public.lanes
for each row execute function check_partner_lane_limit();

create table public.checkins (
  checkin_id          uuid primary key default gen_random_uuid(),
  lane_id             uuid not null references public.lanes(lane_id) on delete cascade,
  user_id             uuid not null references public.profiles(user_id) on delete cascade,
  checkin_date        date not null default current_date,
  status              text not null default 'pending' check (status in ('pending', 'completed', 'missed', 'breached')),
  completion_time     timestamptz,
  breach_explanation  text,
  created_at          timestamptz not null default now(),
  unique (lane_id, checkin_date)
);

create table public.notifications (
  notification_id  uuid primary key default gen_random_uuid(),
  lane_id          uuid not null references public.lanes(lane_id) on delete cascade,
  partner_id       uuid not null references public.profiles(user_id) on delete cascade,
  checkin_id       uuid references public.checkins(checkin_id) on delete set null,
  type             text not null check (type in ('missed_checkin', 'breach_report')),
  status           text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  message_content  text,
  sent_at          timestamptz,
  created_at       timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.lanes enable row level security;
alter table public.checkins enable row level security;
alter table public.notifications enable row level security;

create policy "profiles_own" on public.profiles for all using (auth.uid() = user_id);
create policy "lanes_owner" on public.lanes for all using (auth.uid() = user_id);
create policy "lanes_partner_read" on public.lanes for select using (auth.uid() = partner_id);
create policy "checkins_owner" on public.checkins for all using (auth.uid() = user_id);
create policy "checkins_partner_read" on public.checkins for select using (
  exists (select 1 from public.lanes where lanes.lane_id = checkins.lane_id and lanes.partner_id = auth.uid())
);
create policy "notifications_partner_read" on public.notifications for select using (auth.uid() = partner_id);

create index on public.lanes (user_id);
create index on public.lanes (partner_id);
create index on public.checkins (lane_id, checkin_date desc);
create index on public.checkins (user_id, checkin_date desc);
create index on public.notifications (partner_id);
create index on public.notifications (lane_id);

-- 002 phone
alter table public.profiles add column if not exists phone text;

-- 003 push subscriptions
create table public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(user_id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
create policy "push_own" on public.push_subscriptions for all using (auth.uid() = user_id);
create index on public.push_subscriptions (user_id);

-- 004 lane type + bedtime
alter table public.lanes add column if not exists lane_type text not null default 'avoid'
  check (lane_type in ('avoid', 'complete'));
alter table public.profiles rename column checkin_time to bedtime;
alter table public.profiles alter column bedtime set default '22:00:00';
alter table public.profiles add column if not exists reminder_utc_hour smallint;

create or replace function check_user_lane_limit()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if (
    select count(*) from public.lanes
    where user_id = new.user_id and status = 'active'
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

-- 005 partner invite
alter table public.lanes alter column partner_id drop not null;
alter table public.lanes add column if not exists partner_email text;
create index on public.lanes (partner_email) where partner_id is null;

-- 006 names
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text;

-- 007 scripture + skip
alter table public.lanes add column if not exists support_scripture text;
alter table public.checkins drop constraint if exists checkins_status_check;
alter table public.checkins add constraint checkins_status_check
  check (status in ('pending', 'completed', 'missed', 'breached', 'skipped'));

-- 008 scripture array
alter table public.lanes
  alter column support_scripture type text[]
  using case when support_scripture is null then null else array[support_scripture] end;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
