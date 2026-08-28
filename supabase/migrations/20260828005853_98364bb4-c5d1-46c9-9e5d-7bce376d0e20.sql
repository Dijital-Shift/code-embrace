-- ============ 1. Helper: is this user an active watchman on this path? ============
CREATE OR REPLACE FUNCTION public.is_path_watchman(_path_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.path_watchmen pw
    WHERE pw.path_id = _path_id
      AND pw.watchman_id = _user_id
      AND pw.status = 'active'
  );
$$;

-- ============ 2. Backfill path_watchmen from lanes.partner_id + accepted invites ============
ALTER TABLE public.path_watchmen DISABLE TRIGGER USER;

INSERT INTO public.path_watchmen (path_id, watchman_id, watchman_email, status, relationship)
SELECT l.lane_id, l.partner_id, COALESCE(l.partner_email, p.email, ''), 'active', l.partner_relationship
FROM public.lanes l
LEFT JOIN public.profiles p ON p.user_id = l.partner_id
WHERE l.partner_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.path_watchmen pw
    WHERE pw.path_id = l.lane_id AND pw.watchman_id = l.partner_id
  );

INSERT INTO public.path_watchmen (path_id, watchman_id, watchman_email, status, relationship)
SELECT i.lane_id, i.accepted_by, COALESCE(p.email, ''), 'active', i.relationship
FROM public.lane_invites i
JOIN public.lanes l ON l.lane_id = i.lane_id
LEFT JOIN public.profiles p ON p.user_id = i.accepted_by
WHERE i.status = 'accepted'
  AND i.accepted_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.path_watchmen pw
    WHERE pw.path_id = i.lane_id AND pw.watchman_id = i.accepted_by
  );

ALTER TABLE public.path_watchmen ENABLE TRIGGER USER;

-- ============ 3. Keep lanes.partner_id synced to the FIRST active watchman ============
CREATE OR REPLACE FUNCTION public.sync_lane_primary_watchman()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target uuid := COALESCE(NEW.path_id, OLD.path_id);
  prim record;
BEGIN
  SELECT pw.watchman_id, pw.watchman_email, pw.relationship
    INTO prim
  FROM public.path_watchmen pw
  WHERE pw.path_id = target AND pw.status = 'active' AND pw.watchman_id IS NOT NULL
  ORDER BY pw.created_at ASC
  LIMIT 1;

  UPDATE public.lanes
     SET partner_id = prim.watchman_id,
         partner_email = prim.watchman_email,
         partner_relationship = prim.relationship
   WHERE lane_id = target
     AND partner_id IS DISTINCT FROM prim.watchman_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_primary_watchman ON public.path_watchmen;
CREATE TRIGGER sync_primary_watchman
AFTER INSERT OR UPDATE OR DELETE ON public.path_watchmen
FOR EACH ROW EXECUTE FUNCTION public.sync_lane_primary_watchman();

-- Run it once for existing rows (e.g. the accepted invite whose lane had NULL partner_id)
UPDATE public.lanes l
   SET partner_id = pw.watchman_id,
       partner_email = COALESCE(pw.watchman_email, l.partner_email),
       partner_relationship = COALESCE(pw.relationship, l.partner_relationship)
  FROM (
    SELECT DISTINCT ON (path_id) path_id, watchman_id, watchman_email, relationship
    FROM public.path_watchmen
    WHERE status = 'active' AND watchman_id IS NOT NULL
    ORDER BY path_id, created_at ASC
  ) pw
 WHERE pw.path_id = l.lane_id
   AND l.partner_id IS DISTINCT FROM pw.watchman_id;

-- ============ 4. RLS: any active watchman (not just the primary) can read ============
DROP POLICY IF EXISTS lanes_watchmen_read ON public.lanes;
CREATE POLICY lanes_watchmen_read ON public.lanes
FOR SELECT TO authenticated
USING (public.is_path_watchman(lane_id, auth.uid()));

DROP POLICY IF EXISTS checkins_watchmen_read ON public.checkins;
CREATE POLICY checkins_watchmen_read ON public.checkins
FOR SELECT TO authenticated
USING (public.is_path_watchman(lane_id, auth.uid()));

-- ============ 5. Encouragement -> triggering check-in linkage ============
ALTER TABLE public.encouragements
  ADD COLUMN IF NOT EXISTS checkin_id uuid REFERENCES public.checkins(checkin_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS encouragements_checkin_id_idx ON public.encouragements(checkin_id);
CREATE INDEX IF NOT EXISTS path_watchmen_watchman_idx ON public.path_watchmen(watchman_id, status);