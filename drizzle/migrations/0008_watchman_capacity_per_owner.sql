CREATE OR REPLACE FUNCTION public.active_watchman_path_count(_owner uuid, _watchman uuid, _exclude uuid)
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*) FROM (
    SELECT l.lane_id FROM public.lanes l JOIN public.path_watchmen pw ON pw.path_id = l.lane_id
    WHERE l.user_id = _owner AND l.status = 'active' AND pw.status = 'active'
      AND pw.watchman_id = _watchman AND l.lane_id IS DISTINCT FROM _exclude
    UNION
    SELECT l.lane_id FROM public.lanes l WHERE l.user_id = _owner AND l.status = 'active'
      AND l.partner_id = _watchman AND l.lane_id IS DISTINCT FROM _exclude
  ) watched;
$$;
REVOKE ALL ON FUNCTION public.active_watchman_path_count(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.active_watchman_path_count(uuid, uuid, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.check_watchman_assignment_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner_id uuid; path_status text;
BEGIN
  IF NEW.status <> 'active' OR NEW.watchman_id IS NULL THEN RETURN NEW; END IF;
  SELECT user_id, status INTO owner_id, path_status FROM public.lanes WHERE lane_id = NEW.path_id;
  IF path_status IS DISTINCT FROM 'active' THEN RETURN NEW; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(owner_id::text || ':' || NEW.watchman_id::text, 0));
  IF public.active_watchman_path_count(owner_id, NEW.watchman_id, NEW.path_id) >= 2 THEN
    RAISE EXCEPTION 'That watchman is already assigned to 2 active paths for this person';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_partner_lane_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE watcher uuid;
BEGIN
  IF NEW.status <> 'active' THEN RETURN NEW; END IF;
  FOR watcher IN
    SELECT NEW.partner_id WHERE NEW.partner_id IS NOT NULL
    UNION SELECT pw.watchman_id FROM public.path_watchmen pw
      WHERE pw.path_id = NEW.lane_id AND pw.status = 'active' AND pw.watchman_id IS NOT NULL
  LOOP
    PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text || ':' || watcher::text, 0));
    IF public.active_watchman_path_count(NEW.user_id, watcher, NEW.lane_id) >= 2 THEN
      RAISE EXCEPTION 'That watchman is already assigned to 2 active paths for this person';
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_path_watchmen_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'active' THEN
    PERFORM pg_advisory_xact_lock(hashtextextended('path-seats:' || NEW.path_id::text, 0));
    IF (SELECT count(*) FROM public.path_watchmen WHERE path_id = NEW.path_id
      AND status = 'active' AND id IS DISTINCT FROM NEW.id) >= 2 THEN
      RAISE EXCEPTION 'A path may have at most 2 active watchmen';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;