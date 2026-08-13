ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

UPDATE public.profiles
SET trial_ends_at = GREATEST(COALESCE(created_at, now()) + interval '30 days', now() + interval '30 days')
WHERE trial_ends_at IS NULL;

ALTER TABLE public.profiles ALTER COLUMN trial_ends_at SET DEFAULT (now() + interval '30 days');

CREATE OR REPLACE FUNCTION public.has_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE((SELECT p.trial_ends_at > now() FROM public.profiles p WHERE p.user_id = _user_id), false)
    OR EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.user_id = _user_id
        AND (
          (s.price_id = 'kp_lifetime_once' AND s.status = 'active')
          OR (s.status IN ('active','trialing','past_due') AND (s.current_period_end IS NULL OR s.current_period_end > now()))
          OR (s.status = 'canceled' AND s.current_period_end IS NOT NULL AND s.current_period_end > now())
        )
    );
$$;

GRANT EXECUTE ON FUNCTION public.has_access(uuid) TO authenticated, service_role;