---
name: dijital-explainer-film
description: Forges a premium 45-90s "what this system is and why you should use it" explainer film for any Dijital Shift project. Trigger when the user asks for an explainer video, system overview film, onboarding film, or a send-able video that shows what a system does. Reads the host project's own brand tokens, drafts the script for confirmation before rendering, then mounts a polished player with a follow-through CTA.
---

# Dijital Explainer Film

A universal, system-agnostic doctrine for producing a high-prestige explainer film for **any** Dijital Shift system. The film answers one question: *what does this system do, and why should the viewer use it?* It must look and feel like the host application — never like generic SaaS marketing.

## Zero-Waste Credit Protocol (mandatory)

Video generation burns credits; re-renders waste them. Follow this order exactly:

1. **Never render before script confirmation.** Present the full beat-by-beat script (with voiceover lines, on-screen text, and visual direction per beat) in chat and get explicit approval first.
2. **Never render before brand confirmation** (Step 1 below).
3. Batch all still assets (poster frame, UI anchors) in parallel before starting video generation.
4. If a render comes back wrong, diagnose and fix the prompt/inputs before retrying — do not re-roll blindly.
5. **One aspect ratio on the first pass.** The 16:9 master reel is the only render target while script, narration, palette, and scene composition are still being calibrated. Never spend credits on a secondary aspect ratio until the master is approved and mounted (Step 6).

## Step 0 — Autonomous System Extraction

Do NOT ask the user what the system does. Read local intelligence in this precedence order:

1. `master.md` / Concept File — territory, incumbents, the core enemy.
2. V1 Build Spec — user roles, access model, core workflow.
3. `src/routes/index.tsx` and `/demo` — live copy, scale anchors, product state.
4. `src/styles.css` and `public/` — semantic color tokens, fonts, brand emblem.

Extract four things:
- **Target Actor** — who holds the pain.
- **Status Quo Friction** — what they suffer today.
- **Core Mechanism** — the system's weapon.
- **Action Door** — the first 60 seconds of use.

## Step 1 — Brand Inheritance & Confirmation Gate

1. Read the host project's semantic tokens (`src/styles.css`: background, foreground, primary, accent/gold, border; font families).
2. **Present the extracted palette back to the user in chat** — list the exact colors and fonts the film will use — and ask: *"Confirm this color scheme, or do you want to change it?"*
3. Do not proceed to scripting or rendering until the user confirms. If they change it, use their stated values.

The film MUST use the host application's palette, typefaces, and emblem. A video that clashes with the host app destroys trust in the first frame.

## Step 2 — The Universal 4-Beat Script

Format with the user before drafting:

- **Executive Dispatch — 45s** (default): one idea, one door. Best for text/social shares and cold outreach.
- **System Showcase — 60–90s**: when the system has multiple actors, a multi-stage workflow, or high stakes needing more context. Same four beats, longer runtime.

Ask which tier; recommend the default unless the system's complexity genuinely demands more.

| Beat | 45s timing | Purpose |
| --- | --- | --- |
| 1. The Arena | 0:00–0:08 | Drop the viewer into their daily reality with a concrete scale anchor (a real number). System emblem enters with prestige. |
| 2. The Rejection | 0:08–0:18 | Name the incumbent failure the system rejects ("No X. No Y. No Z."). |
| 3. The Weapon | 0:18–0:32 | The core mechanism in motion — show the real UI doing its job. |
| 4. The Entry | 0:32–0:45 | The 60-second conversion door: one clear action, one clear promise. |

Writing rules:
- Voice: authoritative, measured, deep, athletic — a high-command dispatch, never a salesperson pitch.
- Use the host system's own vocabulary and scale anchors from Step 0. Never import language from another project.
- No gambling/betting framing, no hype words, no promises the system doesn't keep.

## Step 3 — The Five Visual Laws (non-negotiable)

1. **Inherited Material** — the film is rendered in the confirmed host palette and fonts.
2. **Dark Luxury Discipline** — deep surfaces, sharp typography, restrained accent rules. Reject cartoon avatars, pastel bounces, cheerful ukulele tracks, stock-photo smiles.
3. **Mute-Proof Typography** — every voiceover beat is paired with commanding on-screen text; the film must be 100% understandable with the sound off.
4. **Real UI Anchors** — at least 40% of runtime showcases actual host app components/screens, not abstract motion graphics.
5. **Terminal Air-Lock** — the final frame holds on the emblem + CTA; when playback ends, the player's follow-through link illuminates so the next step is unmistakable.

