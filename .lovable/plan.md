## The problem

Right now, every FAQ answer — including the heavy scripture one ("What does the Word say about lying and being watched?") — is a single wall of prose. Verses run together inside one paragraph, separated only by quote marks and em-dashes. The Word gets no breathing room and reads like filler.

## The fix

Change the FAQ answer shape from a plain string to support **structured content**: an intro line, a list of verses (each rendered on its own), and a closing line. Scripture gets typography that reveres it; plain answers stay plain.

### Data shape

```ts
type FaqItem = {
  q: string;
  a?: string;                      // for plain prose answers (unchanged)
  intro?: string;                  // optional lead-in
  verses?: { text: string; ref: string }[];  // each verse renders standalone
  closing?: string;                // optional closing line
};
```

Only the "What does the Word say…" item gets converted to `verses`. The other 8 stay as `a` strings — they're already fine.

### Visual treatment for verses

Each verse rendered as its own block:

- Verse text: serif font (Georgia / system serif via `font-serif`), italic, gold (`#c9a84c`), slightly larger leading, indented left with a thin gold left-border (`border-l-2 border-[#c9a84c]/40 pl-4`)
- Reference: small, uppercase, tracked, white/muted, on its own line under the verse (matches the Ecclesiastes verse treatment already used on the landing hero — keeps the site visually consistent)
- Vertical spacing between verses (`space-y-4`) so each one is honored, not crowded
- Intro and closing rendered as normal answer prose above/below the verse block

### The "What does the Word say…" item, restructured

- **Intro:** "Plainly:"
- **Verses (each its own block):**
  1. "Lying lips are abomination to the LORD: but they that deal truly are his delight." — Proverbs 12:22
  2. "But I say unto you, That every idle word that men shall speak, they shall give account thereof in the day of judgment." — Matthew 12:36
  3. "The LORD is in his holy temple, the LORD's throne is in heaven: his eyes behold, his eyelids try, the children of men." — Psalm 11:4
  4. "The eyes of the LORD are in every place, beholding the evil and the good." — Proverbs 15:3
  5. "The eyes of the Lord are ten thousand times brighter than the sun, beholding all the ways of men, and considering the most secret parts." — Sirach 23:19
  6. "Say not thou, I am hid from the Lord; shall any remember me from above?… his eyes are upon the ways of every man, and he seeth into secret places." — Sirach 16:17, 17:19–20 (paraphrased, KJV Apocrypha)
- **Closing:** "What's done in the dark comes to the light. Better to be seen by a brother now than exposed at the throne later."

### Also worth applying

The other items with inline scripture references — "Who sees my misses?" (James 5:16), "Why pay at all?" (1 Timothy 5:18), "What does it cost watchmen?" (Matthew 10:8), and "What stops me from lying?" (Luke 12:2) — currently bury the citation in parentheses mid-sentence. I'll lift each of those single citations into the same verse-block treatment underneath the prose, so scripture is consistently set apart everywhere it appears in the FAQ.

## Scope

- File: `src/routes/index.tsx`, only the `FAQ` component (lines ~297-360)
- No copy changes to questions or prose answers — only the scripture portions get restructured into verse blocks
- No new dependencies; serif comes from Tailwind's `font-serif` (or a `font-family: Georgia, serif` inline if needed)
- No changes elsewhere in the page

## Technical notes

- Render logic: if `verses` exists, map them into styled blocks; otherwise render `a` as before
- Each verse uses the same visual pattern as the hero Ecclesiastes verse (italic gold body + uppercase tracked reference) so the site has one unified scripture treatment
