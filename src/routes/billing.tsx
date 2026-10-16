import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PlanSection } from "@/components/AccessBanner";
import { SubpageHeader } from "@/components/SubpageHeader";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [
    { title: "Billing — Kingdom Protocol" },
    { name: "description", content: "View your Kingdom Protocol plan, manage your subscription, and see receipts." },
    { property: "og:title", content: "Billing — Kingdom Protocol" },
    { property: "og:description", content: "View your Kingdom Protocol plan, manage your subscription, and see receipts." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <AppLayout><Billing /></AppLayout>,
});

function Billing() {
  return (
    <div className="max-w-md mx-auto w-full">
      <SubpageHeader title="Billing" link={{ to: "/settings" }} />
      <p className="text-[#a8a094] text-xs -mt-3">Your plan, your subscription, and your receipts.</p>
      <PlanSection showReceipts />
      <p className="text-[0.7rem] text-[#8f887c] leading-relaxed mt-6 px-1">
        Upgrading from monthly to Lifetime ends your monthly plan right away — no further $7.99 charges.
        Refunds follow our <Link to="/refund" className="text-[#c9a84c] underline">Refund Policy</Link>.
      </p>
    </div>
  );
}
