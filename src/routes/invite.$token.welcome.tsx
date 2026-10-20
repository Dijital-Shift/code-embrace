import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { acceptLaneInvite, getInvitePreview } from "@/lib/invites.functions";
import { useAuth } from "@/lib/auth";
import { WatchmanPushPrompt } from "@/components/WatchmanPushPrompt";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/invite/$token/welcome")({
  head: () => ({ meta: [
    { title: "You're a Watchman — Kingdom Protocol" },
    { name: "description", content: "Begin watching a Kingdom Protocol Path." },
    { property: "og:title", content: "You're a Watchman — Kingdom Protocol" },
    { property: "og:description", content: "Begin watching a Kingdom Protocol Path." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Welcome,
});

function Welcome() {
  const { token } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const acceptFn = useServerFn(acceptLaneInvite);
  const previewFn = useServerFn(getInvitePreview);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertsReady, setAlertsReady] = useState(false);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { void navigate({ to: "/invite/$token", params: { token } }); return; }
    let live = true;
    void (async () => {
      try {
        const result = await acceptFn({ data: { token } });
        if (!live) return;
        if (result.error) { setError(result.error); return; }
        setAccepted(true);
        const preview = await previewFn({ data: { token } });
        if (live && preview.found) setOwnerName(preview.ownerFirstName || preview.ownerEmail || "your friend");
      } catch { if (live) setError("Couldn't confirm this invitation. Please try again."); }
    })();
    return () => { live = false; };
  }, [loading, user, token, acceptFn, previewFn, navigate]);

  return <main className="min-h-[100dvh] bg-background px-6 py-10 flex justify-center">
    <div className="w-full max-w-md my-auto">
      <img src="/kingdom-protocol-logo.png" alt="" className="w-24 mx-auto mb-3" />
      <p className="text-primary font-semibold text-center mb-8">Kingdom Protocol</p>
      {error ? <div className="text-center">
        <h1 className="text-xl font-semibold mb-3">Invitation needs attention</h1>
        <p role="alert" className="text-sm text-muted-foreground mb-6">{error}</p>
        <Button asChild variant="outline"><Link to="/invite/$token" params={{ token }}>Return to invitation</Link></Button>
      </div> : !accepted ? <p className="text-center text-muted-foreground" role="status">Confirming your watch…</p> : <>
        <p className="text-xs uppercase text-primary text-center mb-3">You're in</p>
        <h1 className="text-2xl font-bold text-center leading-tight mb-3">You're now watching {ownerName ? `${ownerName}'s` : 'their'} Path.</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">Make sure their alerts can reach this device.</p>
        <WatchmanPushPrompt onReadinessChange={setAlertsReady} />
        {alertsReady ? <Button asChild className="w-full h-12"><Link to="/partner">Go to The Watch →</Link></Button> : <>
          <Button className="w-full h-12" disabled>Finish alert setup above</Button>
          {!skip ? <Button variant="link" className="w-full mt-3" onClick={() => setSkip(true)}>Set up this device later</Button> : <div className="mt-4 border-l-2 border-primary pl-4">
            <p className="text-sm text-muted-foreground mb-3">This device won't receive alerts yet. Your assignment is saved; finish setup in The Watch.</p>
            <Button asChild variant="outline" className="w-full h-auto min-h-12 whitespace-normal"><Link to="/partner">Continue without device alerts</Link></Button>
          </div>}
        </>}
        <p className="text-xs text-muted-foreground text-center mt-6">Already have the app? Open it from your Home Screen with the same account — your watch is saved. Set up alerts there if Safari cannot receive them.</p>
        <Button asChild variant="link" className="w-full mt-2"><Link to="/">Invitation FAQ</Link></Button>
      </>}
    </div>
  </main>;
}
