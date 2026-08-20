import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { linkPendingLanes } from "@/lib/api.functions";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const link = useServerFn(linkPendingLanes);
  // null = not yet verified against Supabase storage, true/false = verified
  const [hasStoredSession, setHasStoredSession] = useState<boolean | null>(null);
  const redirected = useRef(false);

  // Second source of truth: the session Supabase already persisted.
  // The context can lag behind verifyOtp() by a tick; storage never does.
  useEffect(() => {
    let alive = true;
    if (user) {
      setHasStoredSession(true);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      // A malformed/corrupt token would be sent as a bearer and crash the
      // server middleware's JWT decode. Treat it as signed out and purge it.
      const valid = !!token && token.split(".").length === 3;
      if (token && !valid) {
        await supabase.auth.signOut().catch(() => {});
      }
      if (alive) setHasStoredSession(valid);
    });
    return () => {
      alive = false;
    };
  }, [user?.id, loading]);


  useEffect(() => {
    if (redirected.current) return;
    if (loading) return;
    if (user) return;
    if (hasStoredSession !== false) return; // still resolving, or a real session exists
    redirected.current = true;
    navigate({ to: "/login", replace: true });
  }, [loading, user, hasStoredSession, navigate]);

  useEffect(() => {
    if (user) link().catch(() => {});
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }
  return <>{children}</>;
}
