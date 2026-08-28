REVOKE ALL ON FUNCTION public.sync_lane_primary_watchman() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_path_watchman(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_path_watchman(uuid, uuid) TO authenticated, service_role;