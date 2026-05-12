## Scope: landing page (`src/routes/index.tsx`) only

### 1. Rename "lane" → "path" (landing copy only)
Touch only marketing copy on the landing page. Do NOT rename product code, routes, DB fields, or dashboard UI — that stays "lane" until a separate sweep.

Edits in `src/routes/index.tsx`:
- HeroMock: `"1 silent lane"` → `"1 silent path"`
- Pricing features:
  - "2 lanes" → "2 paths"
  - "Up to 10 lanes" → "Up to 10 paths"
  - "Up to 5 partners (2 lanes each)" → "Up to 5 partners (2 paths each)"
- Pricing subhead: "Only those building lanes pay." → "Only those building paths pay."
- FAQ "What does it cost partners?": "those creating lanes pay" → "those walking the paths pay"
- WhoThisIsFor / ClosingCall: no "lane" references, no change.

### 2. Center ClosingCall copy
In `ClosingCall`, the Galatians quote card currently uses `text-left`. Change to `text-center`. Subhead paragraph and CTA row are already centered — leave them.

### 3. Collapsible FAQ
Replace the static FAQ block with the existing shadcn `Accordion` (`@/components/ui/accordion`, already in project).
- `<Accordion type="single" collapsible>` — one open at a time, all closed by default
- Each item: `AccordionItem` wrapping `AccordionTrigger` (the question) and `AccordionContent` (the answer)
- Preserve current visual: dark `#0a0800` card per item, gold accent on hover/open, gold chevron
- No new dependencies, no new files

### 4. Rework Receipts → scripture strip (Option B)
In `SilenceRule`, delete the existing `Receipts` 3-column block and the `Receipt` helper component. Replace with a single quiet scripture strip directly under the thresholds:

- Container: rounded border `#1a1610`, bg `#0a0800`, generous padding, centered
- Eyebrow: `Why three thresholds`
- Quote (gold italic): *"A prudent man foreseeth the evil, and hideth himself: but the simple pass on, and are punished."*
- Attribution: `Proverbs 22:3 · KJV`

No fake metrics. Keeps the section anchored in scripture.

### Out of scope
- Product code rename (lane → path in DB / routes / dashboard) — separate task if you want it later
- Hero, Header, Pricing tiers, WhoThisIsFor, Footer, color tokens, new files, new routes
