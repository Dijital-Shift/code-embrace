# Silence Rule verse swap + compact share card

## 1. Silence Rule verse (src/routes/index.tsx)

Replace the closing scripture block under "The Silence Rule" (currently Ezekiel 33:6) with:

> "I have set watchmen upon thy walls, O Jerusalem, which shall never hold their peace day nor night... keep not silence."
> Isaiah 62:6 · KJV

Same box, same gold italic type, same placement — only the verse text and citation change.

## 2. Compact share card

New static PNG at `public/og-card.png`, 1200x630 on `#0a0800`, built for thumbnail legibility: one centered stack, large elements, no marketing hero layout.

```text
+--------------------------------------+
|            [ logo mark ]             |
|         KINGDOM PROTOCOL             |  Cinzel, #c9a84c
|   Accountability with a watchman.    |  white, medium
|                                      |
|  "But if the watchman see the sword  |  small, dim gold
|  come, and blow not the trumpet...   |
|  his blood will I require at the     |
|  watchman's hand." Ezekiel 33:6 KJV  |
+--------------------------------------+
```

- Mark: `public/kingdom-protocol-logo.png` for now, composited from a single source path so swapping in the watchtower/shofar icon later is a one-line change and a re-run.
- Build is scripted (`scripts/build-og-card.sh`, ImageMagick) and committed, so regenerating with a new mark is one command.

### Meta changes

- `src/routes/index.tsx` and `src/routes/__root.tsx`: point `og:image` / `twitter:image` at `https://kingdomprotocol.app/og-card.png`.
- Add `twitter:card: summary_large_image` to the homepage head (root already has it).
- Title/description copy untouched.
- Old `public/og-card.jpg` removed.

I'll reply with the live URL of the rendered PNG for review. Link previews cache, so shared links may show the old card until platforms re-scrape.
