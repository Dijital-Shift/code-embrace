import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppLayout } from "@/components/AppLayout";
import { getAdminOverview, getAdminUsers, setUserStatus, isAdmin } from "@/lib/api.functions";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Kingdom Protocol" }] }),
  component: () => <AppLayout><AdminPage /></AppLayout>,
});

function AdminPage() {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(isAdmin);
  const overviewFn = useServerFn(getAdminOverview);
  const usersFn = useServerFn(getAdminUsers);
  const setStatus = useServerFn(setUserStatus);

  const { data: adminCheck, isLoading: checking } = useQuery({ queryKey: ["isAdmin"], queryFn: () => checkAdmin() });
  useEffect(() => {
    if (!checking && adminCheck && !adminCheck.admin) navigate({ to: "/dashboard" });
  }, [checking, adminCheck, navigate]);

  const { data: ov } = useQuery({ queryKey: ["adminOv"], queryFn: () => overviewFn(), enabled: !!adminCheck?.admin });
  const { data: us, refetch } = useQuery({ queryKey: ["adminUsers"], queryFn: () => usersFn(), enabled: !!adminCheck?.admin });
  const mut = useMutation({
    mutationFn: (v: { user_id: string; status: "active" | "suspended" }) => setStatus({ data: v }),
    onSuccess: () => refetch(),
  });

  if (checking || !adminCheck?.admin) return <p className="text-[#9e968a]">Loading…</p>;

  const stats = [
    { label: "Active Users", v: ov?.totalUsers ?? 0 },
    { label: "Active Paths", v: ov?.activeLanes ?? 0 },
    { label: "New This Week", v: ov?.newUsersWeek ?? 0 },
    { label: "Today Aligned", v: ov?.todayCheckins ?? 0, c: "#4ade80" },
    { label: "Today Missed", v: ov?.todayMissed ?? 0, c: "#f59e0b" },
    { label: "Today Breaches", v: ov?.todayBreaches ?? 0, c: "#f87171" },
    { label: "Failed Notifs", v: ov?.failedNotifs ?? 0, c: (ov?.failedNotifs ?? 0) > 0 ? "#f87171" : "#4ade80" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Admin</h2>
      <p className="text-xs text-[#9e968a] mb-6">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      <div className="grid gap-2 mb-8" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))" }}>
        {stats.map((s) => (
          <div key={s.label} className="p-3 rounded-lg" style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
            <p className="text-[0.65rem] text-[#9e968a] uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: (s as any).c ?? "#fff" }}>{s.v}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-[#9e968a] uppercase tracking-wide mb-2 font-semibold">Users ({us?.users.length ?? 0})</p>
      <div className="flex flex-col gap-2">
        {(us?.users ?? []).map((u: any) => (
          <div key={u.user_id} className="flex items-center gap-3 p-3 rounded-md" style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{u.email}</p>
              <p className="text-[0.7rem] text-[#9e968a]">{u.phone || "no phone"} · {u.timezone}</p>
            </div>
            <span className="w-2 h-2 rounded-full" style={{ background: u.status === "active" ? "#4ade80" : "#f87171" }} />
            <button
              onClick={() => mut.mutate({ user_id: u.user_id, status: u.status === "active" ? "suspended" : "active" })}
              className="text-xs px-3 py-1 rounded border"
              style={{ borderColor: u.status === "active" ? "#f8717133" : "#4ade8033", color: u.status === "active" ? "#f87171" : "#4ade80", background: "#1a1a1a" }}
            >
              {u.status === "active" ? "Suspend" : "Activate"}
            </button>
          </div>
        ))}
      </div>
      <Link to="/dashboard" className="inline-block mt-6 text-sm text-[#b8b0a4]">← Back to app</Link>
    </div>
  );
}
