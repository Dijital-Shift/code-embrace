import { createFileRoute } from "@tanstack/react-router";
import { PathRow } from "./checkin";

export const Route = createFileRoute("/checkin-preview-check")({ component: Preview });
function Preview() {
  return <main className="max-w-2xl mx-auto p-5 flex flex-col gap-4">
    <PathRow lane={{ lane_id: "preview-pursue", title: "Read Daily — Cultivate the Mind", lane_type: "complete" }} date="2026-11-03" />
    <PathRow lane={{ lane_id: "preview-flee", title: "Flee Fornication", lane_type: "avoid" }} date="2026-11-03" />
  </main>;
}