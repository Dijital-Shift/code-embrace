# Two fixes: "New" badge on encouragements, and the library list

## 1. The "New" tag on a path never goes away

What's happening now: when you open a path, the app does quietly record that you've
seen those words — the records are marked read in the database at that moment. The
problem is the screen itself is still drawing from the copy it loaded a moment
earlier, so the gold "New" tag stays up, and coming back shortly after shows the
same saved copy again.

What to change:

- After the app records the words as seen, refresh the path screen, the paths list,
  and the little gold dot on the nav so they all agree.
- Keep the "New" tag visible for a few seconds while you're on the page (so you can
  tell which ones are the new ones), then let it fade out on its own.
- Once you leave and come back, nothing shows as new.
- Only mark a note as seen once it has actually been on screen — if several notes
  are stacked and you never scroll down to one, it stays new until you do.

## 2. The path library is one long list again

The dedicated library page (Paths → "Browse path library") does already group into
the six collapsible categories, one open at a time, with the tapped heading held
still on screen.

The long list you're seeing is the "Pick from library" tab on the create-a-path
screen — that one still prints all six categories fully expanded.

What to change: give that tab the same collapsible category behavior as the library
page: one category open at a time, a count next to each heading, and the tapped
heading stays put when sections above it open or close, so the page never jumps.

## Technical notes

- `markEncouragementsRead` in `src/lib/api.functions.ts` already works; add
  `qc.invalidateQueries` for `["lane", id]`, `["lanes"]`, and the unread-count key
  after it resolves in `src/routes/paths.$id.tsx`.
- Track the initially-unread ids in local state so the badge can render for a short
  delay independent of the refreshed data; use an IntersectionObserver per
  encouragement card to batch ids into the mark-read call.
- Extract the accordion from `src/routes/paths.library.tsx` (open-category state,
  header refs, `useLayoutEffect` scroll anchor) into a shared component and use it
  in both that page and the library tab of `src/routes/paths.new.tsx`, keeping the
  condensed card variant and `onSelect` there.
