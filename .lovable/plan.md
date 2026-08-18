# Share card typography pass

Only `scripts/build-og-card.sh` changes, then `public/og-card.png` is re-exported. Seal, split layout, background, and the Cinzel wordmark stay exactly as they are.

## Changes

1. **Verse reference right-aligned** — "EZEKIEL 33:6 · KJV" moves from left-aligned under the verse to flush right, matching the right edge of the wrapped verse block (right column starts at x=560, block width 570, so the reference right edge lands at x=1130).
2. **Tagline font** — "Accountability with a watchman." switches from Work Sans to Cormorant Garamond Italic, fetched from Google Fonts into the build cache alongside the existing Cinzel/Work Sans files. Size nudged up slightly to match Work Sans' optical weight since Garamond runs smaller.
3. **Rule under the tagline** — a 1px `#c9a84c` line at ~30% opacity, drawn only as wide as the rendered tagline text (measured, not hardcoded to the column), sitting between the tagline and the verse block. No diamonds or ornaments.

## Technical notes

- Tagline width is measured with ImageMagick's text metrics so the rule tracks the copy if the tagline ever changes.
- Vertical rhythm is re-spaced so the new rule doesn't crowd the verse: tagline, small gap, rule, larger gap, verse, reference.
- Output stays `public/og-card.png` at 1200x630; meta tags in `src/routes/index.tsx` and `src/routes/__root.tsx` already point there and need no edit.

I'll reply with the live URL after export. Link previews cache, so shared links may show the old card until platforms re-scrape.
