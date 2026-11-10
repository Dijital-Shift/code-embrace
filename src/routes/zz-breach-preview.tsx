import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BreachConfirmDialog } from "@/components/BreachConfirmDialog";
export const Route = createFileRoute("/zz-breach-preview")({ component: P });
function P() {
  const [note, setNote] = useState("");
  const [log, setLog] = useState("none");
  const editable = typeof window !== "undefined" && location.search.includes("late");
  return <div className="min-h-screen bg-background p-4">
    <div className="kp-logged-card rounded-xl p-3 text-parchment">No Cannabis <button className="kp-declare-pill min-h-0 h-8 rounded-full px-3.5 text-[0.65rem] font-bold uppercase tracking-wider">Declare Breach</button></div>
    <p id="log" className="text-parchment">{log}</p>
    <BreachConfirmDialog title={editable ? "Declare Breach on No Cannabis?" : "Review your confession"}
      description="This alerts your Watchman and permanently records a breach for today. It cannot be changed back to Held."
      note={editable ? note : "I drank two beers after dinner tonight."} onNoteChange={editable ? setNote : undefined}
      cancelLabel={editable ? "Keep as Held" : "Edit"} busy={false}
      onCancel={() => setLog("cancel")} onConfirm={() => setLog("confirmed")} />
  </div>;
}
