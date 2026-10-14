import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

async function cropPhoto(image: string, area: Area): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const next = new Image();
    next.onload = () => resolve(next);
    next.onerror = reject;
    next.src = image;
  });
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Photo could not be prepared");
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, 256, 256);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function AvatarCropDialog({ image, onCancel, onSave }: {
  image: string;
  onCancel: () => void;
  onSave: (photo: string) => Promise<boolean>;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!area || busy) return;
    setBusy(true);
    setError(null);
    try {
      const saved = await onSave(await cropPhoto(image, area));
      if (!saved) setError("Couldn't save the photo. Try again.");
    } catch {
      setError("That photo couldn't be prepared. Try another.");
    } finally { setBusy(false); }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onCancel(); }}>
      <DialogContent className="kp-crop select-none w-[calc(100%-2rem)] max-w-sm rounded-lg border-primary/40 max-h-[90svh] overflow-y-auto"
        onEscapeKeyDown={(event) => { if (busy) event.preventDefault(); }}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}>
        <DialogTitle className="text-primary select-none">Frame your photo</DialogTitle>
        <DialogDescription className="sr-only">Profile photo crop</DialogDescription>
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-card touch-none">
          <Cropper image={image} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
            onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setArea(pixels)} />
        </div>
        <label className="flex items-center gap-3 text-xs text-primary">
          Zoom
          <input aria-label="Photo zoom" type="range" min={1} max={3} step={0.01} value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-primary" />
        </label>
        {error && <p role="alert" className="text-xs text-history-breach">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="ghost" disabled={busy} onClick={onCancel}>Cancel</Button>
          <Button disabled={busy || !area} onClick={save}>{busy ? "Saving…" : "Save photo"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}