# Share card update — use the PWA icon mark

The social share card (`og-card.jpg`) currently shows the circular seal with text. The user wants the share-card image to be the same mark as the PWA/app icon: the gold watchtower-and-shofar logo on a black background.

## What will change

1. Replace `public/og-card.jpg` and `public/og-card.png` with a 1200×630 share card built from the existing PWA icon source (`public/kingdom-protocol-logo.png` or `public/icon-512.png`), centered on the site black background `#0a0800`.
2. Bump the cache-busting query string from `?v=2` to `?v=3` everywhere the share card is referenced.
3. Update `og:image:alt` and `twitter:image:alt` to match the new image.

## Files to edit

- `public/og-card.jpg` — regenerate from the PWA icon mark.
- `public/og-card.png` — regenerate alongside.
- `src/routes/__root.tsx` — update `og:image`, `og:image:secure_url`, `twitter:image` to `?v=3`; update alt text.
- `src/routes/index.tsx` — update the same three image URLs and alt text.

## Untouched

- The PWA/app icons themselves (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon.png`, `manifest.json`).
- The homepage title/description change from the previous task.

## Verification

Inspect the new `og-card.jpg` and confirm the homepage meta tags point to `?v=3`. Note: social platforms cache share-card previews, so the updated image may not appear immediately in iMessage/WhatsApp until they re-scrape.
