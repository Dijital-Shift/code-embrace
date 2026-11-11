import { createFileRoute } from "@tanstack/react-router";
import { LoggedRow } from "./checkin";

export const Route = createFileRoute("/preview-logged")({
  component: PreviewLogged,
});

const now = new Date().toISOString();

function PreviewLogged() {
  return (
    <div className="min-h-screen bg-background p-4 space-y-3 max-w-md mx-auto">
      <LoggedRow
        lane={{ lane_id: "a", title: "No Cannabis", lane_type: "avoid" }}
        checkin={{ status: "completed", completion_time: now }}
        dayTag="Logged"
        day="today"
        date="2026-11-10"
      />
      <LoggedRow
        lane={{ lane_id: "b", title: "Read Daily", lane_type: "pursue" }}
        checkin={{ status: "completed", completion_time: now }}
        dayTag="Logged"
        day="today"
        date="2026-11-10"
      />
      <LoggedRow
        lane={{ lane_id: "c", title: "No Pornography", lane_type: "avoid" }}
        checkin={{ status: "breached", completion_time: now }}
        dayTag="Logged"
        day="today"
        date="2026-11-10"
      />
      <LoggedRow
        lane={{ lane_id: "d", title: "A Very Long Custom Path Name That Should Truncate Gracefully", lane_type: "avoid" }}
        checkin={{ status: "completed", completion_time: now }}
        dayTag="Logged"
        day="today"
        date="2026-11-10"
      />
    </div>
  );
}