## Step 4 — Render & Register

1. Generate the film via the platform video pipeline (motion-graphics subagent for token-driven renders; `videogen` only when multi-scene AI footage is requested). Feed it the confirmed palette, fonts, emblem, and UI anchor stills.
2. Poster frame: capture from the system's brand card or hero still.
3. Save ONLY to `src/assets/videos/<system>-explainer.mp4` (project-relative path — the tool registers an asset pointer; never commit binary video to the repo).
4. Render the WebM twin: `ffmpeg -i <mp4> -c:v libvpx-vp9 -b:v 0 -crf 34 -c:a libopus src/assets/videos/<system>-explainer.webm` and register it the same way.
5. Never autoplay spoken content. Native controls, user-initiated audio only.

## Step 5 — Mount the Player

Reuse the established explainer player pattern (see `src/components/AthleteExplainer.tsx` in Combat Golf as the reference implementation):

- **Mandatory poster-first top-left play treatment:** initialize `started` to false and render `<video controls={started} playsInline preload="metadata" poster={...}>`. Place a branded design-system button with a Play icon and the label “Play film” in the top-left corner of the poster. No large centered play overlay and no visible native controls before playback. No runtime label on the play button.
- The top-left button starts playback with `videoRef.current.play()` and reveals native controls. Hide the custom button after playback starts; keep native controls available for pause, seeking, volume and replay. Handle rejected play promises without an unhandled error: restore the custom play button when playback cannot start. Retry resets the poster-first state. Never autoplay or bake this clickable control into the video/poster pixels. Verify the first frame and click-to-play on desktop and phone widths.
- Include the MP4 `<source>` (explicit codec type) and the WebM `<source type="video/webm">` fallback listed after it.
- Error state with a retry button.
- A follow-through link directly beneath the player: "Open [System Name]" or "Claim Access" → the live entry route.
- `onEnded` handler that illuminates/highlights the follow-through link (Terminal Air-Lock).
- Mount on the system's landing page, `/demo`, or private invite routes as appropriate to that system.

## Step 6 — The Vertical Strike Cut (after the master is final)

Once — and only once — the 16:9 master is approved and mounted, forge the 9:16 derivative (1080×1920) as the dedicated outreach weapon for Reels, Shorts, and Stories. Posting a 16:9 film into vertical feeds pillarboxes it and dilutes engagement; the vertical cut owns the glass.

1. **Recompose, never center-crop.** Rebuild the scenes natively at 1080×1920: tension/hook in the upper third, real UI demonstration in the center third, final slate in the lower third inside the thumb-tap zone. A blind crop of the 16:9 master is forbidden — typography will clip.
2. **Reuse the master's audio byte-for-byte.** Extract the narration track from the approved master and carry it across; the vertical cut must match the master's runtime exactly.
3. **Inherit all brand tokens** (palette, fonts, emblem) from the approved master — no new creative decisions.
4. **Keep the mute-proof typography and UI-anchor ratio** (≥40% real UI) at the same discipline as the master.
5. **Keep the 16:9 player on the site.** The vertical cut is a downloadable social asset, not an in-app player replacement — a full-height portrait player on the web page buries the follow-through CTA below the fold.
6. Render, register MP4 + WebM pointers, and produce a poster still from the end slate, following Step 4's registration rules.

## Pre-Flight Checklist (verify all before declaring done)

- [ ] Script confirmed in chat before any render.
- [ ] Host palette and fonts confirmed by the user; film uses them.
- [ ] Duration tier chosen (45s default / 60–90s showcase).
- [ ] 100% understandable on mute via on-screen typography.
- [ ] ≥40% of runtime shows actual host UI components.
- [ ] MP4 + WebM both registered via asset pointers (no repo bloat).
- [ ] Player starts with a top-left branded “Play film” button over the poster; native controls appear after user-initiated playback, retry restores the play button, and desktop/phone click-to-play is verified.
- [ ] Player has poster, retry, and the `onEnded` air-lock CTA.
- [ ] Playback verified on a phone-sized viewport with zero page errors.
- [ ] Vertical strike cut (if made) recomposed natively at 1080×1920 with master audio, and NOT mounted as the in-app player.
