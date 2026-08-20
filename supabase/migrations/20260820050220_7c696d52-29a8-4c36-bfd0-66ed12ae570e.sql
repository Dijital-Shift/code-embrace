-- Backfill bedtime reminder scheduling for users who never re-saved Settings.
UPDATE public.profiles
SET reminder_utc_hour = (
  EXTRACT(HOUR FROM (
    ((CURRENT_DATE + COALESCE(bedtime, TIME '22:00') - INTERVAL '1 hour')
      AT TIME ZONE COALESCE(NULLIF(timezone, ''), 'America/Chicago'))
    AT TIME ZONE 'UTC'
  ))
)::smallint
WHERE reminder_utc_hour IS NULL;

-- Sane default going forward (22:00 Central bedtime -> 21:00 local -> 03:00 UTC).
ALTER TABLE public.profiles ALTER COLUMN reminder_utc_hour SET DEFAULT 3;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  ref_code text;
BEGIN
  INSERT INTO public.profiles (user_id, email, reminder_utc_hour)
  VALUES (new.id, new.email, 3)
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