---
name: dijital-install-drawer
description: Builds a branded "How to install" drawer for any Dijital system PWA — a coded, looping phone animation that walks iPhone (Safari) and Android (Chrome) users through Add to Home Screen, in the host app's own palette and emblem. Trigger when the user asks for an install guide, install walkthrough, "how to install" drawer/sheet, PWA install animation, or wants to replace long text install instructions with a visual guide.
---

# Dijital Install Drawer

A universal, system-agnostic doctrine for adding a premium install walkthrough to **any** Dijital system PWA. It replaces walls of text instructions with a short, branded, looping animation of the actual taps. The drawer must look and feel like the host application — never like a generic browser tooltip.

## What It Is

A bottom sheet (drawer) opened from an install button/link, containing:

1. **Platform tabs** — labeled exactly **"iPhone (Safari)"** and **"Android (Chrome)"**. Never bare "iOS"/"Android"; the browser name is mandatory because users who don't know they must use Safari will try any browser and fail.
2. **A coded phone mock** — a small CSS/React phone (no video file) that loops through the real install taps: tap Share/⋮ menu → tap "Add to Home Screen"/"Install app" → confirm → hold on the home-screen icon bearing the host app's emblem.
3. **Numbered step rows** beneath the mock (4 steps on iPhone, 3 on Android), with the active step highlighted in sync with the animation.
4. **In-app browser detection** — when the user agent is Instagram/Facebook/TikTok/etc., show a prominent banner: "Open in Safari" (iPhone) or "Open in Chrome" (Android) with a Copy-link control, because Add to Home Screen is impossible inside in-app browsers.

## The Visual Laws (non-negotiable)

1. **Inherited Material** — read the host's semantic tokens (`src/styles.css`: background, card, primary, border, fonts) and the emblem from `public/`. The drawer, mock, and step rows use only host tokens. Never hardcode another project's colors or name.
2. **Elevated Chassis** — the phone mock's outer body must NEVER be the same token as the drawer floor. On dark systems the drawer is typically `bg-background` (near-black); the phone chassis must be lifted to the elevated surface (`bg-card` / charcoal) with a subtle accent rim (`border-primary/25`) and a deep drop shadow, so the device reads as a distinct object instead of melting into the sheet. The inner "glass" (simulated browser viewport) stays darker than the chassis for separation.
3. **Emblem Terminal Frame** — the animation's final step holds on the host app's emblem as a home-screen icon (rounded, accent-ringed) with the app name beneath it. The emblem is the payoff; it must be unmistakable.
4. **Browser Chrome Honesty** — the mock shows a mini browser bar naming the real browser (Safari with a compass-style glyph on iPhone, Chrome on Android) and the host's real domain. iPhone mock shows the bottom Safari toolbar with the Share icon; Android mock shows the ⋮ overflow menu.

## The Layout Laws (non-negotiable)

1. **Zero vertical scroll** on mobile viewports down to ~375×548. Size the phone mock compactly (~8rem wide, ~13rem tall), tighten step rows, and on short screens place the mock and step list side by side.
2. **Locked container height across tabs** — iPhone has 4 steps, Android has 3. Render BOTH step lists layered in the same grid cell (inactive one `invisible`/`pointer-events-none`) so switching tabs never changes the drawer height. Tab switching must never make the sheet jump.
3. **Clean dismiss** — the drawer's close (X) control must not show a boxed/highlighted focus ring on open. Remove the open-state highlight on the sheet close button and prevent auto-focus from landing on it.
4. **No autoplaying sound, no video files** — the animation is pure CSS/React state on an interval (~1.9s per step, looping). It is mute by construction and costs nothing to load.

## Implementation Pattern

1. **`InstallDemo.tsx`** — the coded phone mock. Props: `tab: "ios" | "android"`. Internal `useState` step counter on a `setInterval`, reset when the tab changes. Steps: 0 = highlight Share/⋮, 1 = sheet slides up with "Add to Home Screen"/"Install app" highlighted, 2 = confirm dialog with "Add"/"Install" highlighted, 3 = emblem home-screen icon hold. Caption under the mock: `{step + 1}. {label}`.
2. **`InstallWalkthrough.tsx`** — the drawer content: tabs, `<InstallDemo>`, layered step rows, in-app-browser banner. Export both the content and a ready-made `<Sheet>` wrapper.
3. **Mount points** — wire the drawer behind every install entry point the host has: settings/more menu ("Install guide" row), any install banner/card, invite/acceptance pages, and post-signup gates. One shared component; never fork per page.
4. **In-app browser detection** — a small client-safe helper (e.g. `app-mode.ts`) that reads `navigator.userAgent` for known in-app browsers and standalone/display-mode state. Pure functions, unit-testable, no side effects.

## Verification (mandatory before reporting done)

- Playwright at 390×844, 414×700, and 375×548: drawer fits without scrolling on BOTH tabs; switching tabs does not change drawer height.
- Close control shows no focus box on open.
- Animation starts at step 1 (Share/⋮ highlighted), loops cleanly, ends holding the emblem icon.
- In-app-browser banner appears with a copied user agent (e.g. Instagram) and offers Copy link.
- Build passes; unit tests for the detection helper pass.

## Anti-Patterns (rejected)

- Long text-only instruction lists as the primary install guidance.
- Bare "iOS"/"Android" tab labels without the browser name.
- A phone chassis that matches the drawer background (black-on-black collapse).
- Letting the drawer grow/shrink when switching platform tabs.
- Shipping a recorded video file inside the app for this — the coded mock is sharper, lighter, and always on-brand. (A recorded MP4 of the animation may be produced separately for chat/social sharing, but the in-app drawer is always the live coded mock.)
