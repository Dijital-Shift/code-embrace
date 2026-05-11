## Diagnosis

The Dijital Shift template v6 rule says: *"Hero proof element is the right column on desktop, below the CTAs on mobile (<640px)."* The current build violates that — at 841px the mock is stacked under the copy.

Why it's stacking even though `sm:grid-cols-[1.1fr,1fr]` is set:
- The left column has `max-w-xl` (576px) on the subtext **plus** an H1 with `text-3xl sm:text-4xl lg:text-5xl xl:text-6xl`. At ~640–900px the H1's min-content + the 576px subtext clamp exceeds the 1.1fr track. With `items-center` and no explicit `minmax(0,1fr)`, the track grows past its share and the mock wraps to row 2.
- The `max-w-6xl` container (1152px) only matters above ~1200px. Below that, the columns are fighting for ~800px of inner width.

## Plan — `src/routes/index.tsx`, `Hero()` only

1. **Tighten the left column** so the grid honors the ratio:
   - Subtext `max-w-xl` → `max-w-md` (448px) so it doesn't push the track.
   - H1 sizes: `text-3xl sm:text-3xl md:text-4xl lg:text-5xl` (drop the xl:6xl — too aggressive for the band the user actually previews at).
2. **Switch the grid to `md:grid-cols-[1fr,1fr]` (≥768px) with a clean 1:1 split** instead of `1.1fr,1fr`. Below 768px it stacks (matches template mobile rule, with the mobile cutoff slightly higher than 640 to avoid the awkward tablet band). At 841px this gives the mock a guaranteed half.
3. **Add `gap-10 md:gap-12` and `items-start`** (not `items-center`) — template's hero proof sits top-aligned with the headline, not vertically centered against tall copy.
4. **Hero padding** `pt-8 pb-16` → `pt-10 sm:pt-14 pb-16` to match the template's hero band rhythm under the sticky header.
5. **Version line** (`v1.0 · shipping May 2026`) stays in the left column under CTAs — that's where the template puts the meta line.
6. **Mock card** wrapper keeps `min-w-0` so it can shrink into its track at 768–900px.

## Acceptance

- 768px+: hero copy left, mock card right, top-aligned, both fully visible, no horizontal scroll.
- 841px (user's current preview): side-by-side, mock card occupies right half cleanly.
- <768px: stacks vertical (copy → CTAs → mock), per template mobile rule.
- 414px smoke test: H1 readable, CTAs stack vertically (already handled by `flex gap-2` — verify), mock below.

## Out of scope

`Header`, `ProblemTension`, `SilenceRule`, `Pricing`, `Footer`, copy, routes, pricing.
