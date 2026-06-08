
-- 1. Notes on paths
ALTER TABLE public.lanes ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.lanes ADD CONSTRAINT lanes_notes_length CHECK (notes IS NULL OR char_length(notes) <= 500);

-- 2. Path watchmen join table (up to 2 per path)
CREATE TABLE public.path_watchmen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id uuid NOT NULL REFERENCES public.lanes(lane_id) ON DELETE CASCADE,
  watchman_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  watchman_email text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','removed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX path_watchmen_unique_email
  ON public.path_watchmen(path_id, lower(watchman_email))
  WHERE status = 'active';

CREATE INDEX path_watchmen_path_idx ON public.path_watchmen(path_id) WHERE status = 'active';
CREATE INDEX path_watchmen_watchman_idx ON public.path_watchmen(watchman_id) WHERE status = 'active';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.path_watchmen TO authenticated;
GRANT ALL ON public.path_watchmen TO service_role;

ALTER TABLE public.path_watchmen ENABLE ROW LEVEL SECURITY;

-- Path owner can manage watchmen on their own paths
CREATE POLICY "owner_manages_watchmen" ON public.path_watchmen
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.lanes l WHERE l.lane_id = path_id AND l.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.lanes l WHERE l.lane_id = path_id AND l.user_id = auth.uid()));

-- Watchman can read rows where they're the watchman
CREATE POLICY "watchman_reads_own_rows" ON public.path_watchmen
  FOR SELECT
  USING (watchman_id = auth.uid());

-- 3. Trigger: max 2 active watchmen per path
CREATE OR REPLACE FUNCTION public.check_path_watchmen_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' AND (
    SELECT count(*) FROM public.path_watchmen
    WHERE path_id = NEW.path_id
      AND status = 'active'
      AND id <> COALESCE(NEW.id, gen_random_uuid())
  ) >= 2 THEN
    RAISE EXCEPTION 'A path may have at most 2 active watchmen';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_path_watchmen_limit
  BEFORE INSERT OR UPDATE ON public.path_watchmen
  FOR EACH ROW EXECUTE FUNCTION public.check_path_watchmen_limit();

-- 4. Trigger: max 2 active watchman assignments per person
CREATE OR REPLACE FUNCTION public.check_watchman_assignment_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.watchman_id IS NOT NULL AND (
    SELECT count(*) FROM public.path_watchmen pw
    JOIN public.lanes l ON l.lane_id = pw.path_id
    WHERE pw.watchman_id = NEW.watchman_id
      AND pw.status = 'active'
      AND l.status = 'active'
      AND pw.id <> COALESCE(NEW.id, gen_random_uuid())
  ) >= 2 THEN
    RAISE EXCEPTION 'That watchman is already assigned to 2 active paths';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_watchman_assignment_limit
  BEFORE INSERT OR UPDATE ON public.path_watchmen
  FOR EACH ROW EXECUTE FUNCTION public.check_watchman_assignment_limit();

-- 5. Backfill from existing lanes.partner_id / partner_email
INSERT INTO public.path_watchmen (path_id, watchman_id, watchman_email, status, created_at)
SELECT
  l.lane_id,
  l.partner_id,
  COALESCE(l.partner_email, (SELECT email FROM public.profiles p WHERE p.user_id = l.partner_id)),
  'active',
  l.created_at
FROM public.lanes l
WHERE (l.partner_id IS NOT NULL OR l.partner_email IS NOT NULL)
  AND l.status = 'active'
ON CONFLICT DO NOTHING;
