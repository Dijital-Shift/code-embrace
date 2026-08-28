import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Route as RouteIcon, CircleCheck, Eye, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AuthGate } from "@/components/AuthGate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


const menuItems = [
  { href: "/dashboard", label: "Home", short: "Home", icon: Home },
  { href: "/paths", label: "Paths", short: "Paths", icon: RouteIcon },
  { href: "/checkin", label: "Check In", short: "Check", icon: CircleCheck },
  { href: "/partner", label: "Watchman", short: "Watch", icon: Eye },
  { href: "/settings", label: "Settings", short: "Settings", icon: Settings },
] as const;


export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });


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
              <Link key={i.href} to={i.href} className="text-[#b8b0a4] text-sm no-underline hover:text-white">{i.label}</Link>
            ))}
            <button
              onClick={() => setConfirmOpen(true)}
              className="bg-transparent border-0 text-[#9e968a] text-sm cursor-pointer p-0"
            >Sign Out</button>
          </div>
        </nav>

        {/* Mobile top bar — wordmark + icon nav */}
        <div className="nav-mobile-header flex-col" style={{ background: "#0a0800", borderBottom: "1px solid #2a2518" }}>
          <div className="flex items-center justify-between px-5 py-3">
            <Link to="/" className="font-bold text-white no-underline flex items-center text-sm">
              <span className="text-[#c9a84c]">◆</span>
              <span className="ml-2">Kingdom Protocol</span>
            </Link>
            <button
              onClick={() => setConfirmOpen(true)}
              className="bg-transparent border-0 text-[#9e968a] text-xs cursor-pointer p-0"
              aria-label="Sign out"
            >
              Sign out
            </button>
          </div>
          <nav className="grid grid-cols-5" style={{ borderTop: "1px solid #1d190f" }}>
            {menuItems.map((i) => {
              const active = pathname === i.href || pathname.startsWith(i.href + "/");
              const Icon = i.icon;
              return (
                <Link
                  key={i.href}
                  to={i.href}
                  aria-label={i.label}
                  className="flex flex-col items-center justify-center gap-1 py-2 min-h-[52px] no-underline"
                  style={{
                    color: active ? "#c9a84c" : "#9e968a",
                    borderBottom: active ? "2px solid #c9a84c" : "2px solid transparent",
                  }}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                  <span className="text-[0.625rem] leading-none">{i.short}</span>
                </Link>
              );
            })}
          </nav>
        </div>


        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent className="bg-[#100d05] border border-[#2a2415] text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Sign out of Kingdom Protocol?</AlertDialogTitle>
              <AlertDialogDescription className="text-[#a49d8e]">
                You will need your emailed code or Google to sign back in.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-[#2a2415] text-[#cfc8b8] hover:bg-[#1a1509] hover:text-white">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => { await signOut(); router.navigate({ to: "/login" }); }}
                className="bg-[#c9a84c] text-[#0a0800] hover:bg-[#dcbb5c]"
              >Sign Out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <main className="flex-1 px-5 pb-10 pt-5 max-w-2xl w-full mx-auto box-border">{children}</main>
      </div>
    </AuthGate>
  );
}
