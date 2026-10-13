-- Self-serve account deletion: reason + 14-day hold on profiles.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deletion_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- Pending-deletion accounts are treated as resting: no access, so no silence
-- rows accrue and no watchman pings fire against them during the hold.
CREATE OR REPLACE FUNCTION public.has_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    COALESCE((SELECT p.deletion_requested_at IS NULL AND p.trial_ends_at > now() FROM public.profiles p WHERE p.user_id = _user_id), false)
    OR EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.user_id = _user_id
        AND NOT COALESCE((SELECT p.deletion_requested_at IS NOT NULL FROM public.profiles p WHERE p.user_id = _user_id), false)
        AND (
          (s.price_id = 'kp_lifetime_once' AND s.status = 'active')
          OR (s.status IN ('active','trialing','past_due') AND (s.current_period_end IS NULL OR s.current_period_end > now()))
          OR (s.status = 'canceled' AND s.current_period_end IS NOT NULL AND s.current_period_end > now())
        )
    );
$function$;