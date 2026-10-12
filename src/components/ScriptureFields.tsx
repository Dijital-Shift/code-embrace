import { useLayoutEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { fetchPathScripture } from "@/lib/scripture.functions";

function AutoTextarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      maxLength={800}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none w-full resize-none overflow-hidden leading-relaxed text-sm"
    />
  );
}

export function ScriptureFields({
  values,
  setValues,
  title,
  description,
  placeholders = ["e.g. Prov. 27:17", "e.g. Heb. 10:24", "e.g. 1 Cor. 9:27"],
}: {
  values: [string, string, string];
  setValues: [(v: string) => void, (v: string) => void, (v: string) => void];
  title: string;
  description: string;
  placeholders?: string[];
}) {
  const fetchFn = useServerFn(fetchPathScripture);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const open = values.filter((v) => !v.trim()).length;
  const query = [title, description].map((s) => s.trim()).filter(Boolean).join(". ");

  async function fill() {
    setMsg(null);
    if (!query) { setMsg("Name your path first so we know what to look for."); return; }
    if (open === 0) { setMsg("All three slots are full. Clear one to fetch another."); return; }
    setBusy(true);
    const r = await fetchFn({ data: { text: query } }).catch(() => ({ verses: [], error: "Send Scripture couldn't be reached." }));
    setBusy(false);
    if (r.error) { setMsg(r.error); return; }
    const existing = values.map((v) => v.trim().toLowerCase());
    const fresh = r.verses.filter((v) => !existing.some((e) => e && (e.includes(v.split(" — ")[1]?.toLowerCase() ?? "\u0000") || e === v.toLowerCase())));
    if (!fresh.length) { setMsg("No new verses found. Try adding a short description."); return; }
    let i = 0;
    values.forEach((v, idx) => { if (!v.trim() && fresh[i]) setValues[idx](fresh[i++]); });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-[#ded8cc]">
          Support Scripture <span className="text-[#948d80]">(optional — up to 3)</span>
        </label>
      </div>
      {values.map((v, i) => (
        <AutoTextarea key={i} value={v} onChange={setValues[i]} placeholder={placeholders[i]} />
      ))}
      <button
        type="button"
        onClick={fill}
        disabled={busy}
        className="mt-1 self-start inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-[#c9a84c]/50 text-[#c9a84c] text-xs font-semibold hover:bg-[#c9a84c]/10 disabled:opacity-60"
        style={{ background: "#1a1508" }}
      >
        {busy ? "Finding verses…" : "✦ Fetch verses for this path"}
      </button>
      <p className="text-[0.7rem] text-[#9e968a]">
        {msg ?? "Fills empty slots with KJV verses that fit your path."} Verses via{" "}
        <a href="https://sendscripture.xyz" target="_blank" rel="noreferrer" className="text-[#c9a84c] no-underline">SendScripture.xyz</a>
      </p>
    </div>
  );
}
