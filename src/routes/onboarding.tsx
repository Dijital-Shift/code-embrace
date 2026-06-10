import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveOnboarding } from "@/lib/api.functions";
import { AuthGate } from "@/components/AuthGate";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — Kingdom Protocol" }] }),
  component: () => <AuthGate><Onboarding /></AuthGate>,
});

function Onboarding() {
  const fn = useServerFn(saveOnboarding);
  const navigate = useNavigate();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!gender) { setErr("Please select male or female."); return; }
    setBusy(true); setErr(null);
    const r: any = await fn({ data: { first_name: first.trim(), last_name: last.trim(), gender } });
    setBusy(false);
    if (r?.error) setErr(r.error);
    else navigate({ to: "/dashboard" });
  }

  const inputCls = "flex-1 px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none w-full";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: "#000" }}>
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <h1 className="text-[1.4rem] font-bold mb-2">Welcome to Kingdom Protocol</h1>
        <p className="text-[#666] text-sm mb-8">A few quick details so your watchmen know who they're walking with.</p>
        <form onSubmit={submit} className="w-full flex flex-col gap-4">
          <div className="flex gap-3">
            <input required maxLength={50} value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name" className={inputCls} />
            <input required maxLength={50} value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last name" className={inputCls} />
          </div>
          <div className="flex flex-col gap-2 text-left">
            <label className="text-xs uppercase tracking-wider text-[#888] font-semibold">Male or Female</label>
            <div className="grid grid-cols-2 gap-2">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className="py-3 rounded-md border text-sm font-semibold capitalize"
                  style={{
                    background: gender === g ? "#c9a84c" : "#111",
                    color: gender === g ? "#000" : "#fff",
                    borderColor: gender === g ? "#c9a84c" : "#222",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
            <p className="text-[0.7rem] text-[#555] leading-relaxed">This is how the Father made you. We use it for pastoral fit, not for public display.</p>
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button disabled={busy} className="py-3.5 bg-white text-black rounded-md font-semibold">
            {busy ? "Saving…" : "Get Started"}
          </button>
        </form>
      </div>
    </main>
  );
}
