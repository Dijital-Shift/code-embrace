ALTER TABLE public.lanes DROP COLUMN IF EXISTS escalation_enabled;
ALTER TABLE public.lanes ADD COLUMN IF NOT EXISTS ends_at date;