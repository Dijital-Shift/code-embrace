# Stop sideways scrolling on the Settings page (mobile)

On a phone, the Settings page can be dragged left and right. It should stay locked to the screen width, like the other pages.

## What I'll change

1. Lock the page horizontally at the top level so nothing can be dragged sideways anywhere in the app, not just Settings.
2. Fix the actual overflow inside Settings rather than only hiding it:
   - The invite link box: let the link field shrink properly next to the Copy button instead of pushing past the screen edge.
   - The archived path rows: make sure long path titles stay truncated and the Reactivate/Delete buttons never widen the row.
   - Make sure the form fields and dropdown stay inside the page padding.
3. Check the Feedback popup and the app update section on the same page for the same issue.

## Technical notes

- `src/styles.css`: currently only `body` has `overflow-x: hidden; max-width: 100vw`. Add the same clipping on `html` so the document itself can't scroll horizontally.
- `src/routes/settings.tsx`: the referral row (`flex items-center gap-2` with `input flex-1`) relies on default `min-width: auto` for the input, which resolves to its intrinsic size and can exceed the container. Add `min-w-0` to the input and `w-full max-w-full` on the containing card; verify the archived row's `min-w-0`/`shrink-0` pairing still holds.
- Verify by loading `/settings` in a mobile-width viewport and confirming `document.documentElement.scrollWidth === clientWidth`.

No copy, layout, or behavior changes beyond removing the sideways drag.
