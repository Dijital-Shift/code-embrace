
ALTER TABLE public.lanes ADD COLUMN IF NOT EXISTS partner_relationship text;
ALTER TABLE public.lanes DROP CONSTRAINT IF EXISTS lanes_partner_relationship_len;
ALTER TABLE public.lanes ADD CONSTRAINT lanes_partner_relationship_len
  CHECK (partner_relationship IS NULL OR length(partner_relationship) <= 24);

ALTER TABLE public.lane_invites ADD COLUMN IF NOT EXISTS relationship text;
ALTER TABLE public.lane_invites DROP CONSTRAINT IF EXISTS lane_invites_relationship_len;
ALTER TABLE public.lane_invites ADD CONSTRAINT lane_invites_relationship_len
  CHECK (relationship IS NULL OR length(relationship) <= 24);
