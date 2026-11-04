# demo.tsx scaffold

Paste into `src/routes/demo.tsx`. Replace `{System}` and `{system}.app`. Fill `SCENES` with 10–15 entries using shapes from `mock-shapes.md`. Do NOT swap semantic tokens for hex.

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

export const Route = createFileRoute("/demo")({
  component: DemoPage,
  head: () => ({
    meta: [
      { title: "{System} — Live Demo" },
      { name: "description", content: "Scene-by-scene walkthrough of {System} across consumer, staff, operator, and admin." },
    ],
  }),
});

// ---- Types ----
type Role = "consumer" | "staff" | "operator" | "admin";

type Scene = {
  id: string;
  role: Role;
  title: string;
  body: string;
  why: string;
  mock: ReactNode;
};

// ---- Role meta (semantic tokens only) ----
const ROLE_META: Record<Role, { label: string; chip: string; border: string; band: string }> = {
  consumer: { label: "Consumer",  chip: "bg-accent/15 text-accent border-accent/30",        border: "border-accent/40",        band: "bg-accent/5" },
  staff:    { label: "Staff",     chip: "bg-primary/15 text-primary border-primary/30",     border: "border-primary/40",       band: "bg-primary/5" },
  operator: { label: "Operator",  chip: "bg-secondary/15 text-secondary-foreground border-secondary/40", border: "border-secondary/40", band: "bg-secondary/5" },
  admin:    { label: "Admin",     chip: "bg-muted text-foreground border-border",           border: "border-border",           band: "bg-muted/40" },
};

// ---- Reusable primitives ----
export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" | "warn" | "ok" }) {
  const tones = {
    default: "bg-muted text-foreground",
    accent: "bg-accent/15 text-accent",
    warn: "bg-destructive/15 text-destructive",
    ok: "bg-primary/15 text-primary",
  } as const;
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function BrowserFrame({ url, borderClass, children }: { url: string; borderClass: string; children: ReactNode }) {
  return (
    <Card className={`overflow-hidden border-2 ${borderClass} bg-card`}>
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
        <div className="ml-3 flex-1 truncate rounded bg-background px-2 py-1 text-xs text-muted-foreground">{url}</div>
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

// ---- Scenes (10–15 total, hard cap: consumer → staff → operator → admin) ----
const SCENES: Scene[] = [
  // TODO: write scenes here. See references/mock-shapes.md for MockEntry, MockTapRating, MockOperatorQueue.
];

// ---- Page ----
function DemoPage() {
  let prevRole: Role | null = null;
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-12">
        <Badge variant="outline" className="mb-3">Live demo</Badge>
        <h1 className="text-4xl font-semibold tracking-tight">{`{System}`} in motion</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Follow one shift end-to-end across every role.</p>
      </header>

      <div className="space-y-16">
        {SCENES.map((s) => {
          const meta = ROLE_META[s.role];
          const showDivider = prevRole !== null && prevRole !== s.role;
          prevRole = s.role;
          return (
            <div key={s.id}>
              {showDivider && <div className={`mb-12 -mx-6 h-px ${meta.band}`} />}
              <section className="grid gap-8 md:grid-cols-2 md:items-start">
                <div>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.chip}`}>{meta.label}</span>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">{s.title}</h2>
                  <p className="mt-3 text-muted-foreground">{s.body}</p>
                  <p className="mt-4 text-sm italic text-muted-foreground">Why it matters: {s.why}</p>
                </div>
                <BrowserFrame url={`{system}.app/${s.id}`} borderClass={meta.border}>{s.mock}</BrowserFrame>
              </section>
            </div>
          );
        })}
      </div>
    </main>
  );
}
```

**DO NOT:**
- Replace `ROLE_META` Tailwind classes with hex/oklch.
- Alternate copy/mock columns.
- Leave `SCENES` empty or filled with `<ul>` stubs.
- Exceed 15 scenes — add a second route instead.
- Borrow copy, vendor names, or accents from any other project.
