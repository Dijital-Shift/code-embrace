# Homepage site metadata update

Update the title and description on the homepage only. The share card image stays exactly as it is.

## New copy

- Title: `Kingdom Protocol — Kingdom-minded accountability.`
- Description: `Kingdom-minded accountability. Daily check-ins, paired with a real watchman — before the silence becomes a fall.`

## Technical detail

In `src/routes/index.tsx` `head()`:
- `title` entry → new title
- `meta name="description"` → new description
- `og:title` → new title (matches)
- `og:description` → new description (matches)

Untouched: `og:image`, `twitter:image`, `og:url`, and all other tags/routes.

Note: link-preview services cache old metadata, so shared links may show the previous title until they re-scrape.
