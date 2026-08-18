#!/usr/bin/env bash
# Builds public/og-card.png (1200x630 social share card).
# Swap the mark by pointing MARK at a new file and re-running:
#   bash scripts/build-og-card.sh [path-to-mark.png]
set -euo pipefail

MARK="${1:-assets/og-mark.png}"
OUT="public/og-card.png"
BG="#0a0800"
GOLD="#c9a84c"
FONT_SERIF="${FONT_SERIF:-/tmp/ogfonts/Cinzel.ttf}"
FONT_SANS="${FONT_SANS:-/tmp/ogfonts/WorkSans-Regular.ttf}"
FONT_ITAL="${FONT_ITAL:-/tmp/ogfonts/WorkSans-Italic.ttf}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Mark: drop the white plate around the seal, fit into the left column.
magick "$MARK" -fuzz 12% -transparent white -trim +repage \
  -resize 380x380 "$TMP/mark.png"

magick -size 1200x630 "xc:$BG" \
  "$TMP/mark.png" -gravity west -geometry +60+0 -composite \
  -fill "$GOLD" -colorize 0 \
  \( -size 2x430 "xc:$GOLD" \) -gravity west -geometry +500+0 -composite \
  "$TMP/base.png"

# Right column copy
magick "$TMP/base.png" \
  -font "$FONT_SERIF" -pointsize 66 -fill "$GOLD" -kerning 6 \
  -annotate +560+250 "KINGDOM PROTOCOL" \
  -font "$FONT_SANS" -pointsize 38 -fill "#f2eee4" -kerning 0 \
  -annotate +560+315 "Accountability with a watchman." \
  "$TMP/withtext.png"

# Verse block (wrapped), dimmed
magick -background none -fill "#8f8straight" -size 1x1 xc:none "$TMP/noop.png" 2>/dev/null || true
magick -background none -fill "#9a917d" -font "$FONT_ITAL" -pointsize 25 \
  -size 570x caption:"\"But if the watchman see the sword come, and blow not the trumpet... his blood will I require at the watchman's hand.\"" \
  "$TMP/verse.png"

magick "$TMP/withtext.png" "$TMP/verse.png" -gravity northwest -geometry +560+380 -composite \
  -font "$FONT_SANS" -pointsize 22 -fill "$GOLD" -kerning 3 \
  -gravity northwest -annotate +560+520 "EZEKIEL 33:6 · KJV" \
  "$OUT"

echo "wrote $OUT"
