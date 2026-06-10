
-- 1. profiles: gender + dismissed watchman prompt
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS dismissed_watchman_prompt boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_gender_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_gender_check CHECK (gender IS NULL OR gender IN ('male','female'));

-- 2. path_watchmen: relationship label
ALTER TABLE public.path_watchmen
  ADD COLUMN IF NOT EXISTS relationship text;

ALTER TABLE public.path_watchmen DROP CONSTRAINT IF EXISTS path_watchmen_relationship_len;
ALTER TABLE public.path_watchmen
  ADD CONSTRAINT path_watchmen_relationship_len CHECK (relationship IS NULL OR length(relationship) <= 24);

-- 3. referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz
);

CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON public.referrals(referrer_id);
CREATE UNIQUE INDEX IF NOT EXISTS referrals_referrer_unique ON public.referrals(referrer_id);

GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Referrer can read own referrals" ON public.referrals;
CREATE POLICY "Referrer can read own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (referrer_id = auth.uid());

DROP POLICY IF EXISTS "Referrer can create own code" ON public.referrals;
CREATE POLICY "Referrer can create own code" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (referrer_id = auth.uid());

-- 4. encouragements
CREATE TABLE IF NOT EXISTS public.encouragements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watchman_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lane_id uuid NOT NULL REFERENCES public.lanes(lane_id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT encouragements_body_len CHECK (length(body) BETWEEN 1 AND 280)
);

CREATE INDEX IF NOT EXISTS encouragements_watchman_idx ON public.encouragements(watchman_id);
CREATE INDEX IF NOT EXISTS encouragements_owner_idx ON public.encouragements(owner_id);
CREATE INDEX IF NOT EXISTS encouragements_lane_idx ON public.encouragements(lane_id);

GRANT SELECT, INSERT ON public.encouragements TO authenticated;
GRANT ALL ON public.encouragements TO service_role;

ALTER TABLE public.encouragements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Watchman or owner can read encouragements" ON public.encouragements;
CREATE POLICY "Watchman or owner can read encouragements" ON public.encouragements
  FOR SELECT TO authenticated
  USING (watchman_id = auth.uid() OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Active watchman can insert encouragements" ON public.encouragements;
CREATE POLICY "Active watchman can insert encouragements" ON public.encouragements
  FOR INSERT TO authenticated
  WITH CHECK (
    watchman_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.lanes l
      WHERE l.lane_id = encouragements.lane_id
        AND l.user_id = encouragements.owner_id
        AND l.status = 'active'
        AND (
          l.partner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.path_watchmen pw
            WHERE pw.path_id = l.lane_id
              AND pw.watchman_id = auth.uid()
              AND pw.status = 'active'
          )
        )
    )
  );

-- 5. handle_new_user: stamp referral code if present
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  ref_code text;
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (user_id) DO NOTHING;

  ref_code := lower(coalesce(new.raw_user_meta_data ->> 'ref', ''));
  IF ref_code <> '' THEN
    UPDATE public.referrals
       SET referred_user_id = new.id,
           claimed_at = now()
     WHERE code = ref_code
       AND referred_user_id IS NULL
       AND referrer_id <> new.id;
  END IF;

  RETURN new;
END;
$function$;
