-- Kingdom Protocol V1 — Initial Schema

-- Profiles (extends Supabase Auth)
create table public.profiles (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  timezone      text not null default 'America/Chicago',
  checkin_time  time not null default '18:00:00',
  status        text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  created_at    timestamptz not null default now(),
  last_active   timestamptz
);

-- Lanes (behavioral rules owned by a user, assigned to a partner)
create table public.lanes (
  lane_id             uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(user_id) on delete cascade,
  partner_id          uuid not null references public.profiles(user_id) on delete restrict,
  title               text not null,
  description         text,
  status              text not null default 'active' check (status in ('active', 'paused', 'archived')),
  escalation_enabled  boolean not null default true,
  created_at          timestamptz not null default now(),
  -- A user cannot assign themselves as their own partner
  constraint no_self_partner check (user_id <> partner_id),
  -- Lane titles must be unique per user
  unique (user_id, title)
);

-- Enforce max 2 active lanes per partner
create or replace function check_partner_lane_limit()
returns trigger language plpgsql as $$
begin
  if (
    select count(*)
    from public.lanes
    where partner_id = new.partner_id
      and status = 'active'
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

-- Check-ins (one per lane per day)
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

-- Notifications (escalation and breach alert log)
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

-- Row Level Security
alter table public.profiles    enable row level security;
alter table public.lanes       enable row level security;
alter table public.checkins    enable row level security;
alter table public.notifications enable row level security;

-- Profiles: users see and update only their own
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = user_id);

-- Lanes: owner full access; partner read-only
create policy "lanes_owner" on public.lanes
  for all using (auth.uid() = user_id);

create policy "lanes_partner_read" on public.lanes
  for select using (auth.uid() = partner_id);

-- Check-ins: owner full access; partner read-only
create policy "checkins_owner" on public.checkins
  for all using (auth.uid() = user_id);

create policy "checkins_partner_read" on public.checkins
  for select using (
    exists (
      select 1 from public.lanes
      where lanes.lane_id = checkins.lane_id
        and lanes.partner_id = auth.uid()
    )
  );

-- Notifications: partner reads their own; system writes via service role
create policy "notifications_partner_read" on public.notifications
  for select using (auth.uid() = partner_id);

-- Indexes
create index on public.lanes (user_id);
create index on public.lanes (partner_id);
create index on public.checkins (lane_id, checkin_date desc);
create index on public.checkins (user_id, checkin_date desc);
create index on public.notifications (partner_id);
create index on public.notifications (lane_id);
