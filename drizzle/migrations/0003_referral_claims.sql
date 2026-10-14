CREATE TABLE public.referral_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX referral_claims_referrer_idx ON public.referral_claims(referrer_id);
GRANT SELECT ON public.referral_claims TO authenticated;
GRANT ALL ON public.referral_claims TO service_role;
ALTER TABLE public.referral_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Referrer reads own claims" ON public.referral_claims FOR SELECT TO authenticated USING (referrer_id = auth.uid());
INSERT INTO public.referral_claims (referrer_id, referred_user_id, code, created_at)
  SELECT referrer_id, referred_user_id, code, coalesce(claimed_at, now()) FROM public.referrals WHERE referred_user_id IS NOT NULL
  ON CONFLICT (referred_user_id) DO NOTHING;
COMMENT ON COLUMN public.referrals.referred_user_id IS 'DEPRECATED: claims live in referral_claims';
COMMENT ON COLUMN public.referrals.claimed_at IS 'DEPRECATED: claims live in referral_claims';