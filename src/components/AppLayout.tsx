import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Layers, CheckCircle, Users, Settings as SettingsIcon } from "lucide-react";
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


const items = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/paths", icon: Layers, label: "Paths" },
  { href: "/checkin", icon: CheckCircle, label: "Check In" },
  { href: "/partner", icon: Users, label: "Watchman" },
  { href: "/settings", icon: SettingsIcon, label: "Settings" },
] as const;


export function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const router = useRouter();
  const { signOut } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);


  return (
    <AuthGate>
      <div className="min-h-[100dvh] flex flex-col text-white" style={{ background: "radial-gradient(ellipse 120% 55% at 50% 0%, #1e1800 0%, #100d00 40%, #0a0800 100%)" }}>
        <nav className="nav-desktop-bar">
          <Link to="/" className="font-bold text-white no-underline flex items-center">
            <span className="text-[#c9a84c]">◆</span>
            <span className="ml-2">Kingdom Protocol</span>
          </Link>
          <div className="flex items-center gap-5">
            {items.map((i) => (
              <Link key={i.href} to={i.href} className="text-[#888] text-sm no-underline hover:text-white">{i.label}</Link>
            ))}
            <button
              onClick={() => setConfirmOpen(true)}
              className="bg-transparent border-0 text-[#555] text-sm cursor-pointer p-0"
            >Sign Out</button>
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogContent className="bg-[#100d05] border border-[#2a2415] text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Sign out of Kingdom Protocol?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#8a8375]">
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

          </div>
        </nav>
        <main className="flex-1 px-5 pb-20 pt-5 max-w-2xl w-full mx-auto box-border">{children}</main>
        <nav className="nav-mobile-only fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around z-50" style={{ background: "#0a0a0a", borderTop: "1px solid #1a1a1a", paddingBottom: "env(safe-area-inset-bottom)" }}>
          {items.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            const color = active ? "#c9a84c" : "#444";
            return (
              <Link key={href} to={href} className="flex flex-col items-center justify-center gap-[3px] flex-1 h-full no-underline">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.5} color={color} />
                <span className="text-[0.58rem]" style={{ color }}>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </AuthGate>
  );
}
