---
name: demo-pattern-shape
description: Use when building or editing src/routes/demo.tsx for a Dijital Shift system. Locks the scene-stream layout (left copy, right browser-frame mock, role-tinted, consumer→staff→operator→admin) so every demo route ships the same handoff-ready shape.
---

# Demo Pattern Shape

Every Dijital Shift `/demo` route follows this exact structure. The scaffold and mock components below are the source of truth — do not look at other Dijital Shift projects for "inspiration," it leaks vendor names, copy, and accent tokens.

## The five rules

1. **Use this scaffold verbatim.** Write your own scene copy and pick your own accent in `src/styles.css`. Never reference, import, or paraphrase another Dijital Shift project.
2. **Fixed layout: copy left, mock right, every scene.** No zigzag/alternating. Role chip + headline + body live in the left column. Mobile stacks copy above mock.
3. **Real mock components, not bullet lists.** Each scene's right column is a `<BrowserFrame>` wrapping a JSX mock built from shadcn primitives + lucide icons + `Pill`. Border color comes from `ROLE_META[role].border`. No `<ul>` of "what the user sees" stubs.
4. **Fixed role arc, 10–15 scenes (hard cap).** Order is always `consumer → staff → operator → admin`. Insert a full-width divider band between role changes. Each scene closes with an italic muted "Why it matters: …" line. If a system genuinely needs more depth, add a second route (e.g. `/demo/admin-deep-dive`) — never extend the scroll.
5. **Semantic tokens only.** All colors via Tailwind semantic classes (`bg-accent`, `text-foreground`, `border-border`, etc.) or `ROLE_META` tints. No raw hex, no `oklch(...)` in components.

6. **Read larger stepper is mandatory.** Every demo ships a sticky-header `ReadLargerControl` (collapsed: quiet `BookOpenText`-icon, single-line "Read larger" pill → expanded: −/％/+ and Done; scales 100/115/130/150%, saved in localStorage, read in `useEffect`). Done collapses the control without resetting the selection. Apply `--read-scale` to narrative `.rs-*` font sizes using `calc(base * var(--read-scale, 1))`; never browser `zoom`, transforms, or scaling mock screens. Keep role chips, status pills and controls unchanged. The control uses only project semantic tokens, independent of device light/dark settings. On ANY demo edit, check and repair this control in the same pass, then verify actual computed font sizes increase, mock dimensions stay fixed, storage persists, and the header fits mobile and desktop.

## Before writing any JSX

- Read `references/scaffold.tsx.md` — paste into `src/routes/demo.tsx`, replace `{System}` / `{system}.app` placeholders.
- Read `references/mock-shapes.md` — copy `MockEntry`, `MockTapRating`, `MockOperatorQueue` as starting components and rename/adapt to the system's domain.

## Pre-flight checklist (before claiming done)

- [ ] 10–15 scenes, ordered consumer → staff → operator → admin
- [ ] Every scene: copy left, `<BrowserFrame>` mock right
- [ ] Every mock is real JSX (no `<ul>` placeholder stubs)
- [ ] Role divider band between each role change
- [ ] Every scene has italic "Why it matters: …"
- [ ] No hex / oklch in components; only semantic tokens + `ROLE_META`
- [ ] Read larger single-line BookOpenText pill → −/％/+ and Done; computed narrative font sizes change at every step, mocks stay fixed, selection persists, phone/desktop header fits, project colors match in light/dark device settings
- [ ] No vendor names, copy, or accent values borrowed from another project
