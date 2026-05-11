## Change

`src/routes/index.tsx` — `Hero()` only.

1. **Remove the in-hero logo `<img>`** entirely (the `h-12 sm:h-14` mark above the H1). Header logo + footer logo remain — brand stays present, hero stops competing with itself.
2. **Force side-by-side earlier.** Current grid uses `sm:grid-cols-[1.1fr,1fr]` (640px+), but at 841px it's still rendering stacked because the H1 + CTA wrap is pushing intrinsic width past the track. Switch to:
   - `grid-cols-1 md:grid-cols-[1.1fr,1fr]` won't help (worse). Instead: keep `sm:grid-cols-[1.1fr,1fr]` but ensure both columns have `min-w-0` (already added) AND tighten the H1 default to `text-3xl sm:text-4xl lg:text-5xl xl:text-6xl` so the 640–900px band has a smaller min-content. CTAs go from `flex-wrap gap-3` to `flex gap-2` so they don't push width.
3. **Tighten hero vertical padding** from `pt-12 pb-20` to `pt-8 pb-16` since the eyebrow logo is gone.
4. **Keep mock card** unchanged.

## Acceptance

- 841px viewport: H1 + subtext + CTAs on left, mock card on right, both visible, no horizontal scroll.
- <640px: stacks (copy then mock).
- No in-hero logo. Header logo (h-9) and footer logo (h-7) untouched.

## Out of scope

`ProblemTension`, `SilenceRule`, `Pricing`, `Footer`, copy, routes, pricing.
