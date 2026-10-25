ALTER TABLE public.encouragements ADD COLUMN hidden_at timestamptz;
COMMENT ON COLUMN public.encouragements.hidden_at IS 'Recipient-only Path/calendar visibility; original encouragement is retained.';
CREATE OR REPLACE FUNCTION public.guard_encouragement_visibility() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.hidden_at IS NOT NULL THEN RAISE EXCEPTION 'Only the recipient can hide a received encouragement.'; END IF;
  ELSIF NEW.hidden_at IS DISTINCT FROM OLD.hidden_at AND auth.role() IS DISTINCT FROM 'service_role' AND auth.uid() IS DISTINCT FROM OLD.owner_id THEN
    RAISE EXCEPTION 'Only the recipient can hide a received encouragement.';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER encouragement_visibility_guard BEFORE INSERT OR UPDATE ON public.encouragements FOR EACH ROW EXECUTE FUNCTION public.guard_encouragement_visibility();