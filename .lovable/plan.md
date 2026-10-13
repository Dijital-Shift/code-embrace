# Four Path-page fixes: sticky back link, calendar scroll, legend spacing, auto-open words

## 1. Sticky "← Paths" back link
The back link at the top of the Path page scrolls away today. Pin it just under the top bar so it stays visible while scrolling the page — you can always jump back to your Paths list without scrolling up.

- `src/routes/paths.$id.tsx`: wrap the back link in a sticky container — `sticky top-[calc(48px+env(safe-area-inset-top,0px))] md:top-0 z-30`, with the page background color, slight blur, and a thin bottom border so content slides cleanly beneath it.

## 2. "Show full history" scrolls the calendar into view
Today, expanding full history opens the calendar below the fold and you have to scroll to find it. After tapping, the page smoothly scrolls so the whole month and legend sit in view.

- `src/components/LineageTimeline.tsx`: add a ref on the calendar wrapper with `scroll-mt-24`; on expand, `scrollIntoView({ behavior: "smooth", block: "start" })`.

## 3. Tighten the gap above the calendar legend
Extra empty space sits between the calendar grid and the legend, caused by the calendar always rendering 6 week rows even in 5-row months.

- `src/components/PathHistoryCalendar.tsx`: remove `fixedWeeks` (lets 5-row months collapse naturally) and reduce the legend margin from `mt-4` to `mt-2`.

## 4. Watchman words open automatically on calendar tap
Tapping a calendar day with Watchman words currently shows a collapsed card that needs a second tap to read. Open it ready-to-read.

- `src/routes/paths.$id.tsx`: add a `defaultOpen?: boolean` prop to `EncouragementCard` and pass `defaultOpen={true}` in the calendar's `renderWord` callback. The 14-day strip and other encouragement lists stay collapsed as before.

## Notes
- No changes to data, counting, alerts, or payments — presentation only.
- The two test accounts stay untouched, as agreed.
