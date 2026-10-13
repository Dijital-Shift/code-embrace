ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_avatar_url_size CHECK (avatar_url IS NULL OR length(avatar_url) <= 200000);

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  ref_code text;
BEGIN
  INSERT INTO public.profiles (user_id, email, reminder_utc_hour)
  VALUES (new.id, new.email, 3)
  ON CONFLICT (user_id) DO NOTHING;

  ref_code := lower(coalesce(new.raw_user_meta_data ->> 'ref', ''));
  IF ref_code <> '' THEN
    UPDATE public.referrals
       SET referred_user_id = new.id,
           claimed_at = now()
     WHERE code = ref_code
       AND referred_user_id IS NULL
       AND referrer_id <> new.id;
  END IF;

  -- Every new member starts with the Send Scripture path; removable later.
  BEGIN
    INSERT INTO public.lanes (user_id, title, description, lane_type, status, support_scripture)
    VALUES (
      new.id,
      'Send Scripture',
      'Send a verse to someone every day — a word in season, not a sermon. Easy way to do this: SendScripture.xyz',
      'complete',
      'active',
      ARRAY[
        'Preach the word; be instant in season, out of season; reprove, rebuke, exhort with all longsuffering and doctrine. — 2 Timothy 4:2 (KJV)',
        'Go ye into all the world, and preach the gospel to every creature. — Mark 16:15 (KJV)',
        'But exhort one another daily, while it is called To day; lest any of you be hardened through the deceitfulness of sin. — Hebrews 3:13 (KJV)'
      ]
    );
  EXCEPTION WHEN others THEN
    -- Never block signup over the starter path.
    NULL;
  END;

  RETURN new;
END;
$function$;