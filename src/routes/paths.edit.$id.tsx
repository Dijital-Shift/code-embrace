import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getLane, updateLane } from "@/lib/api.functions";
import { AppLayout } from "@/components/AppLayout";
import { ScriptureFields, AutoTextarea, DateField } from "@/components/ScriptureFields";
import { endDateEditable } from "@/lib/path-endlock";
import { SubpageHeader } from "@/components/SubpageHeader";
import { pathIdentityEditable } from "@/lib/path-identity";
import { Button } from "@/components/ui/button";
import { LockKeyhole, Save } from "lucide-react";

export const Route = createFileRoute("/paths/edit/$id")({
  head: () => ({ meta: [
    { title: "Edit Path — Kingdom Protocol" },
    { name: "description", content: "Update your Path details and supporting Scripture." },
    { property: "og:title", content: "Edit Path — Kingdom Protocol" },
    { property: "og:description", content: "Update your Path details and supporting Scripture." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <AppLayout><EditPath /></AppLayout>,
});

function EditPath() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const getFn = useServerFn(getLane);
  const saveFn = useServerFn(updateLane);
  const { data, isLoading } = useQuery({ queryKey: ["lane", id], queryFn: () => getFn({ data: { id } }) });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [s3, setS3] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const l = data?.lane;
    if (!l) return;
    setTitle(l.title ?? "");
    setDescription(l.description ?? "");
    setNotes((l as any).notes ?? "");
    const sc = (l.support_scripture ?? []) as string[];
    setS1(sc[0] ?? ""); setS2(sc[1] ?? ""); setS3(sc[2] ?? "");
    setEndsAt(l.ends_at ?? "");
  }, [data]);

  if (isLoading) return <p className="text-[#9e968a]">Loading…</p>;
  if (!data?.lane) return <p>Not found.</p>;
  const identityEditable = pathIdentityEditable(data.lane.created_at, data.checkins.length, data.watchmen.length, now);

  const inputCls = "px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none w-full text-base";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    const r: any = await saveFn({
      data: {
        id,
        title: identityEditable ? title.trim() : data?.lane?.title ?? title,
        description: identityEditable ? description.trim() || null : data?.lane?.description ?? null,
        notes: notes.trim() || null,
        support_scripture: [s1, s2, s3].map((s) => s.trim()).filter(Boolean),
        ends_at: endsAt || null,
      },
    });
    setBusy(false);
    if (r?.error) { setErr(r.error); return; }
    navigate({ to: "/paths/$id", params: { id }, search: { newlyCreated: false } as any });
  }

  return (
    <div>
      <SubpageHeader title="Edit Path" link={{ to: "/paths/$id", params: { id }, search: { newlyCreated: false } }} />

      <form onSubmit={submit} className="flex flex-col gap-6 max-w-md">
        {!identityEditable && <p className="flex items-start gap-2 text-sm text-stone"><LockKeyhole size={16} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />Name and description are locked. Your commitment stays the same; notes and Scripture remain editable.</p>}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ded8cc]">What's the path?</label>
          {identityEditable ? <input required maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} /> : <p className="text-parchment font-semibold break-words">{data.lane.title}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ded8cc]">Description <span className="text-[#948d80]">(optional)</span></label>
          {identityEditable ? <AutoTextarea maxLength={300} value={description} onChange={setDescription} /> : <p className="text-stone whitespace-pre-wrap break-words">{data.lane.description || 'No description.'}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ded8cc]">Notes <span className="text-[#948d80]">(your watchman sees these)</span></label>
          <AutoTextarea maxLength={500} value={notes} onChange={setNotes} />
        </div>
        <ScriptureFields values={[s1, s2, s3]} setValues={[setS1, setS2, setS3]} title={title} description={description} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ded8cc]">Ends on <span className="text-[#948d80]">(optional)</span></label>
          {endDateEditable(data.lane.created_at, now)
            ? <DateField value={endsAt} onChange={setEndsAt} start={(data.lane as any).starts_at ?? undefined} />
            : <p className="px-4 py-3 rounded-md border border-[#c9a84c]/40 bg-[#14110a] text-sm text-[#e8dfc4]">
                {endsAt ? <>Ends <span className="text-[#c9a84c]">{endsAt}</span> · </> : null}Locked. Finish the course set before you.
              </p>}
        </div>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <Button disabled={busy} className="kp-briefing-accept py-3.5 font-semibold"><Save aria-hidden="true" />{busy ? "Saving…" : "Save changes"}</Button>
      </form>
    </div>
  );
}
