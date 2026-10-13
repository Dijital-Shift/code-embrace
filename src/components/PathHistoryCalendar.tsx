import { useState, type ReactNode } from "react";
import { format, parseISO, startOfMonth } from "date-fns";
import { DayButton } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { statusLabel } from "@/lib/status";
import { cn } from "@/lib/utils";

export type HistoryCheckin = { checkin_date: string; status: string; breach_explanation?: string | null };
export type HistoryWord = { id: string; body: string; created_at: string; history_date: string; from_name: string; read_at: string | null; context: string | null };

export function PathHistoryCalendar({ checkins, words, startDate, today, renderWord }: {
  checkins: HistoryCheckin[];
  words: HistoryWord[];
  startDate: string;
  today: string;
  renderWord: (word: HistoryWord) => ReactNode;
}) {
  const [month, setMonth] = useState(() => startOfMonth(parseISO(today)));
  const [selected, setSelected] = useState<Date>();
  const byDate = new Map(checkins.map((c) => [c.checkin_date, c]));
  const wordsByDate = new Map<string, HistoryWord[]>();
  for (const word of words) wordsByDate.set(word.history_date, [...(wordsByDate.get(word.history_date) ?? []), word]);
  const key = selected ? format(selected, "yyyy-MM-dd") : "";
  const picked = byDate.get(key);
  const pickedWords = wordsByDate.get(key) ?? [];

  return (
    <section aria-label="Full Path history" className="mt-3 rounded-lg border border-border bg-card p-3 sm:p-4">
      <Calendar
        mode="single"
        month={month}
        onMonthChange={(next) => { setMonth(next); setSelected(undefined); }}
        selected={selected}
        onSelect={setSelected}
        startMonth={startOfMonth(parseISO(startDate))}
        endMonth={startOfMonth(parseISO(today))}
        disabled={[{ before: parseISO(startDate) }, { after: parseISO(today) }]}
        showOutsideDays={false}
        className="pointer-events-auto w-full bg-transparent p-0"
        classNames={{
          today: "rounded-md ring-1 ring-primary/40",
          day: "relative h-11 w-full select-none p-0 text-center",
          week: "mt-1 flex w-full gap-1",
          weekday: "flex-1 select-none text-xs font-normal text-muted-foreground",
        }}
        components={{ DayButton: ({ day, modifiers, className, children, ...props }: React.ComponentProps<typeof DayButton>) => {
          const date = format(day.date, "yyyy-MM-dd");
          const checkin = byDate.get(date);
          const hasNote = Boolean(checkin?.breach_explanation);
          const hasWords = (wordsByDate.get(date)?.length ?? 0) > 0;
          return (
            <Button {...props} variant="ghost" className={cn("history-day relative flex h-11 w-full min-w-0 flex-col gap-1 rounded-md p-0 text-xs font-medium", checkin && `history-${checkin.status}`, modifiers.selected && "ring-2 ring-primary", className)}
              aria-label={`${format(day.date, "MMMM d, yyyy")}${checkin ? `: ${statusLabel(checkin.status)}` : ": No check-in"}${hasNote ? ", breach note" : ""}${hasWords ? ", Watchman words" : ""}`}>
              {children}
              <span aria-hidden="true" className="flex h-1.5 items-center gap-1">
                {hasNote && <span className="h-1 w-1 rounded-full bg-history-breach" />}
                {hasWords && <span className="h-1 w-1 rounded-full bg-primary" />}
              </span>
            </Button>
          );
        } }}
      />
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-[0.65rem] text-muted-foreground">
        {[["completed", "Held"], ["breached", "Breach"], ["missed", "Silent"], ["skipped", "Sabbath"]].map(([status, label]) => (
          <span key={status} className="flex items-center gap-1.5"><span className={`history-${status} history-swatch h-2 w-2 rounded-sm`} />{label}</span>
        ))}
        <span className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-history-breach" />Breach note</span>
        <span className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary" />Watchman words</span>
      </div>
      {selected && (
        <div aria-live="polite" className="mt-4 border-t border-border pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{format(selected, "EEEE, MMMM d, yyyy")}</h3>
            <span className="text-xs text-primary">{picked ? statusLabel(picked.status) : "No check-in"}</span>
          </div>
          {picked?.breach_explanation && <div className="mt-3 border-l-2 border-history-breach pl-3"><p className="mb-1 text-xs font-semibold text-history-breach">Breach note</p><p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{picked.breach_explanation}</p></div>}
          {pickedWords.length > 0 && <div className="mt-4"><p className="mb-2 text-xs font-semibold text-primary">Watchman words</p><div className="flex flex-col gap-2">{pickedWords.map(renderWord)}</div></div>}
          {!picked?.breach_explanation && pickedWords.length === 0 && <p className="mt-2 text-xs text-muted-foreground">No notes or Watchman words for this day.</p>}
        </div>
      )}
    </section>
  );
}