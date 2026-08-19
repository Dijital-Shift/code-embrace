# New seal for the share card, new glyph for the site

Yes — the two uploads split cleanly:

- **Detailed circular gold seal** (tower + shofar in a ring) → the share card mark.
- **Flat gold tower + shofar glyph, transparent** → the site logo mark.

## Changes

1. **Share card** — replace `assets/og-mark.png` with the new circular seal and re-run `scripts/build-og-card.sh`. Layout, divider, wordmark, tagline, rule, and Ezekiel 33:6 all stay exactly as they are; only the mark changes. Re-export `public/og-card.png`.
2. **Site logo mark** — the flat glyph replaces `public/kingdom-protocol-logo.png` everywhere it's used today:
   - homepage footer (`src/routes/index.tsx`)
   - sign-in page (`src/routes/login.tsx`)
   - how-it-works page
   - both invite pages
   - branded email header (`src/lib/email-templates/_brand.tsx`)
3. **Icons** — regenerate `favicon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, and `apple-touch-icon.png` from the new glyph on the near-black `#0a0800` field, with the maskable variant getting ~20% safe-area padding.

## Technical notes

- New glyph is written as a real file in `public/` (favicons and manifest icons must be real files, not CDN pointers).
- The glyph has a white background in the upload; it gets keyed out to transparency before compositing, same `-fuzz` treatment already used in the card script.
- Since the site mark file keeps its existing path, no component markup changes are needed beyond the sizing already in place.
- Link previews cache, so shared links may show the old card until platforms re-scrape.

## Open question

Should the site's flat glyph keep its current sizes on each page, or do you want it larger now that it's a simpler shape? I'll keep current sizes unless you say otherwise.
