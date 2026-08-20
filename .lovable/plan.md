# Homepage metadata title update

Update the homepage metadata title to include "Accountability with a watchman" as requested.

## New copy

- Title: `Kingdom Protocol - Accountability with a watchman`

## Technical detail

In `src/routes/index.tsx` `head()`:
- `title` entry → `Kingdom Protocol - Accountability with a watchman`
- `og:title` → same
- `twitter:title` → same

Untouched: description, `og:description`, `twitter:description`, `og:image`, `twitter:image`, `og:url`, canonical, and all other tags/routes.

## Verification

Load the homepage and confirm the `<title>` tag and the `og:title` / `twitter:title` meta tags reflect the new text.
