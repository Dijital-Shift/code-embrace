import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { updateAvatar } from "@/lib/api.functions";

/** Resize an image file to a centered square JPEG data URL. */
async function toSquareDataUrl(file: File, size = 256): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const s = Math.min(img.width, img.height);
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function Avatar({ src, name, size = 40 }: { src?: string | null; name?: string | null; size?: number }) {
  const initials = (name ?? "").trim().split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "◆";
  return src ? (
    <img src={src} alt={name ?? "Profile photo"} width={size} height={size}
      className="rounded-full object-cover shrink-0 border border-[#c9a84c]/40" style={{ width: size, height: size }} />
  ) : (
    <span className="rounded-full shrink-0 inline-flex items-center justify-center font-semibold border border-[#c9a84c]/40 text-[#c9a84c]"
      style={{ width: size, height: size, fontSize: size * 0.36, background: "#15100a" }}>{initials}</span>
  );
}

export function AvatarPicker({ initial, name, onSaved }: { initial: string | null; name: string; onSaved?: () => void }) {
  const save = useServerFn(updateAvatar);
  const input = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function commit(next: string | null) {
    setBusy(true); setErr(null);
    const r: any = await save({ data: { avatar_url: next } }).catch((e) => ({ error: String(e) }));
    setBusy(false);
    if (r?.error) { setErr("Couldn't save the photo. Try another."); return; }
    setSrc(next); onSaved?.();
  }

  return (
    <div className="flex items-center gap-4 mb-4">
      <Avatar src={src} name={name} size={64} />
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-3">
          <button type="button" disabled={busy} onClick={() => input.current?.click()}
            className="bg-transparent border-0 p-0 text-xs font-semibold text-[#c9a84c] cursor-pointer">
            {busy ? "Saving…" : src ? "Change photo" : "Add photo"}
          </button>
          {src && !busy && (
            <button type="button" onClick={() => commit(null)}
              className="bg-transparent border-0 p-0 text-xs text-[#8f887c] cursor-pointer">Remove</button>
          )}
        </div>
        <span className="text-[0.7rem] text-[#8f887c]">Optional. Your Watchmen will see it.</span>
        {err && <span className="text-[0.7rem] text-[#f87171]">{err}</span>}
      </div>
      <input ref={input} type="file" accept="image/*" className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0]; e.target.value = "";
          if (!f) return;
          try { await commit(await toSquareDataUrl(f)); } catch { setErr("That image couldn't be read."); }
        }} />
    </div>
  );
}
