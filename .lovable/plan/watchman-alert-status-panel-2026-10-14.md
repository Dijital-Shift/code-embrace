# Watchman Alert Status Panel

Quiet hours stay off. The two-days-running grace rule does not change.

## What the member sees

On the Watchman page, a small "Alert status" card replaces the current setup prompt once alerts are working. It stays visible and collapsed down to one line ("Alerts on · this device") so people can check it any time.

It checks four things and shows each as a green check or a gold warning:

1. **App installed** — running from the home screen or installed browser app.
2. **Notifications allowed** — the device permission is Allowed, Not asked yet, or Blocked.
3. **This device registered** — the device is signed up to receive alerts for your account.
4. **Test alert** — a "Send test alert" button that pushes "Kingdom Protocol — test alert. You're on watch." to this device right away.

## Fix-it steps (shown only for the failing item, written for each device)

- **Not installed, iPhone:** the existing 3-step Safari → Share → Add to Home Screen walkthrough.
- **Not installed, Android or computer:** the Install button, or the browser menu steps.
- **Not asked yet:** "Enable alerts" button (same as today).
- **Blocked, iPhone:** Settings → Notifications → Kingdom Protocol → Allow Notifications.
- **Blocked, Android:** long-press the app icon → App info → Notifications → On.
- **Blocked, computer:** click the padlock next to the address → Notifications → Allow, then reload.
- **Allowed but not registered:** "Reconnect this device" button.
- **Test sent but nothing arrived:** check Focus / Do Not Disturb, and that the app isn't set to silent delivery.

The card stays open until all four pass. Settings gets a one-line "Watchman alerts: On / Needs attention" link that opens the same card.

## Technical details

- New `src/components/WatchmanAlertStatus.tsx` that takes over `WatchmanPushPrompt`'s detection (standalone, `Notification.permission`, `pushManager.getSubscription()`) and reuses its subscribe flow; `/partner` renders the new component.
- New authenticated `POST /api/push/test` route: checks the bearer token, sends one push only to the caller's own subscription for the endpoint passed in (via `sendPushToUser`-style helper limited to that endpoint), and rate-limits to 1 per minute per user. The response says whether the push service accepted it.
- "Registered" checks the local subscription and confirms the endpoint exists for this user on the server (small read in the same route file via GET).
- No database schema changes. No changes to alert timing, silence/breach logic, or escalation.
