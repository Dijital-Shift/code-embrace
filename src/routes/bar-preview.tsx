import { createFileRoute } from "@tanstack/react-router";
import { DayProgressBar } from "@/components/DashboardPieces";

export const Route = createFileRoute("/bar-preview")({
  component: BarPreview,
  head: () => ({ meta: [{ title: "Bar Preview" }] }),
});

// Temporary verification harness: settled slots must fill from the left.
function BarPreview() {
  return (
    <div id="bar-preview" style={{ background: "#0a0800", padding: 24 }}>
      <div id="set">
        <DayProgressBar statuses={["pending", "completed", "pending", "breached", "skipped"]} />
      </div>
    </div>
  );
}
