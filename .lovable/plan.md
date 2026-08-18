# New share card with the watchtower + shofar seal

Rebuild `public/og-card.jpg` (1200x630) using the uploaded gold seal art in place of the throne image. Share-card only — no site logo, icons, favicon, or PWA assets change.

## Layout

```text
+----------------------------------------------------------+
|              |  KINGDOM PROTOCOL   (Cinzel, gold)         |
|   [ gold     |  Accountability with a watchman.           |
|     seal ]   |  ------------------------------            |
|              |  "But if the watchman see the sword come,  |
|              |   and blow not the trumpet... his blood    |
|              |   will I require at the watchman's hand."  |
|              |  Ezekiel 33:6 (KJV)                        |
+----------------------------------------------------------+
```

- Background: near-black (`#0a0800`) to match the current card.
- Left: the seal, sized to fill the left third with breathing room.
- Right: wordmark, tagline, thin gold rule, then the Ezekiel excerpt in a smaller italic serif with the citation in gold.

## Technical detail

- Composite with ImageMagick from `/mnt/user-uploads/ChatGPT_Image_Aug_18_2026_03_01_05_PM.png`, output to `public/og-card.jpg`.
- Filename and meta tags stay as-is (`https://kingdomprotocol.app/og-card.jpg` in `src/routes/__root.tsx` and `src/routes/index.tsx`), so nothing else needs editing.
- Preview the result before finishing.

Note: platforms cache link previews, so shared links may show the old card until they re-scrape.
