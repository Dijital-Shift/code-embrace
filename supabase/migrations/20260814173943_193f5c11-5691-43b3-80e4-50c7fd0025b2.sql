ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS channel text;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_channel_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_channel_check CHECK (channel IS NULL OR channel IN ('push','sms'));