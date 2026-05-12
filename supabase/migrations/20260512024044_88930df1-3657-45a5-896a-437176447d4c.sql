-- Watchman invites: secure link-based invite flow
CREATE TABLE public.lane_invites (
  invite_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lane_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '48 hours'),
  accepted_by uuid,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lane_invites_token ON public.lane_invites(token);
CREATE INDEX idx_lane_invites_lane ON public.lane_invites(lane_id);
CREATE INDEX idx_lane_invites_owner ON public.lane_invites(owner_id);

ALTER TABLE public.lane_invites ENABLE ROW LEVEL SECURITY;

-- Owner can read, create, update (revoke) their own invites
CREATE POLICY invites_owner_select ON public.lane_invites
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY invites_owner_insert ON public.lane_invites
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY invites_owner_update ON public.lane_invites
  FOR UPDATE USING (auth.uid() = owner_id);

-- Public preview via SECURITY DEFINER function (no direct table read by anon)
CREATE OR REPLACE FUNCTION public.get_invite_preview(_token text)
RETURNS TABLE (
  status text,
  expired boolean,
  lane_title text,
  owner_first_name text,
  owner_email text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv record;
BEGIN
  SELECT i.status, i.expires_at, i.lane_id, i.owner_id
    INTO inv
  FROM public.lane_invites i
  WHERE i.token = _token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    inv.status,
    (inv.expires_at < now()) AS expired,
    l.title AS lane_title,
    p.first_name AS owner_first_name,
    p.email AS owner_email
  FROM public.lanes l
  LEFT JOIN public.profiles p ON p.user_id = inv.owner_id
  WHERE l.lane_id = inv.lane_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_invite_preview(text) TO anon, authenticated;