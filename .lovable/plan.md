## Scope

Copy + content changes only to `src/routes/index.tsx`. No layout, color, or component-architecture changes. All copy stays in the existing kingdom/gold aesthetic and KJV voice already established (matches the Ecclesiastes 4:9–10 block).

## 1. Hero rewrite

Use Proverbs 27:17 framing, gender-neutral so it speaks to brothers and sisters alike.

- **Eyebrow** (new, small uppercase line above H1): `For the kingdom-minded · Accountability with a watchman`
- **H1**: `Iron sharpens iron.` / `Silence dulls both.` (gold on second line, same split as current)
- **Subhead**: `For the believer who refuses to walk alone. Daily check-ins, watched by a partner in covenant with you — before the silence becomes a fall.`
- CTAs unchanged (`Join the waitlist`, `See it move`).
- Meta line unchanged (`v1.0 · shipping May 2026`).
- Also update `head.meta` title + descriptions to match the new headline.

## 2. Pricing header rewrite

- **Eyebrow**: `Pricing` (unchanged)
- **H2**: `Count the cost.`
- **Sub**: `"For which of you, intending to build a tower, sitteth not down first, and counteth the cost?" — Luke 14:28. Partners you alert are never charged. Only those building lanes pay.`

Tier copy itself stays as-is (Free / Full Access / Circle) — only the section header changes.

## 3. New sections under `<Pricing />`, before `<Footer />`

Add three new sections, in this order, each as its own component, matching the existing section rhythm (`px-5 sm:px-8 py-20 border-t border-[#1a1610]`, max-w container, gold eyebrow, white H2, muted body).

### 3a. `WhoThisIsFor` — "For whom and not for whom"

Two-column grid (`md:grid-cols-2 gap-5`), card style matching `Threshold` cards.

- **Eyebrow**: `Discernment`
- **H2**: `Whom this is for.`
- **Left card — "For the one who…"** (gold accent, ✓ bullets):
  - has stopped pretending the silence is harmless
  - wants a brother or sister on the wall, not a dashboard
  - is ready to be seen on the days they'd rather hide
  - believes confession in the light beats covering in the dark
- **Right card — "Not for the one who…"** (muted accent, ✕ bullets):
  - wants a habit tracker without covenant
  - is looking for anonymity over accountability
  - expects software to do the work of a partner
  - is not ready to let another believer see the misses

### 3b. `FAQ` — biblically framed

Single column, max-w-3xl, simple Q/A blocks (no accordion — keeps SSR clean and matches the page's plainspoken voice). Each Q in white bold, A in muted body.

- **Eyebrow**: `Plain answers`
- **H2**: `Questions, answered plainly.`
- Items (6):
  1. **Is this confession?** No. Confession belongs to the Lord and, when fitting, to the church. This is a watchman — a partner who sees the silence early enough to call you back before the breach.
  2. **Who sees my misses?** Only the partner you chose. Not the public. Not a feed. Not us beyond what the system requires to deliver the ping. *(James 5:16 — "Confess your faults one to another.")*
  3. **What if my partner falls too?** That is why the escalation chain exists. If your partner goes silent on their own lanes, your escalation contact is engaged. Two are better than one — three is a cord not quickly broken. *(Ecclesiastes 4:12)*
  4. **Is this for women?** Yes. The protocol is the same. Choose a partner of the same conviction; the system does not assume a gender.
  5. **What does it cost partners?** Nothing. Partners you alert are never charged. Only those creating lanes pay. *(Freely ye have received, freely give — Matthew 10:8.)*
  6. **Why pay at all?** Because the labourer is worthy of his hire (1 Timothy 5:18), and this work stays unfunded by advertisers so the watchtower stays clean.

### 3c. `ClosingCall` — final scripture + CTA

Centered, max-w-3xl, dark card with gold border like the existing `ProblemTension` quote block.

- **Eyebrow**: `The call`
- **H2**: `Bear ye one another's burdens.`
- **Quote block** (gold italic, like Ecclesiastes block):
  > "Brethren, if a man be overtaken in a fault, ye which are spiritual, restore such an one in the spirit of meekness; considering thyself, lest thou also be tempted. Bear ye one another's burdens, and so fulfil the law of Christ."
  > — Galatians 6:1–2 · KJV
- **Closing line** under the quote: `If the silence has been louder than the prayer, step into the light. Take a watchman. Be one.`
- **CTAs**: same two buttons as hero (`Join the waitlist` primary, `See it move` secondary), centered.

## 4. Render order in `<Landing />`

```text
Header → Hero → ProblemTension → SilenceRule → Pricing → WhoThisIsFor → FAQ → ClosingCall → Footer
```

## Out of scope

- No changes to `Header`, `ProblemTension`, `SilenceRule`, `Pricing` tier cards, `Footer`, `HeroMock`, routes, auth, pricing tiers, or styling tokens.
- No new files, no new routes, no asset additions.
- No business logic changes.

## Acceptance

- Hero shows new eyebrow + Proverbs-framed headline + inclusive subhead; gender-neutral.
- Pricing header reads "Count the cost." with the Luke 14:28 sub.
- Three new sections render in order under Pricing, in the existing visual language (gold eyebrow, white H2, muted body, gold-bordered cards where applicable).
- No layout regressions at 414 / 768 / 841 / 1280 px.
- `head.meta` updated to match the new hero headline so OG share matches the page.