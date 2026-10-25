import { useEffect, useId, useState } from "react";
import { ArrowRight, Footprints, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { briefingDismissalKey, type BriefingRole } from "@/lib/role-briefing";

const briefings = {
  walker: {
    title: "Your Walk. Your Word.",
    action: "Understood — Walk the Path",
    principles: [
      { title: "Choose your Path.", body: "Commit to something to pursue or flee. Invite someone you trust to stand watch." },
      { title: "Check in honestly.", body: "Report each Path daily near your bedtime. Held, breached, or rested where allowed—tell the truth." },
      { title: "Silence is not a pass.", body: "An unanswered check-in becomes Fallen when its window closes. A breach or two consecutive silent days alerts your Watchman." },
    ],
  },
  watchman: {
    title: "The Watchman's Creed",
    action: "Understood — Stand the Watch",
    principles: [
      { title: "Stand watch.", body: "A breach or two consecutive silent days calls for your attention. Reach out personally." },
      { title: "Stay attentive.", body: "No alarm is not proof that all is well. You can check their Path and contact them." },
      { title: "Send words of strength.", body: "Offer prayer, personal counsel, or Scripture. Your encouragement belongs to their Path history—not casual chatter." },
    ],
  },
};

export function RoleBriefing({ role }: { role: BriefingRole }) {
  const { user } = useAuth();
  const titleId = useId();
  const key = user ? briefingDismissalKey(user.id, role) : null;
  const [visibleKey, setVisibleKey] = useState<string | null>(null);

  useEffect(() => {
    if (!key) { setVisibleKey(null); return; }
    try { setVisibleKey(localStorage.getItem(key) === "read" ? null : key); }
    catch { setVisibleKey(key); }
  }, [key]);

  if (!key || visibleKey !== key) return null;
  const content = briefings[role];
  const Icon = role === "walker" ? Footprints : Shield;

  return (
    <section aria-labelledby={titleId} className="kp-role-briefing mb-6 py-5 sm:py-6">
      <div className="flex items-start gap-3">
        <span className="kp-briefing-emblem flex size-11 shrink-0 items-center justify-center rounded-md" aria-hidden="true">
          <Icon className="size-6 text-primary" />
        </span>
        <div className="min-w-0 self-center">
          <p className="mb-1 text-xs font-semibold text-primary">How it works · {role === "walker" ? "Your walk" : "The Watch"}</p>
          <h2 id={titleId} className="kp-briefing-title text-xl leading-snug text-parchment">{content.title}</h2>
        </div>
      </div>
      <ol className="my-5 space-y-4">
        {content.principles.map((principle, index) => (
          <li key={principle.title} className="flex items-start gap-3">
            <span aria-hidden="true" className="w-6 shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-primary">0{index + 1}</span>
            <p className="min-w-0 text-sm leading-relaxed text-stone"><strong className="font-semibold text-parchment">{principle.title}</strong>{" "}{principle.body}</p>
          </li>
        ))}
      </ol>
      <Button variant="default" className="kp-briefing-accept w-full whitespace-normal px-3 py-3 sm:w-auto sm:px-5" onClick={() => {
        try { localStorage.setItem(key, "read"); } catch {}
        setVisibleKey(null);
      }}>
        {content.action}<ArrowRight aria-hidden="true" />
      </Button>
    </section>
  );
}