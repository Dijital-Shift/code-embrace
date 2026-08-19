# Footer refinement + share card edge cleanup

## 1. Credit line

Change every credit from `Dijital · System 2` to `Dijital System · 02` (floating middle dot before the number), on:
- homepage footer
- terms, privacy, refund pages
- branded email shell

Update the saved user preference so future sessions default to the new form.

## 2. Sexier homepage footer

New structure, top to bottom:

```text
                     [ gold glyph mark ]

   KINGDOM PROTOCOL  |  Accountability with a watchman.
   ─────────────────────── thin gold hairline ───────────────────────
   Sign in                                  "I will stand upon my watch,
   Terms · Privacy · Refund                  and set me upon the tower..."
                                             HABAKKUK 2:1 · KJV

                       Dijital System · 02
```

- Logo mark stays centered with its gold glow.
- Under it, a single lockup line: **Kingdom Protocol** in the Cinzel wordmark treatment, a thin vertical gold divider, then the tagline *Accountability with a watchman.* in muted serif italic.
- Low-opacity gold hairline rule across the column below the lockup.
- Two-column row: left holds **Sign in** (gold, prominent) with the legal links beneath it; right holds Habakkuk 2:1 (KJV) — verse in muted italic serif, reference in small uppercase gold letterspacing, right-aligned.
- Credit line centered at the very bottom, small and dim.
- On mobile the two columns stack, everything centered, verse last before the credit.

Existing colors and tokens only — near-black field, `#c9a84c` gold, muted `#a8a39a` / `#555` text. Same treatment applied consistently to the legal pages' simpler footers is out of scope; only their credit string changes.

## 3. Share card circle cleanup

`public/og-card.png` shows ragged/clipped edges on the seal's outer ring. Fix in `scripts/build-og-card.sh`:
- Trim and square the seal from its true bounding box, then pad a few pixels so the ring is never flush with the canvas edge.
- Build the circular mask slightly inside the square and antialias it, instead of the current hard `circle 200,200 200,2` draw that clips the outermost ring pixels.
- Feather the mask edge by one pixel so the ring meets the dark field cleanly with no stair-stepping.
- Re-export `public/og-card.png`; nothing else on the card changes.

Link previews cache, so shared links may show the old card until platforms re-scrape.
