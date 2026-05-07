-- Convert support_scripture from single text to text[] (up to 3 verses)
ALTER TABLE public.lanes
  ALTER COLUMN support_scripture TYPE text[]
  USING CASE
    WHEN support_scripture IS NULL THEN NULL
    ELSE ARRAY[support_scripture]
  END;
