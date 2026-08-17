# App icon and share card

## What's there right now

One file — `public/kingdom-protocol-logo.png`, 495x474, transparent background — is doing four jobs at once: favicon, Apple touch icon, both manifest icons, and the social share image. That causes real problems:

- **Not square.** 495x474 is declared in the manifest as both `512x512` and `192x192`. Neither is true, so phones rescale and squash it.
- **Transparent background.** iOS and Android paint their own backdrop behind it. The "KINGDOM PROTOCOL" wordmark in the logo is near-white, so on a white home screen it vanishes.
- **Too much detail for a small square.** At 32-48px the throne, the pillars, and the two lines of letterspaced type collapse into a gold smudge.
- **No maskable version.** Android crops icons into a circle/squircle; the ring and the wordmark get clipped.
- **The share card is not a share card.** `og:image` points at this same transparent logo via a relative path (`/kingdom-protocol-logo.png`). Relative URLs are ignored by most scrapers, and the shape is wrong — link previews want a 1200x630 landscape image. Right now a shared link shows a blank or letterboxed tile.

## What to build

### Icon variations (square, 1024x1024, solid dark background, no wordmark)

1. **Throne + arch** — the existing gold throne-in-archway motif alone, cropped tight, on the near-black `#0a0800` field. Closest to the current mark.
2. **Crown** — just the crown from the top of the logo, gold, centered, generous margin. Simplest read at 32px.
3. **Gold ring + throne silhouette** — the circular ring kept as a border, a simplified throne inside it. Keeps the "seal" feel of the current logo.

For whichever is chosen, produce both a normal icon and a **maskable** variant with ~20% safe-area padding, and update `manifest.json` with correctly sized 192 / 512 / maskable entries plus the favicon and Apple touch icon links.

### Share card variations (1200x630)

1. **Wordmark on black** — Cinzel "KINGDOM PROTOCOL" in gold, the tagline underneath, thin gold hairline rules, logo mark small at top. Quiet and typographic.
2. **Throne left, copy right** — the gold throne mark on the left third, headline and tagline stacked on the right, dark gradient field.
3. **Verse card** — Ezekiel 33:6 in small gold type across the top, wordmark centered large below, credit line at the bottom. Matches the email shell.

## Technical notes

- New assets go in `public/` (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `favicon.png`, `og-card.jpg`).
- `og:image` and `twitter:image` must be moved to the **absolute** published URL (`https://kingdomprotocol.app/og-card.jpg`) — relative paths do not work for scrapers.
- Head links in `src/routes/__root.tsx` get updated to the new files; `public/manifest.json` gets the real icon set.
- Push service worker (`public/sw.js`) is untouched.

## First step

Generate all three icon options and all three share-card options so they can be compared side by side, then wire up the two picks.
