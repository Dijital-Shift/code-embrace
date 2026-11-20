ALTER TABLE public.lane_invites ADD COLUMN IF NOT EXISTS sent_to text;
ALTER TABLE public.lane_invites ADD CONSTRAINT lane_invites_sent_to_len CHECK (sent_to IS NULL OR char_length(sent_to) <= 40);
COMMENT ON COLUMN public.lane_invites.sent_to IS 'Owner-only private note naming who a link was sent to; never shown to invitees.';