# Architecture rules
- Path full history uses the shared Shadcn calendar, while the existing 14-day strip remains a compact summary; reuse the Path page's visible-note read tracking for calendar words.
- Calendar words attach to their linked check-in date when available, otherwise to the sent date in the owner's timezone, so history aligns with the user's local accountability day.- Profile photos are stored as small resized JPEG data URLs on the profile row, because the workspace blocks public storage buckets.

- Profile photo framing uses react-easy-crop and saves only the confirmed square 256px JPEG; circular rendering matches the preview.
- StarterWalkCard reports dismissal visibility to the dashboard so introductory ordering ends when the prompt is dismissed.
- Six-digit OTP entry invokes verification directly with an in-flight guard; manual submission remains a retry fallback.
