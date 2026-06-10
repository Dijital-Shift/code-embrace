## Make the FAQ feel proportionate

The FAQ currently uses the same heading scale as the hero-level sections and bolds every question at `lg`. For a dense Q&A list it reads heavier than the surrounding narrative. Pull it back one step on every axis — heading, trigger, padding, content — so it feels like reference material, not another headline section.

### Changes (all in `src/routes/index.tsx`, `FAQ()` ~lines 338–360)

1. **Section H2** — drop one size
   - From: `text-3xl sm:text-5xl font-bold`
   - To:   `text-2xl sm:text-4xl font-semibold`

2. **Eyebrow + heading spacing** — tighten
   - `mb-10` → `mb-8` on the header wrapper
   - `mb-4` → `mb-3` on the H2

3. **Accordion item chrome** — slimmer
   - `px-6` → `px-5`
   - `space-y-4` → `space-y-3` on the Accordion
   - `rounded-xl` stays

4. **Question trigger** — calmer weight, smaller on desktop
   - From: `text-base sm:text-lg font-bold`
   - To:   `text-[0.95rem] sm:text-base font-semibold`

5. **Answer body** — already `text-sm sm:text-base`, leave as-is, but trim bottom padding `pb-5` → `pb-4`.

6. **Section vertical rhythm** — match the lighter feel
   - `py-14` → `py-12`

### Why this works
- Heading drops from ~48px to ~36px on desktop, so it stops competing with the true hero/CTA headings.
- Questions go from bold-lg to semibold-base, which is the standard FAQ weight (readable, scannable, not shouting).
- Slightly tighter padding + gaps makes the list feel like one cohesive block instead of 10 oversized cards.

### Not changing
- Colors, gold accents, open-state styling, content copy, accordion behavior. Purely a typographic/spacing right-size.

Want me to apply this, or adjust any of the sizes first (e.g. keep the H2 bigger, only shrink the questions)?
