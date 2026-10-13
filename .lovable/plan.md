# Account deletion flow, gender-aware copy, and four Path-page fixes

## A. Self-serve account deletion (premium, accountability-first)

A "Delete account" option in Settings, designed so leaving is never a silent escape from accountability:

1. **Reason required** — the member writes a short reason before anything happens.
2. **Watchmen alerted first** — every active Watchman receives the reason and a heads-up that the member is leaving, before deletion takes effect. No disappearing without a word.
3. **14-day hold** — the account enters a "pending deletion" state for 14 days:
   - Member can sign in and cancel the deletion anytime during the hold (one tap restores everything).
   - Paths stop counting new days; no Silence alerts fire against the member during the hold.
   - Watchmen see the member marked as "leaving" rather than silently gone.
4. **After the hold** — the account and personal data are permanently deleted: profile, check-ins, encouragements, push tokens, and Watchman links. Alert history rows that reference the member keep no personal identifiers.
5. **Lifetime members** — deleting the account forfeits the lifetime purchase; returning later means buying again. This is stated plainly on the confirmation screen before they confirm (also already covered in the Refund policy). No Stripe entanglement: no refunds, no proration, the payment record simply stays as a completed purchase.
6. **Active monthly subscribers** — deletion cancels the subscription at Stripe so no further charges occur; access simply ends with the account.

Technical shape:
- New nullable columns on `profiles`: `deletion_requested_at timestamptz`, `deletion_reason text` (additive, no breaking changes; GRANTs unchanged since the table already exists).
- A `requestAccountDeletion` server function: validates the caller, stores reason + timestamp, cancels any active Stripe subscription, notifies all active Watchmen (in-app + email/push via existing notification paths).
- A `cancelAccountDeletion` server function: clears both fields during the hold.
- A scheduled purge (existing cron hook pattern under `src/routes/api/public/hooks/`): hard-deletes auth users whose hold expired; cascades clean up check-ins, encouragements, push tokens. Watchman partner links are cleared first to respect the `lanes.partner_id` delete restriction.
- Settings UI: "Delete account" section at the bottom — reason field, clear consequences list (Watchmen notified, 14-day hold, lifetime forfeited, subscription cancelled), type-to-confirm or confirm dialog, then a pending-deletion banner with a "Keep my account" button during the hold.
- Access state (`access.server.ts`): pending-deletion accounts are treated as resting so nothing accrues against them.

## B. Gender-aware "reach out" copy

Gender is optional in onboarding/settings, so copy must never assume it:

- Male → "Reach out to your brother."
- Female → "Reach out to your sister."
- Unspecified → neutral: "Reach out to them." or "Reach out to [First Name]."

Sweep the app for gendered phrases (breach alerts, Watchman notifications, email templates, landing copy) and route them through one small helper, e.g. `siblingTerm(gender)` in `src/lib/`, so the rule lives in exactly one place. Existing approved copy that already names both ("a brother or sister on the wall") stays as-is.

## C. Four Path-page fixes (previously planned, still included)

1. **Sticky "← Paths" back link** — `src/routes/paths.$id.tsx`: wrap the back link in a sticky container (`sticky top-[calc(48px+env(safe-area-inset-top,0px))] md:top-0 z-30`, page background, slight blur, thin bottom border) so it stays pinned under the top bar while scrolling.
2. **"Show full history" scrolls the calendar into view** — `src/components/LineageTimeline.tsx`: ref on the calendar wrapper with `scroll-mt-24`; on expand, smooth `scrollIntoView`.
3. **Tighten the gap above the calendar legend** — `src/components/PathHistoryCalendar.tsx`: remove `fixedWeeks` (lets 5-row months collapse) and reduce legend margin `mt-4` → `mt-2`.
4. **Watchman words auto-open on calendar tap** — `src/routes/paths.$id.tsx`: add `defaultOpen?: boolean` to `EncouragementCard`, pass `defaultOpen={true}` in the calendar's `renderWord`. The 14-day strip and other lists stay collapsed.

## Notes

- The two test accounts (johnsone.justin@gmail.com, jamaealetha.music16@gmail.com) stay untouched for now, as agreed. Once the deletion flow exists, they can be removed through it or manually.
- No changes to counting, streaks, pricing, or trial logic.
