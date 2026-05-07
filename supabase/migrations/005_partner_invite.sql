-- Allow partner_id to be null until invite is accepted
alter table public.lanes
  alter column partner_id drop not null;

-- Store invited partner email for pending invites
alter table public.lanes
  add column if not exists partner_email text;

-- Index for fast lookup when partner registers
create index on public.lanes (partner_email) where partner_id is null;
