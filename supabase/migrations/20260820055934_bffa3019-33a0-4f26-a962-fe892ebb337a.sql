-- 1) Purge phantom check-ins dated before the path existed (in the owner's timezone)
DELETE FROM public.checkins c
USING public.lanes l
LEFT JOIN public.profiles p ON p.user_id = l.user_id
WHERE c.lane_id = l.lane_id
  AND c.checkin_date < ((l.created_at AT TIME ZONE COALESCE(p.timezone, 'America/Chicago'))::date);

-- 2) Permanent guard: a check-in can never predate its path
CREATE OR REPLACE FUNCTION public.check_checkin_not_before_path()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  created_local date;
BEGIN
  SELECT (l.created_at AT TIME ZONE COALESCE(p.timezone, 'America/Chicago'))::date
    INTO created_local
  FROM public.lanes l
  LEFT JOIN public.profiles p ON p.user_id = l.user_id
  WHERE l.lane_id = NEW.lane_id;

  IF created_local IS NOT NULL AND NEW.checkin_date < created_local THEN
    RAISE EXCEPTION 'A check-in cannot predate the path (% is before %)', NEW.checkin_date, created_local;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_checkin_not_before_path ON public.checkins;
CREATE TRIGGER enforce_checkin_not_before_path
BEFORE INSERT OR UPDATE ON public.checkins
FOR EACH ROW EXECUTE FUNCTION public.check_checkin_not_before_path();