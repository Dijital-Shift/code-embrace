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
FONT_TAG="${FONT_TAG:-/tmp/ogfonts/CormorantGaramond-Italic.ttf}"

COL_X=560         # left edge of the right column
COL_W=570         # width of the right column
TAGLINE="Accountability with a watchman."
TAG_SIZE=44

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Mark: drop the white plate, square it, then mask to a circle so the seal
# sits on the card background instead of inside a visible box.
magick "$MARK" -fuzz 12% -transparent white -trim +repage \
  -background none -gravity center -extent "%[fx:max(w,h)]x%[fx:max(w,h)]" \
  -resize 400x400 "$TMP/sq.png"
magick -size 400x400 xc:none -fill white -draw "circle 200,200 200,2" "$TMP/mask.png"
magick "$TMP/sq.png" "$TMP/mask.png" -alpha off -compose CopyOpacity -composite "$TMP/mark.png"


magick -size 1200x630 "xc:$BG" \
  "$TMP/mark.png" -gravity west -geometry +60+0 -composite \
  -fill "$GOLD" -colorize 0 \
  \( -size 2x430 "xc:$GOLD" \) -gravity west -geometry +500+0 -composite \
  "$TMP/base.png"

# Measure the wordmark so the rule spans its full width.
WORDMARK_W=$(magick -font "$FONT_SERIF" -pointsize 46 -kerning 4 label:"KINGDOM PROTOCOL" -format "%w" info:)
# Measure the tagline so it can be centered under the wordmark.
TAG_W=$(magick -font "$FONT_TAG" -pointsize $TAG_SIZE label:"$TAGLINE" -format "%w" info:)
TAG_OFFSET=$((COL_X + (WORDMARK_W - TAG_W) / 2))

# Wordmark + tagline (tagline in Cormorant Garamond Italic)
magick "$TMP/base.png" \
  -font "$FONT_SERIF" -pointsize 46 -fill "$GOLD" -kerning 4 \
  -annotate +${COL_X}+250 "KINGDOM PROTOCOL" \
  -font "$FONT_TAG" -pointsize $TAG_SIZE -fill "#f2eee4" -kerning 0 \
  -annotate +${TAG_OFFSET}+350 "$TAGLINE" \
  "$TMP/withtext.png"

# Thin gold rule between the wordmark and the tagline, spanning the wordmark width.
magick "$TMP/withtext.png" \
  \( -size ${WORDMARK_W}x1 "xc:$GOLD" -alpha set -channel A -evaluate set 30% +channel \) \
  -gravity northwest -geometry +${COL_X}+285 -composite \
  "$TMP/withrule.png"

# Verse block (wrapped), dimmed
magick -background none -fill "#9a917d" -font "$FONT_ITAL" -pointsize 25 \
  -size ${COL_W}x caption:"\"But if the watchman see the sword come, and blow not the trumpet... his blood will I require at the watchman's hand.\"" \
  "$TMP/verse.png"

# Reference, right-aligned to the verse block's right edge.
magick -background none -fill "$GOLD" -font "$FONT_SANS" -pointsize 22 -kerning 3 \
  -size ${COL_W}x -gravity east caption:"EZEKIEL 33:6 · KJV" \
  "$TMP/ref.png"

magick "$TMP/withrule.png" \
  "$TMP/verse.png" -gravity northwest -geometry +${COL_X}+420 -composite \
  "$TMP/ref.png" -gravity northwest -geometry +${COL_X}+580 -composite \
  "$OUT"

echo "wrote $OUT"
