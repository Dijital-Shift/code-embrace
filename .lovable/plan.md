# Share card: rule and tagline alignment

Keep the seal, split layout, background, wordmark, verse, and reference exactly as-is. Only change the relationship between the wordmark, the rule, and the tagline.

## Changes

1. **Rule matches the wordmark width** — the horizontal gold line is drawn from the left edge of "KINGDOM PROTOCOL" to its right edge, instead of the narrower tagline width.
2. **Tagline centered under the wordmark block** — "Accountability with a watchman." is positioned so its center aligns with the center of the wordmark/rule block above it.

## Technical notes

- Measure the rendered wordmark width in ImageMagick so the rule can track it.
- Compute the tagline x-offset as `COL_X + (wordmark_width - tagline_width) / 2` so it is centered under the rule.
- Re-export `public/og-card.png` and reply with the live URL.
