import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { updateAvatar } from "@/lib/api.functions";
import { AvatarCropDialog } from "@/components/AvatarCropDialog";
import { Button } from "@/components/ui/button";

export function Avatar({ src, name, size = 40 }: { src?: string | null; name?: string | null; size?: number }) {
  const initials = (name ?? "").trim().split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "◆";
  return src ? (
    <img src={src} alt={name ?? "Profile photo"} width={size} height={size}
      className="rounded-full object-cover shrink-0 border border-primary/40" style={{ width: size, height: size }} />
  ) : (
    <span className="rounded-full shrink-0 inline-flex items-center justify-center font-semibold border border-primary/40 text-primary bg-card"
      style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials}</span>
  );
}

export function AvatarPicker({ initial, name, onSaved }: { initial: string | null; name: string; onSaved?: () => void }) {
  const save = useServerFn(updateAvatar);
  const input = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);

  async function commit(next: string | null) {
    setBusy(true); setErr(null);
    const r: any = await save({ data: { avatar_url: next } }).catch((e) => ({ error: String(e) }));
    setBusy(false);
    if (r?.error) { setErr("Couldn't save the photo. Try another."); return false; }
    setSrc(next); onSaved?.();
    setCropImage(null);
    return true;
  }

  return (
    <div className="flex items-center gap-4 mb-4">
      <Avatar src={src} name={name} size={64} />
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-3">
          <Button variant="link" type="button" disabled={busy} onClick={() => input.current?.click()}
            className="p-0 text-xs font-semibold cursor-pointer">
            {busy ? "Saving…" : src ? "Change photo" : "Add photo"}
          </Button>
          {src && !busy && (
            <Button variant="ghost" type="button" onClick={() => commit(null)}
              className="p-0 text-xs text-muted-foreground cursor-pointer">Remove</Button>
          )}
        </div>
        {err && <span className="text-[0.7rem] text-history-breach">{err}</span>}
      </div>
      <input ref={input} type="file" accept="image/*" className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0]; e.target.value = "";
          if (!f) return;
          setErr(null);
          const reader = new FileReader();
          reader.onload = () => { if (typeof reader.result === "string") setCropImage(reader.result); };
          reader.onerror = () => setErr("That image couldn't be read.");
          reader.readAsDataURL(f);
        }} />
      {cropImage && <AvatarCropDialog image={cropImage} onCancel={() => setCropImage(null)} onSave={commit} />}
    </div>
  );
}
