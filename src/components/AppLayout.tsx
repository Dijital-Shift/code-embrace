import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
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
  { href: "/dashboard", label: "Home" },
  { href: "/paths", label: "Paths" },
  { href: "/checkin", label: "Check In" },
  
  { href: "/partner", label: "Watchman" },
  { href: "/settings", label: "Settings" },
] as const;


export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);


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

        {/* Mobile top bar — wordmark + hamburger */}
        <div className="nav-mobile-top items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #2a2518" }}>
          <Link to="/" className="font-bold text-white no-underline flex items-center text-sm">
            <span className="text-[#c9a84c]">◆</span>
            <span className="ml-2">Kingdom Protocol</span>
          </Link>
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
            className="bg-transparent border-0 p-1 cursor-pointer text-[#c9a84c]"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="nav-mobile-top flex-col px-5 py-3 gap-1" style={{ background: "#0e0b04", borderBottom: "1px solid #2a2518" }}>
            {menuItems.map((i) => (
              <Link
                key={i.href}
                to={i.href}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 text-sm no-underline text-[#ded8cc]"
              >{i.label}</Link>
            ))}
            <button
              onClick={() => { setMenuOpen(false); setConfirmOpen(true); }}
              className="text-left py-2.5 bg-transparent border-0 text-[#c2af80] text-sm cursor-pointer p-0"
            >Sign Out</button>
          </div>
        )}

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
