import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getUnreadEncouragementCount } from "@/lib/api.functions";
import { Home, Route as RouteIcon, CircleCheck, Eye, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AuthGate } from "@/components/AuthGate";
import { TrialEndingModal } from "@/components/AccessBanner";
import { useOfflineCheckinSync } from "@/lib/offline-checkins";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const menuItems = [
  { href: "/dashboard", label: "Home", short: "Home", icon: Home },
  { href: "/paths", label: "Paths", short: "Paths", icon: RouteIcon },
  { href: "/checkin", label: "Check In", short: "Check", icon: CircleCheck },
  { href: "/partner", label: "Watchman", short: "Watch", icon: Eye },
  { href: "/settings", label: "Settings", short: "Settings", icon: Settings },
] as const;

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // A gold dot on Paths whenever a watchman has written something unread.
  const unreadFn = useServerFn(getUnreadEncouragementCount);
  const { data: unread } = useQuery({
    queryKey: ["unread-encouragements", session?.user?.id ?? null],
    // Never let this background poll surface as a page-level error.
    queryFn: () => unreadFn().catch(() => ({ count: 0 })),
    enabled: !authLoading && !!session?.access_token,
    retry: false,
    throwOnError: false,
    refetchInterval: 120000,
  });
  const hasUnread = (unread?.count ?? 0) > 0;
  useOfflineCheckinSync(!authLoading && !!session?.access_token);
  const [dockHost, setDockHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setDockHost(document.body);
  }, [dockHost]);

  return (
    <AuthGate>
      <div className="min-h-[100dvh] flex flex-col text-white" style={{ background: "radial-gradient(ellipse 120% 55% at 50% 0%, #1e1800 0%, #100d00 40%, #0a0800 100%)" }}>
        <nav className="nav-desktop-bar">
          <Link to="/" className="font-bold text-white no-underline flex items-center">
            <span className="text-[#c9a84c]">◆</span>
            <span className="ml-2">Kingdom Protocol</span>
          </Link>
          <div className="flex items-center gap-5">
            {menuItems.map((i) => (
              <Link key={i.href} to={i.href} className="text-[#b8b0a4] text-sm no-underline hover:text-white">
                {i.label}
                {hasUnread && i.href === "/paths" && (
                  <span className="inline-block ml-1.5 w-2 h-2 rounded-full align-middle" style={{ background: "#e5af38" }} />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile top bar — wordmark only */}
        <div className="nav-mobile-header flex-col" style={{ background: "#0a0800", borderBottom: "1px solid #2a2518" }}>
          <div className="flex items-center justify-between px-5 py-3">
            <Link to="/" className="font-bold text-white no-underline flex items-center text-sm">
              <span className="text-[#c9a84c]">◆</span>
              <span className="ml-2">Kingdom Protocol</span>
            </Link>
          </div>
        </div>

        {/* Mobile bottom dock — sticky, app-style */}
        {dockHost && createPortal(<nav ref={dockRef} className="nav-mobile-dock grid grid-cols-5" aria-label="Primary">
            {menuItems.map((i) => {
              const active = pathname === i.href || pathname.startsWith(i.href + "/");
              const Icon = i.icon;
              return (
                <Link
                  key={i.href}
                  to={i.href}
                  aria-label={i.label}
                  className="relative flex flex-col items-center justify-center gap-1 pt-2.5 pb-1.5 min-h-[54px] no-underline"
                  style={{ color: active ? "#c9a84c" : "#8f887c" }}
                >
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full" style={{ background: "#c9a84c", boxShadow: "0 0 10px rgba(201,168,76,0.7)" }} />
                  )}
                  <span className="relative">
                    <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                    {hasUnread && i.href === "/paths" && (
                      <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full" style={{ background: "#e5af38" }} />
                    )}
                  </span>
                  <span className="text-[0.625rem] leading-none">{i.short}</span>
                </Link>
              );
            })}
        </nav>, dockHost)}

        <main className="app-main flex-1 px-5 pb-10 pt-5 max-w-2xl w-full mx-auto box-border">{children}</main>
        <TrialEndingModal />
      </div>
    </AuthGate>
  );
}
