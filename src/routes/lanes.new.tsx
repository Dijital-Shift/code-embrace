import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { createLane, listMyLanes } from "@/lib/api.functions";
import { AppLayout } from "@/components/AppLayout";
import { PATH_CATEGORIES, PATH_TEMPLATES, getPathTemplate } from "@/lib/path-templates";
import { PathTemplateCard } from "@/components/PathTemplateCard";

const searchSchema = z.object({
  template: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/lanes/new")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "New Path — Kingdom Protocol" }] }),
  component: () => <AppLayout><NewLane /></AppLayout>,
});

function NewLane() {
  const { template: templateId } = Route.useSearch();
  const navigate = useNavigate();
  const fn = useServerFn(createLane);
  const listFn = useServerFn(listMyLanes);
  const { data: existingLanes } = useQuery({ queryKey: ["lanes"], queryFn: () => listFn() });

  const tpl = templateId ? getPathTemplate(templateId) : undefined;

  // Default tab: library when user has no lanes yet, else custom — unless ?template= is set.
  const [tab, setTab] = useState<"library" | "custom">(
    tpl ? "custom" : (existingLanes && existingLanes.length > 0 ? "custom" : "library"),
  );

  // If we land with a template id, prefill + show custom form.
  useEffect(() => {
    if (tpl) setTab("custom");
  }, [tpl]);

  const [laneType, setLaneType] = useState<"avoid" | "complete">(tpl?.lane_type ?? "avoid");
  const [title, setTitle] = useState(tpl?.title ?? "");
  const [description, setDescription] = useState(tpl?.description ?? "");
  const [s1, setS1] = useState(tpl?.support_scripture[0] ?? "");
  const [s2, setS2] = useState(tpl?.support_scripture[1] ?? "");
  const [s3, setS3] = useState(tpl?.support_scripture[2] ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // When the template search param changes, re-prefill the form.
  useEffect(() => {
    if (!tpl) return;
    setLaneType(tpl.lane_type);
    setTitle(tpl.title);
    setDescription(tpl.description);
    setS1(tpl.support_scripture[0] ?? "");
    setS2(tpl.support_scripture[1] ?? "");
    setS3(tpl.support_scripture[2] ?? "");
  }, [templateId]);

  function clearTemplate() {
    navigate({ to: "/lanes/new", search: {} });
    setTitle("");
    setDescription("");
    setS1(""); setS2(""); setS3("");
  }

  function pickTemplate(id: string) {
    navigate({ to: "/lanes/new", search: { template: id } });
    setTab("custom");
  }

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
      navigate({ to: "/lanes/$id", params: { id: result.id }, search: { newlyCreated: true } as any });
    } else {
      navigate({ to: "/lanes" });
    }
  }

  const inputCls = "px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none w-full";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/lanes" className="text-[#555] text-sm">←</Link>
        <h2 className="text-xl font-bold">New Path</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-lg border border-[#222] bg-[#0d0a06] w-fit">
        {(["library", "custom"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-md text-xs font-semibold transition-colors"
            style={{
              background: tab === t ? "#c9a84c" : "transparent",
              color: tab === t ? "#000" : "#888",
            }}
          >
            {t === "library" ? "Pick from library" : "Custom path"}
          </button>
        ))}
      </div>

      {tab === "library" ? (
        <div className="flex flex-col gap-8">
          <p className="text-sm text-[#888] max-w-xl">
            Scripture-backed paths. Tap one to prefill the form — edit before creating.
          </p>
          {PATH_CATEGORIES.map((cat) => {
            const items = PATH_TEMPLATES.filter((t) => t.category === cat);
            return (
              <section key={cat}>
                <p className="text-[0.65rem] text-[#c9a84c] uppercase tracking-[0.22em] font-bold mb-3">
                  {cat}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {items.map((t) => (
                    <PathTemplateCard
                      key={t.id}
                      template={t}
                      variant="condensed"
                      onSelect={pickTemplate}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-6">
          {tpl && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-md border border-[#c9a84c]/40" style={{ background: "#1a1508" }}>
              <p className="text-xs text-[#c9a84c]">
                Starting from library: <strong>{tpl.title}</strong>
              </p>
              <button type="button" onClick={clearTemplate} className="text-[0.7rem] text-[#888] underline">
                Clear template
              </button>
            </div>
          )}

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
      )}
    </div>
  );
}
