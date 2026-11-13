import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PENDING_INVITE_KEY, readPendingInvite, shouldResumeInvite } from "@/lib/app-mode";

/** If someone installed the app before accepting, the installed app returns them to the invitation once. */
export function PendingInviteResume() {
  const navigate = useNavigate();
  useEffect(() => {
    try {
      const token = readPendingInvite(localStorage.getItem(PENDING_INVITE_KEY), Date.now());
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
      if (!token) { localStorage.removeItem(PENDING_INVITE_KEY); return; }
      if (shouldResumeInvite({ standalone, pathname: window.location.pathname, token })) {
        void navigate({ to: "/invite/$token", params: { token } });
      }
    } catch { /* storage blocked */ }
  }, [navigate]);
  return null;
}
