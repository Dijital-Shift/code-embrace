# Mock shapes

Three starter mocks. Copy into `demo.tsx`, rename and adapt to the system's domain. Use shadcn primitives + lucide icons + `Pill`. Border tint is applied by `<BrowserFrame>` via `ROLE_META`, not inside the mock.

## MockEntry — consumer arrival / QR / check-in

```tsx
import { QrCode, MapPin } from "lucide-react";

function MockEntry() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Location A</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Zone 12 · Bay 4</div>
        </div>
        <Pill tone="accent">Open</Pill>
      </div>
      <div className="rounded-lg border-2 border-dashed border-border p-8 flex flex-col items-center gap-2">
        <QrCode className="h-12 w-12 text-muted-foreground" />
        <div className="text-xs text-muted-foreground">Scan to begin</div>
      </div>
      <div className="text-xs text-muted-foreground">Average wait · 2 min</div>
    </div>
  );
}
```

## MockTapRating — quick consumer feedback grid

```tsx
function MockTapRating() {
  const opts = ["Fast", "Friendly", "Clean", "Quiet", "Slow", "Confusing"];
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">How was it?</div>
      <div className="grid grid-cols-2 gap-2">
        {opts.map((o) => (
          <button key={o} className="rounded-md border border-border bg-background px-3 py-2 text-left text-sm hover:bg-muted">{o}</button>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        <Pill>Anonymous</Pill>
        <button className="text-xs font-medium text-accent">Skip</button>
      </div>
    </div>
  );
}
```

## MockOperatorQueue — operator triage list

```tsx
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

function MockOperatorQueue() {
  const rows = [
    { icon: AlertTriangle, tone: "warn" as const, label: "Bay 4 · idle 8m", meta: "Assign" },
    { icon: Clock,         tone: "default" as const, label: "Bay 2 · in progress", meta: "3m" },
    { icon: CheckCircle2,  tone: "ok" as const, label: "Bay 1 · cleared", meta: "Done" },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Live queue</div>
        <Pill tone="accent">3 active</Pill>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
          <div className="flex items-center gap-2">
            <r.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{r.label}</span>
          </div>
          <Pill tone={r.tone}>{r.meta}</Pill>
        </div>
      ))}
    </div>
  );
}
```

## Scene arc template (10–15 scenes, hard cap, in this order)

1. **consumer** — arrival / discover
2. **consumer** — primary action (order/check-in/tap)
3. **consumer** — feedback or receipt
4. **staff** — incoming notification
5. **staff** — work-in-progress view
6. **staff** — handoff or completion
7. **operator** — live queue / triage
8. **operator** — intervention (reassign, flag, escalate)
9. **operator** — shift summary
10. **admin** — multi-location dashboard
11. **admin** — trend / anomaly view
12. **admin** — config / rules
13. *(optional 13–15)* — cross-role loop, automation, or weekly digest

If the system needs more, add `/demo/<topic>` as a second route. Do not exceed 15 scenes on the main demo.

## Minimum bar

- No scene ships with a `<ul>` of "what the user sees" bullets — every scene has a real JSX mock.
- Each mock fits in roughly one screen of its `<BrowserFrame>` (don't build full pages).
- Placeholder copy stays generic: "Location A", "Bay 4", "Zone 12", "Operator B" — never real or borrowed vendor names.
