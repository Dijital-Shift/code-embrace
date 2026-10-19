ALTER TABLE public.lanes ADD COLUMN starts_at date;
COMMENT ON COLUMN public.lanes.starts_at IS 'First accountable day in the owner timezone; creation timestamp remains audit metadata.';
UPDATE public.lanes l SET starts_at = (l.created_at AT TIME ZONE COALESCE(NULLIF(p.timezone, ''), 'America/Chicago'))::date FROM public.profiles p WHERE p.user_id = l.user_id AND l.starts_at IS NULL;
UPDATE public.lanes SET starts_at = created_at::date WHERE starts_at IS NULL;
UPDATE public.lanes l SET starts_at = DATE '2026-10-19' WHERE l.lane_id = '232c69b6-5ec3-40c2-b9c4-e09ca23be46b' AND l.status = 'active' AND NOT EXISTS (SELECT 1 FROM public.checkins c WHERE c.lane_id=l.lane_id);
CREATE OR REPLACE FUNCTION public.set_path_accountability_start() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE tz text; bed time; local_now timestamp; day date; cutoff integer;
BEGIN
  SELECT COALESCE(NULLIF(timezone, ''), 'America/Chicago'), COALESCE(bedtime::time, TIME '22:00') INTO tz, bed FROM public.profiles WHERE user_id = NEW.user_id;
  tz := COALESCE(tz, 'America/Chicago'); bed := COALESCE(bed, TIME '22:00');
  local_now := CURRENT_TIMESTAMP AT TIME ZONE tz; day := local_now::date;
  cutoff := GREATEST(0, EXTRACT(hour FROM bed)::integer * 60 + EXTRACT(minute FROM bed)::integer - 60);
  IF NEW.starts_at IS NULL THEN
    NEW.starts_at := day + CASE WHEN EXTRACT(hour FROM local_now)::integer * 60 + EXTRACT(minute FROM local_now)::integer >= cutoff THEN 1 ELSE 0 END;
  END IF;
  IF NEW.starts_at < day OR NEW.starts_at > day + 1 THEN RAISE EXCEPTION 'Choose today or tomorrow as the Path start.'; END IF;
  IF NEW.ends_at IS NOT NULL AND NEW.ends_at < NEW.starts_at THEN RAISE EXCEPTION 'The end date cannot be before the Path starts.'; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.set_path_accountability_start() FROM PUBLIC;
CREATE TRIGGER path_accountability_start BEFORE INSERT ON public.lanes FOR EACH ROW EXECUTE FUNCTION public.set_path_accountability_start();
CREATE OR REPLACE FUNCTION public.guard_checkin_path_start() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE start_day date;
BEGIN
  SELECT starts_at INTO start_day FROM public.lanes WHERE lane_id=NEW.lane_id;
  IF NEW.checkin_date < start_day THEN RAISE EXCEPTION 'This Path has not started for that day.'; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_checkin_path_start() FROM PUBLIC;
CREATE TRIGGER checkin_path_start BEFORE INSERT OR UPDATE ON public.checkins FOR EACH ROW EXECUTE FUNCTION public.guard_checkin_path_start();