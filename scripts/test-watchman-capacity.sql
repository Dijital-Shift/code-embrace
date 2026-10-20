-- Exercise both live database triggers without retaining fixtures or sending alerts.
DO $$
DECLARE
  fixture uuid;
  watcher uuid := '9193b204-c2b1-45be-a432-5987d1b00fda';
  owner_id uuid := 'ac3f83c8-1f09-4252-8639-1549862ab086';
  other_owner uuid := '2544c317-5451-4da1-ae84-7dd2dfb06159';
BEGIN
  IF (SELECT count(*) FROM public.path_watchmen pw JOIN public.lanes l ON l.lane_id=pw.path_id
      WHERE l.user_id=owner_id AND pw.watchman_id=watcher AND pw.status='active' AND l.status='active') <> 2 THEN
    RAISE EXCEPTION 'Test requires two existing active assignments';
  END IF;
  BEGIN
    INSERT INTO public.lanes(user_id,title,starts_at)
      VALUES(owner_id,'Capacity verification ' || gen_random_uuid(),current_date + 1)
      RETURNING lane_id INTO fixture;
    BEGIN
      INSERT INTO public.path_watchmen(path_id,watchman_id,watchman_email)
        VALUES(fixture,watcher,'verification@example.invalid');
      RAISE EXCEPTION 'Third assignment was incorrectly allowed';
    EXCEPTION WHEN raise_exception THEN
      IF SQLERRM NOT LIKE '%already assigned to 2 active paths for this person%' THEN RAISE; END IF;
    END;
    BEGIN
      UPDATE public.lanes SET partner_id=watcher WHERE lane_id=fixture;
      RAISE EXCEPTION 'Legacy third assignment was incorrectly allowed';
    EXCEPTION WHEN raise_exception THEN
      IF SQLERRM NOT LIKE '%already assigned to 2 active paths for this person%' THEN RAISE; END IF;
    END;
    INSERT INTO public.lanes(user_id,title,starts_at)
      VALUES(other_owner,'Capacity verification ' || gen_random_uuid(),current_date + 1)
      RETURNING lane_id INTO fixture;
    INSERT INTO public.path_watchmen(path_id,watchman_id,watchman_email)
      VALUES(fixture,watcher,'verification@example.invalid');
    IF NOT EXISTS (SELECT 1 FROM public.path_watchmen WHERE path_id=fixture AND watchman_id=watcher AND status='active') THEN
      RAISE EXCEPTION 'Other person assignment was not saved';
    END IF;
    RAISE EXCEPTION USING ERRCODE='ZX001', MESSAGE='Verification passed; roll back fixtures';
  EXCEPTION WHEN SQLSTATE 'ZX001' THEN NULL;
  END;
END;
$$;