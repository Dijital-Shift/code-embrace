import { useLayoutEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { fetchPathScripture } from "@/lib/scripture.functions";

/** Grows with its content so every line stays visible — no inner scrolling. 16px text prevents iOS focus zoom. */
export function AutoTextarea({ value, onChange, placeholder, maxLength = 800 }: { value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={2}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none w-full resize-none overflow-hidden leading-relaxed text-base"
    />
  );
}

/** Date input with a one-tap clear button. */
export function DateField({ value, onChange, min }: { value: string; onChange: (v: string) => void; min?: string }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none text-base"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear date"
          className="shrink-0 px-3 py-3 rounded-md border border-[#2a2518] text-[#ded8cc] text-sm font-semibold"
          style={{ background: "#2a2518" }}
        >✕ Clear</button>
      )}
    </div>
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
  const full = open === 0;
  const query = [title, description].map((s) => s.trim()).filter(Boolean).join(". ");

  async function fill() {
    setMsg(null);
    if (!query) { setMsg("Name your path first so we know what to look for."); return; }
    if (full) return;
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
      <label className="text-sm font-semibold text-[#ded8cc]">
        Support Scripture <span className="text-[#948d80]">(optional — up to 3)</span>
      </label>
      {values.map((v, i) => (
        <AutoTextarea key={i} value={v} onChange={setValues[i]} placeholder={placeholders[i]} />
      ))}
      <button
        type="button"
        onClick={fill}
        disabled={busy || full}
        className={`mt-1 self-start inline-flex items-center gap-2 px-3.5 py-2 rounded-md border text-sm font-semibold ${full ? "border-[#2a2518] text-[#7d7668] cursor-not-allowed" : "border-[#c9a84c]/50 text-[#c9a84c] hover:bg-[#c9a84c]/10"} disabled:opacity-80`}
        style={{ background: full ? "#141210" : "#1a1508" }}
      >
        {full ? "✓ All 3 verse slots filled" : busy ? "Finding verses…" : "✦ Fetch verses for this path"}
      </button>
      <p className="text-[0.8rem] text-[#9e968a]">
        {msg ?? (full ? "Clear a slot to fetch another verse." : "Fills empty slots with KJV verses that fit your path.")} Verses via{" "}
        <a href="https://sendscripture.xyz" target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] font-semibold underline underline-offset-2 decoration-[#c9a84c]/50 whitespace-nowrap">SendScripture.xyz <span aria-hidden="true">↗</span></a>
      </p>
    </div>
  );
}
