"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/page.tsx  –  Dashboard (/)
// ─────────────────────────────────────────────────────────────────────────────

import { useStore } from "@/lib/store";
import HustleCard  from "@/components/HustleCard";
import { fmt$, fmtDPH } from "@/lib/calculations";

export default function DashboardPage() {
  const { hustles, sessions, stats, removeHustle } = useStore();

  /* ── global openers injected by ClientShell ── */
  function openAdd() {
    if (typeof window !== "undefined")
      // @ts-ignore
      window.__hustleiq_openAdd?.();
  }
  function openLog(id?: string) {
    if (typeof window !== "undefined")
      // @ts-ignore
      window.__hustleiq_openLog?.(id);
  }

  /* ── Weekly KPIs ── */
  const weekAgo       = new Date(Date.now() - 7 * 86_400_000);
  const weekSessions  = sessions.filter((s) => new Date(s.date) >= weekAgo);
  const weekIncome    = weekSessions.reduce((a, s) => a + s.income, 0);
  const weekHours     = weekSessions.reduce((a, s) => a + s.hours, 0);
  const sortedStats   = [...stats].sort((a, b) => b.valueScore - a.valueScore);
  const topStat       = sortedStats[0];
  const topHustle     = hustles.find((h) => h.id === topStat?.hustleId);
  const bestDPH       = Math.max(0, ...stats.map((s) => s.dph));
  const sortedHustles = [...hustles].sort((a, b) => {
    const sa = stats.find((x) => x.hustleId === a.id)?.valueScore ?? 0;
    const sb = stats.find((x) => x.hustleId === b.id)?.valueScore ?? 0;
    return sb - sa;
  });

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-7 flex items-end justify-between">
        <div>
          <h1
            className="text-2xl font-extrabold text-brand-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Dashboard 👋
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Ranked by Value Score · highest first
          </p>
        </div>
        {hustles.length > 0 && (
          <button
            onClick={() => openLog()}
            className="hiq-btn-ghost text-xs px-4 py-2"
          >
            ⏱ Log Session
          </button>
        )}
      </div>

      {/* ── KPI bar ── */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          emoji="💵"
          label="This Week"
          value={weekIncome > 0 ? fmt$(weekIncome) : "—"}
          sub="income earned"
        />
        <KpiCard
          emoji="⚡"
          label="Best $/hr"
          value={bestDPH > 0 ? fmtDPH(bestDPH) : "—"}
          sub={topHustle?.name ?? "No hustles yet"}
        />
        <KpiCard
          emoji="⏰"
          label="Hours"
          value={weekHours > 0 ? `${weekHours.toFixed(1)}h` : "—"}
          sub="this week"
        />
        <KpiCard
          emoji="🏆"
          label="Top Score"
          value={topStat ? String(topStat.valueScore) : "—"}
          sub={topHustle?.name ?? "No hustles yet"}
          accent
        />
      </div>

      {/* ── Hustle grid ── */}
      {hustles.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedHustles.map((h) => (
            <HustleCard
              key={h.id}
              hustle={h}
              stats={stats.find((s) => s.hustleId === h.id)}
              bestDPH={bestDPH}
              onRemove={removeHustle}
              onLog={openLog}
            />
          ))}
          {/* Add card */}
          <button
            onClick={openAdd}
            className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 text-slate-400 transition-all hover:border-brand-400 hover:text-brand-500"
          >
            <span className="text-3xl">➕</span>
            <span className="text-sm font-semibold">Add Hustle</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function KpiCard({
  emoji,
  label,
  value,
  sub,
  accent,
}: {
  emoji: string;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "border-brand-900 bg-brand-900"
          : "border-blue-100 bg-white shadow-card"
      }`}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-sm">{emoji}</span>
        <p
          className={`text-[10px] font-bold uppercase tracking-widest ${
            accent ? "text-brand-300" : "text-slate-400"
          }`}
        >
          {label}
        </p>
      </div>
      <p
        className={`font-display text-2xl font-extrabold leading-none ${
          accent ? "text-white" : "text-brand-900"
        }`}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {value}
      </p>
      <p
        className={`mt-1 truncate text-[11px] ${
          accent ? "text-brand-300" : "text-slate-400"
        }`}
      >
        {sub}
      </p>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-5 text-6xl">💼</div>
      <h2
        className="mb-2 text-xl font-extrabold text-brand-900"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        No hustles yet
      </h2>
      <p className="mb-7 max-w-xs text-sm text-slate-400">
        Add your first hustle to start tracking income, opportunity cost, and
        your Value Score.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button onClick={onAdd} className="hiq-btn px-6 py-3">
          ⚡ Add from Templates
        </button>
        <button onClick={onAdd} className="hiq-btn-ghost px-6 py-3">
          ✏️ Custom Hustle
        </button>
      </div>
    </div>
  );
}
