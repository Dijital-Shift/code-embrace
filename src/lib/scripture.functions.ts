import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Send Scripture's public verse search (publishable key, safe to ship).
const SS_URL = "https://ioeolzlmlsoivhqioqui.supabase.co/functions/v1/get-verses";
const SS_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZW9semxtbHNvaXZocWlvcXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjM0MTcsImV4cCI6MjA4NzM5OTQxN30.YCQ-uusfloTayDFvlhlgzOEwH1G8yWJ4v5M1SVeRgJ4";

type SSVerse = { reference: string; start_verse: number; end_verse: number; verses: { full_text: string }[] };

// Modern substance terms aren't KJV vocabulary — translate them into the
// biblical concepts (sober mind, temple of the body) before querying.
const CONCEPT_MAP: [RegExp, string][] = [
  [/\b(cannabis|marijuana|weed|pot|thc|edibles?)\b/i, "sober minded vigilant sound mind"],
  [/\b(smok(e|ing)|vap(e|ing)|tobacco|cigarettes?|nicotine)\b/i, "body temple of God holy"],
  [/\b(drugs?|substances?|pills?)\b/i, "sober vigilant walk in the Spirit"],
];

function expandQuery(text: string): string {
  const extras = CONCEPT_MAP.filter(([re]) => re.test(text)).map(([, v]) => v);
  return extras.length ? `${text}. ${extras.join(". ")}` : text;
}

export const fetchPathScripture = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ text: z.string().trim().min(2).max(400) }).parse(d))
  .handler(async ({ data, context }) => {
    try {
      const res = await fetch(SS_URL, {
        method: "POST",
        headers: {
          apikey: SS_KEY,
          Authorization: `Bearer ${SS_KEY}`,
          "content-type": "application/json",
          "x-device-id": `kingdom-protocol-${context.userId}`,
        },
        body: JSON.stringify({ text: expandQuery(data.text) }),
      });
      if (!res.ok) {
        console.error("[send-scripture] status", res.status);
        return { verses: [] as string[], error: "Send Scripture couldn't find verses right now. Try again in a moment." };
      }
      const json = (await res.json()) as { verses?: SSVerse[] };
      const verses = (json.verses ?? [])
        .filter((v) => v.end_verse - v.start_verse <= 2) // max 3 verses per slot
        .map((v) => `${v.verses.map((x) => x.full_text.trim()).join(" ")} — ${v.reference} (KJV)`)
        .slice(0, 6);
      return { verses, error: null as string | null };
    } catch (e) {
      console.error("[send-scripture]", e);
      return { verses: [] as string[], error: "Send Scripture couldn't be reached. Try again in a moment." };
    }
  });
