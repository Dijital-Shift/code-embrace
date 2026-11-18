ALTER TABLE public.lane_invites ADD COLUMN IF NOT EXISTS invitee_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS lane_invites_invitee_pending_idx ON public.lane_invites (invitee_id) WHERE invitee_id IS NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS watch_referral_token text;
COMMENT ON COLUMN public.lane_invites.invitee_id IS 'Set for a direct watch request addressed to one member; only that member may accept or decline.';
COMMENT ON COLUMN public.profiles.watch_referral_token IS 'Token of the most recent Watchman invitation this member opened; used to offer asking that person to watch their own Path.';