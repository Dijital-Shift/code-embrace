import { useEffect, useLayoutEffect, useRef } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SCRIPTURE_UNDO_MS, scriptureUndoValue } from "@/lib/scripture-undo";

export function ScriptureSlot({ value, onChange, placeholder, number }: { value: string; onChange: (value: string) => void; placeholder?: string; number: number }) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const current = useRef(value);
  const change = useRef(onChange);
  const undoToast = useRef<string | number | undefined>(undefined);
  const generation = useRef(0);
  current.current = value;
  change.current = onChange;

  useLayoutEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);

  useEffect(() => () => {
    generation.current += 1;
    if (undoToast.current !== undefined) toast.dismiss(undoToast.current);
  }, []);

  function clear() {
    const previous = current.current;
    if (!previous) return;
    const clearedAt = Date.now();
    const version = ++generation.current;
    if (undoToast.current !== undefined) toast.dismiss(undoToast.current);
    current.current = "";
    change.current("");
    textarea.current?.focus({ preventScroll: true });
    undoToast.current = toast("Scripture cleared", {
      duration: SCRIPTURE_UNDO_MS,
      action: {
        label: "Undo",
        onClick: () => {
          if (version !== generation.current) return;
          const restored = scriptureUndoValue(previous, current.current, clearedAt, Date.now());
          if (restored === null) return;
          current.current = restored;
          change.current(restored);
          textarea.current?.focus({ preventScroll: true });
        },
      },
    });
  }

  return (
    <div className="group relative">
      <textarea ref={textarea} rows={2} value={value} maxLength={800} placeholder={placeholder}
        aria-label={`Support Scripture ${number}`}
        onChange={(event) => { current.current = event.target.value; onChange(event.target.value); }}
        className="w-full resize-none overflow-hidden rounded-md border border-border bg-card px-4 py-3 pr-16 text-base leading-relaxed text-foreground outline-none"
      />
      {value.length > 0 && (
        <Button type="button" variant="pathEdit" size="icon" aria-label={`Clear Scripture ${number}`} title="Clear Scripture"
          onClick={clear}
          className="absolute right-2 top-2 text-stone group-focus-within:border-primary group-focus-within:text-primary">
          <X aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}