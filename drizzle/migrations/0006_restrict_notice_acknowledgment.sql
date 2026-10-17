REVOKE UPDATE ON public.notifications FROM authenticated;
GRANT UPDATE (acknowledged_at) ON public.notifications TO authenticated;
COMMENT ON COLUMN public.notifications.acknowledged_at IS 'Recipient acknowledgment of a Watch ended notice; independent of push delivery status.';