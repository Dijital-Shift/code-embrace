# Architecture rules
- The explainer uses a reusable native-controls player with registered MP4/WebM/poster pointers and a session-aware ended-state CTA; playback stays user-initiated and media stays outside Git.
- Automatic device-timezone adoption is limited to published app hosts, with client automation checks and server request-host checks; preview settings saves preserve the stored timezone in Auto mode so testing cannot shift live reminders.
- All Path accountability uses starts_at via the shared client-safe path-start helper, not created_at; database triggers protect inserts and reject pre-start check-ins, including old clients and reminder jobs.
- Homepage membership presentation uses the existing access query through a client-safe classifier; it must not create a separate entitlement decision.
- Check-In groups rows into Yesterday/Today/Logged tabs; the Dashboard shows open Paths first and collapses completed ones into an accordion, so long lists stay short. Preserve the offline merge and Undo flow.
- Watchman removal uses a shared client-safe reason validator and a focused Radix dialog with an in-flight guard; this keeps validation consistent and avoids keyboard-driven sheet motion.
- Removal notices are read independently of active assignments and dismissed via recipient-scoped acknowledgment, never delivery status; former Watchmen retain closure context without regaining Path access.
- Invite welcome reuses WatchmanPushPrompt's device registration checks rather than a separate subscription flow; permission alone does not establish alert readiness.
- Path full history uses the shared Shadcn calendar, while the existing 14-day strip remains a compact summary; reuse the Path page's visible-note read tracking for calendar words.
- Calendar words attach to their linked check-in date when available, otherwise to the sent date in the owner's timezone, so history aligns with the user's local accountability day.- Profile photos are stored as small resized JPEG data URLs on the profile row, because the workspace blocks public storage buckets.

- Profile photo framing uses react-easy-crop and saves only the confirmed square 256px JPEG; circular rendering matches the preview.
- StarterWalkCard reports dismissal visibility to the dashboard so introductory ordering ends when the prompt is dismissed.
- Six-digit OTP entry invokes verification directly with an in-flight guard; manual submission remains a retry fallback.
- Watchman capacity is scoped to active Paths for each owner/Watchman pair, never globally; shared capacity logic and database triggers protect all acceptance and legacy assignment paths.
