# Silence Rule verse swap + new share card

## 1. Silence Rule verse (src/routes/index.tsx)

Replace the closing scripture block under "The Silence Rule" (currently Ezekiel 33:6) with:

> "I have set watchmen upon thy walls, O Jerusalem, which shall never hold their peace day nor night... keep not silence."
> Isaiah 62:6 · KJV

Same box, same gold italic type, same placement — only the verse text and citation change.

## 2. Share card — split layout

New static PNG at `public/og-card.png`, 1200x630 on `#0a0800`. Uploaded watchtower/shofar seal on the left, thin gold vertical divider, copy stack on the right.

```text
+---------------------------------------------------+
|                  |                                |
|   [ watchtower   |  KINGDOM PROTOCOL              |
|     + shofar     |  Accountability with a         |
|       seal ]     |  watchman.                     |
|                  |                                |
|                  |  "But if the watchman see the  |
|                  |  sword come, and blow not the  |
|                  |  trumpet... his blood will I   |
|                  |  require at the watchman's     |
|                  |  hand."  Ezekiel 33:6 · KJV    |
+---------------------------------------------------+
```

- Left: the uploaded seal, sized to the left ~38% with even margins, vertically centered.
- Divider: 1–2px `#c9a84c` at ~35% opacity, full height minus generous top/bottom inset.
- Right: wordmark in Cinzel gold (`#c9a84c`), tagline in white below it, then the Ezekiel verse smaller and dimmed. Type sized so it stays readable as a small thumbnail; nothing crowds the divider or the edges.
- Build is scripted (`scripts/build-og-card.sh`, ImageMagick) so the mark can be swapped later with a one-line change and a re-run.

### Meta changes

- `src/routes/index.tsx` and `src/routes/__root.tsx`: point `og:image` / `twitter:image` at `https://kingdomprotocol.app/og-card.png`.
- Add `twitter:card: summary_large_image` to the homepage head (root already has it).
- Title/description copy untouched. Old `public/og-card.jpg` removed.

I'll reply with the live URL of the rendered PNG for review. Link previews cache, so shared links may show the old card until platforms re-scrape.
