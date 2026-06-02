## Path Library — concrete, scripture-backed paths to pick from

A curated library of ~22 paths (avoid + complete) drawn straight from scripture (KJV). Two surfaces: a dedicated `/paths/library` browse page, and a "Pick from library" tab on the existing `/lanes/new`. Library content is locked code (no DB) for v1.

### What the user gets

- A discovery page grouping paths into 6 categories
- A "Start this path" button on each → opens `/lanes/new?template={id}` with title, description, type (avoid/complete), and up to 3 KJV verses prefilled
- The existing custom-path flow is untouched; the library is an alternative entry point

### The paths (KJV citations) — updated per feedback

**Devotion (mind on Christ)**
1. Meditate on scripture day and night — Joshua 1:8; Psalm 1:2
2. **Pray three times a day** — Daniel 6:10 ("kneeled upon his knees three times a day, and prayed"); Psalm 55:17 ("Evening, and morning, and at noon, will I pray")
3. Fast weekly — Matthew 6:16–18; Isaiah 58:6
4. **Worship** — Hebrews 10:25; Psalm 95:6
5. **Keep silence (be still, slow to speak)** — Psalm 46:10; Ecclesiastes 3:7; James 1:19

**Body (the temple)**
6. Daily exercise / strengthen the body — Hebrews 12:12; 1 Corinthians 6:19–20
7. Eat with self-control (no gluttony) — Proverbs 23:2; Proverbs 25:16
8. Guard sleep (rise early, keep watch) — Mark 1:35; Proverbs 6:9–11

**Purity**
9. No fornication — 1 Corinthians 6:18; 1 Corinthians 6:9–10
10. No pornography / lustful looking — Matthew 5:28; Job 31:1
11. Flee youthful lusts (no masturbation) — 2 Timothy 2:22; 1 Thessalonians 4:3–5

**Substances**
12. No drunkenness — Ephesians 5:18; Proverbs 20:1
13. No drugs / sorcery — Galatians 5:19–21
14. No smoking / defiling the temple — 1 Corinthians 3:16–17

**Speech**
15. No lying — Ephesians 4:25; Proverbs 12:22
16. No cursing / corrupt speech — Ephesians 4:29; James 3:10
17. No gossip / talebearing — Proverbs 11:13; Leviticus 19:16
18. Speak life (encourage daily) — Ephesians 4:29; Proverbs 18:21

**Heart & action**
19. Give / tithe / care for the poor — Proverbs 19:17; Malachi 3:10
20. Forgive quickly (no sundown anger) — Ephesians 4:26–27, 32
21. Serve / visit the afflicted — James 1:27; Matthew 25:40
22. **Honor parents — tell them you love them** — Exodus 20:12; Ephesians 6:2
23. Work as unto the Lord (no slothfulness) — Colossians 3:23; Proverbs 6:6

### Files

- **New** `src/lib/path-templates.ts` — typed const array of `PathTemplate`: `id`, `category`, `title`, `description`, `lane_type: "avoid" | "complete"`, `support_scripture: string[]` (each entry: verse text + citation + "(KJV)"). Single source of truth.
- **New** `src/routes/paths.library.tsx` → `/paths/library`. Grouped by category. Each card: title, Avoid/Complete chip, 1-line description, primary verse, "Start this path" button → `/lanes/new?template={id}`.
- **New** `src/components/PathTemplateCard.tsx` — shared card used on both surfaces.
- **Edit** `src/routes/lanes.new.tsx` —
  - `validateSearch` for optional `template` param
  - Prefill `title`, `description`, `lane_type`, `support_scripture` when `?template={id}` present + banner: "Starting from library: {title} · Clear template"
  - Tab at top: "Pick from library" | "Custom path"; library tab renders condensed list of same templates with tap-to-prefill. Default to library tab when user has zero lanes, else custom.
- **Edit** `src/routes/lanes.index.tsx` — secondary link under "+ New Path": "Browse path library →".
- **Edit** `src/routes/index.tsx` — one-line CTA below Pricing or in hero: "Not sure where to start? Browse the path library →" (skip if too crowded; decide during build).

### Technical notes

- Pure frontend. No DB changes, no server functions, no auth changes.
- Verse strings include "(KJV)" suffix to match site voice.
- Search-param prefill is one-way; clearing the banner empties the form.
- All copy stays "Path" + "Watchman" per existing convention.

### Out of scope

- No DB table for templates (locked in code; easy migration later)
- No admin UI, no favorites, no completion tracking
- No filter/search UI (categories + scroll is enough for ~23 items)
- No translations beyond KJV
- No changes to check-in / dashboard / escalation flows