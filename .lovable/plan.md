## Diagnosis

At 841px the grid `sm:grid-cols-[1.1fr,1fr]` should split the hero into two columns, but the mock is dropping below. Two culprits, both in the left column of `Hero()`:

1. **Oversized logo inside the hero column.** The logo is rendered twice — once in `Header` (h-9) and again at the top of the hero left column at `clamp(220px, 38vw, 340px)`. At ~841px viewport that's ~320px wide sitting above an `text-5xl` H1 ("You don't fall in public.") whose longest word ("public.") plus tracking sets a wide intrinsic min-content. Combined with the H1's `tracking-tight` and no `min-w-0` on the grid children, the left column refuses to shrink below its content width and pushes the right column to the next row.
2. **Grid children missing `min-w-0`.** CSS grid `fr` tracks default to `minmax(auto, 1fr)`, so a child with a wide intrinsic minimum (the H1 + 320px logo) will overflow its track and force the sibling to wrap.

The user wants the logo kept in the system but "formatted to fit pages properly." The header already carries the brand. The hero doesn't need a second giant logo — but we'll keep a refined logo presence in the hero, not the dominant one.

## Plan (no edits yet)

**File:** `src/routes/index.tsx` — `Hero()` only. No other sections change.

1. **Shrink the in-hero logo** from `clamp(220px, 38vw, 340px)` down to a tasteful eyebrow mark above the H1: fixed `h-12 sm:h-14 w-auto`, kept with the gold drop-shadow. This keeps the brand visible on the landing without competing with the H1 or blowing out the grid track.
2. **Add `min-w-0` to both grid children** so the `1.1fr / 1fr` split actually honors the ratio instead of being driven by intrinsic content width.
3. **Tighten the H1** to `text-4xl sm:text-4xl md:text-5xl lg:text-6xl` so the wide breakpoint doesn't force an oversized min-content width at the awkward 768–900px band where the user is previewing.
4. **Keep the mock's wrapper as-is** but add `min-w-0` so it can shrink into its track.
5. **Header logo stays** (already h-9 with wordmark) — that's the persistent brand placement.
6. **Footer logo stays** as-is.

## Acceptance

- At 841px viewport: hero copy on the left, mock card on the right, both visible without scrolling horizontally.
- At <640px (mobile): stacks vertically, logo + H1 + CTAs, then mock below.
- Logo still appears in: header (primary), hero eyebrow (refined), footer (secondary). Nothing removed.

## Out of scope

No changes to `ProblemTension`, `SilenceRule`, `Pricing`, `Footer`, copy, pricing, or routes.
