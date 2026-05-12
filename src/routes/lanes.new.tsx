import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createLane } from "@/lib/api.functions";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/lanes/new")({
  head: () => ({ meta: [{ title: "New Path — Kingdom Protocol" }] }),
  component: () => <AppLayout><NewLane /></AppLayout>,
});

function NewLane() {
  const fn = useServerFn(createLane);
  const navigate = useNavigate();
  const [laneType, setLaneType] = useState<"avoid" | "complete">("avoid");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [s1, setS1] = useState(""), [s2, setS2] = useState(""), [s3, setS3] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const support = [s1, s2, s3].map((s) => s.trim()).filter(Boolean);
    const result = await fn({
      data: {
        title: title.trim(),
        description: description.trim() || null,
        lane_type: laneType,
        support_scripture: support,
      },
    });
    setBusy(false);
    if ("error" in result && result.error) {
      setErr(result.error);
      return;
    }
    if ("id" in result && result.id) {
      // Go straight to the lane page so they can invite their Watchman next
      navigate({ to: "/lanes/$id", params: { id: result.id }, search: { newlyCreated: true } as any });
    } else {
      navigate({ to: "/lanes" });
    }
  }

  const inputCls = "px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none w-full";

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link to="/lanes" className="text-[#555] text-sm">←</Link>
        <h2 className="text-xl font-bold">New Path</h2>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ccc]">Path Type</label>
          <div className="flex gap-3">
            {(["avoid", "complete"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setLaneType(t)}
                className="flex-1 flex flex-col gap-1 p-3.5 rounded-md text-left"
                style={{ border: `1px solid ${laneType === t ? "#fff" : "#222"}`, background: laneType === t ? "#1e1a10" : "#161210", color: laneType === t ? "#fff" : "#666" }}
              >
                <strong>{t === "avoid" ? "Avoid" : "Complete"}</strong>
                <span className="text-[0.72rem] font-normal text-[#555]">
                  {t === "avoid" ? "Something you don't want to do" : "Something you want to do"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ccc]">What's the path?</label>
          <input required maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder={laneType === "avoid" ? "e.g. No alcohol" : "e.g. Daily workout"} className={inputCls} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ccc]">Description <span className="text-[#444]">(optional)</span></label>
          <textarea maxLength={300} rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context or rules..." className={inputCls + " resize-none"} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ccc]">Support Scripture <span className="text-[#444]">(optional — up to 3)</span></label>
          {[
            { v: s1, set: setS1, p: "e.g. Prov. 27:17" },
            { v: s2, set: setS2, p: "e.g. Heb. 10:24" },
            { v: s3, set: setS3, p: "e.g. 1 Cor. 9:27" },
          ].map((x, i) => (
            <input key={i} value={x.v} onChange={(e) => x.set(e.target.value)} placeholder={x.p} maxLength={200} className={inputCls + " mb-1"} />
          ))}
        </div>

        <div className="p-4 rounded-md border border-[#2a2518]" style={{ background: "#161210" }}>
          <p className="text-sm text-[#ccc] font-semibold mb-1">A Watchman comes next</p>
          <p className="text-xs text-[#666]">After you create the path, you'll get a private link to send to your Watchman. They accept in one tap — no email forms.</p>
        </div>

        {err && <p className="text-red-400 text-sm">{err}</p>}

        <button disabled={busy} className="py-3.5 bg-white text-black rounded-md font-semibold">
          {busy ? "Creating…" : "Create Path"}
        </button>
      </form>
    </div>
  );
}
