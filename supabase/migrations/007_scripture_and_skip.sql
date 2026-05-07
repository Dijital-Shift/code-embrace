-- Support scripture verse on lanes
alter table public.lanes add column if not exists support_scripture text;

-- Allow 'skipped' status in checkins (Sabbath skip)
alter table public.checkins drop constraint if exists checkins_status_check;
alter table public.checkins add constraint checkins_status_check
  check (status in ('pending', 'completed', 'missed', 'breached', 'skipped'));
