# Fix the link preview card

## What's happening

The live page does serve the right tags, and the image loads fine:

- `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card` are all present on `https://kingdomprotocol.app/`
- `https://kingdomprotocol.app/og-card.png` returns HTTP 200, 1200x630, ~356 KB

So the card isn't broken because the tags are missing. What's missing is the extra metadata that strict scrapers (iMessage, WhatsApp, LinkedIn, Slack) require before they'll render a large image card: image width/height, image MIME type, a secure URL, and a site name. Without those, several of them silently fall back to a bare text/line preview — exactly what you saw. The PNG's size and format also work against it: iMessage and WhatsApp prefer a JPEG under ~300 KB and can skip large PNGs.

## The fix

1. **Export a JPEG version of the share card** (`public/og-card.jpg`, quality tuned to land under ~250 KB) from the existing card build script, keeping the PNG as-is. Point the meta tags at the JPEG.
2. **Add the missing preview metadata** in `src/routes/index.tsx` (and mirror the defaults in `src/routes/__root.tsx`):
   - `og:image:secure_url`, `og:image:width` (1200), `og:image:height` (630), `og:image:type` (image/jpeg), `og:image:alt`
   - `og:site_name`, `og:locale`
   - `twitter:title`, `twitter:description`, `twitter:image:alt`
   - a canonical link to `https://kingdomprotocol.app/`
3. **Cache-bust** the image filename reference so scrapers that already cached the failed fetch pull the new one instead of the stale miss.
4. **Verify** by fetching the published page with a scraper user-agent and confirming every tag renders, then re-run a preview fetch of the image URL to confirm type, size, and status.

## After it ships

Link previews are cached hard by each platform. Once this is live, re-share the link — and if a specific app still shows the old bare line, that platform's cache needs a few hours or a re-scrape from its own debug tool.

## Technical notes

- Card generation stays in `scripts/build-og-card.sh`; add a JPEG export step alongside the PNG output.
- Route `head()` metadata only; no app logic, styling, or backend changes.
