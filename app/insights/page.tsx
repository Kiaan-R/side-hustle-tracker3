"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/insights/page.tsx  –  Insights (/insights)
// ─────────────────────────────────────────────────────────────────────────────

import { useStore } from "@/lib/store";
import { buildInsights, fmt$, fmtDPH } from "@/lib/calculations";
import ScoreRing from "@/components/ScoreRing";
import type { Insight } from "@/lib/calculations";

const INSIGHT_CFG: Record<Insight["type"], {
  bg: string; border: string; text: string; sub: string; emoji: string;
}> = {
  INCREASE:    { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", sub: "text-emerald-600", emoji: "📈" },
  DECREASE:    { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-800",   sub: "text-amber-600",   emoji: "📉" },
  REPLACE:     { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-800",     sub: "text-red-600",     emoji: "🔄" },
  OPPORTUNITY: { bg: "bg-blue-50",    border: "border-brand-200",   text: "text-brand-900",   sub: "text-brand-600",   emoji: "⏱" },
};

export default function InsightsPage() {
  const { hustles, stats } = useStore();

  function openAdd() {
    if (typeof window !== "undefined")
      // @ts-ignore
      window.__hustleiq_openAdd?.();
  }

  if (hustles.length === 0) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <div className="mb-5 text-6xl">📊</div>
        <h2
          className="mb-2 text-xl font-extrabold text-brand-900"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          No data yet
        </h2>
        <p className="mb-7 max-w-xs text-sm text-slate-400">
          Add at least 2 hustles and log sessions to unlock insights.
        </p>
        <button onClick={openAdd} className="hiq-btn px-6 py-3">
          + Add Your First Hustle
        </button>
      </div>
    );
  }

  const sortedByScore = [...hustles]
    .map((h) => ({ h, s: stats.find((x) => x.hustleId === h.id)! }))
    .filter((p) => p.s)
    .sort((a, b) => b.s.valueScore - a.s.valueScore);

  const sortedByDPH = [...sortedByScore].sort((a, b) => b.s.dph - a.s.dph);
  const topDPH      = sortedByDPH[0]?.s.dph ?? 0;
  const insights    = buildInsights(hustles, stats);
  const totalScore  = sortedByScore.reduce((a, p) => a + p.s.valueScore, 0) || 1;
  const WEEKLY      = 20;

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div>
        <h1
          className="text-2xl font-extrabold text-brand-900"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Insights 📊
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">
          Data-driven decisions for your time
        </p>
      </div>

      {/* ── A. Rankings ── */}
      <section>
        <SectionTitle emoji="🏆" title="Rankings" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Best Value Score",
              hustle: sortedByScore[0]?.h,
              metric: `Score ${sortedByScore[0]?.s.valueScore ?? "—"}`,
              accent: true,
            },
            {
              label: "Best $/hr",
              hustle: sortedByDPH[0]?.h,
              metric: sortedByDPH[0]?.s.dph > 0 ? fmtDPH(sortedByDPH[0].s.dph) : "—",
            },
            {
              label: "Best Skill Builder",
              hustle: [...hustles].sort((a, b) => b.skillRating - a.skillRating)[0],
              metric: `${[...hustles].sort((a, b) => b.skillRating - a.skillRating)[0]?.skillRating ?? "—"}/5 skills`,
            },
            {
              label: "Lowest Performer",
              hustle: sortedByScore[sortedByScore.length - 1]?.h,
              metric: `Score ${sortedByScore[sortedByScore.length - 1]?.s.valueScore ?? "—"}`,
            },
          ].map(({ label, hustle, metric, accent }) =>
            hustle ? (
              <div
                key={label}
                className={`rounded-2xl border p-4 ${
                  accent
                    ? "border-brand-900 bg-brand-900"
                    : "border-blue-100 bg-white shadow-card"
                }`}
              >
                <p
                  className={`mb-2 text-[10px] font-bold uppercase tracking-widest ${
                    accent ? "text-brand-300" : "text-slate-400"
                  }`}
                >
                  {label}
                </p>
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="text-lg">{hustle.emoji}</span>
                  <p
                    className={`truncate text-sm font-semibold ${
                      accent ? "text-white" : "text-brand-900"
                    }`}
                  >
                    {hustle.name}
                  </p>
                </div>
                <p
                  className={`font-display text-xl font-extrabold ${
                    accent ? "text-brand-300" : "text-brand-600"
                  }`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {metric}
                </p>
              </div>
            ) : null
          )}
        </div>
      </section>

      {/* ── B. Opportunity Cost Table ── */}
      <section>
        <SectionTitle emoji="⏱" title="Opportunity Cost Analysis" />
        <div className="hiq-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {["Hustle", "Your $/hr", "Best $/hr", "Cost vs Best", "Weekly cost (10h)"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedByScore.map(({ h, s }, i) => {
                  const cost = Math.max(0, topDPH - s.dph);
                  return (
                    <tr
                      key={h.id}
                      className={`border-b border-slate-50 transition-colors hover:bg-slate-50/60 ${
                        i % 2 !== 0 ? "bg-slate-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-brand-900">
                        <span className="mr-1.5">{h.emoji}</span>
                        {h.name}
                      </td>
                      <td className="px-4 py-3 font-semibold text-brand-600">
                        {s.dph > 0 ? fmtDPH(s.dph) : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {topDPH > 0 ? fmtDPH(topDPH) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {cost > 0.5 ? (
                          <span className="font-bold text-red-500">
                            −${cost.toFixed(2)}
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-600">
                            🏆 Best
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {cost > 0.5 ? (
                          <span className="font-bold text-red-500">
                            −${(cost * 10).toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── C. Recommendations ── */}
      <section>
        <SectionTitle emoji="🎯" title="Recommendations" />
        {insights.length === 0 ? (
          <div className="hiq-card p-6 text-center text-sm text-slate-400">
            Log sessions to generate personalised recommendations.
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((ins, i) => {
              const cfg = INSIGHT_CFG[ins.type];
              return (
                <div
                  key={i}
                  className={`flex items-start gap-4 rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border text-lg ${cfg.bg} ${cfg.border}`}
                  >
                    {cfg.emoji}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${cfg.text}`}>
                      <span className="mr-1">{ins.hustleEmoji}</span>
                      {ins.headline}
                    </p>
                    <p className={`mt-0.5 text-xs leading-relaxed ${cfg.sub}`}>
                      {ins.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── D. Value Score Breakdown ── */}
      <section>
        <SectionTitle emoji="🔢" title="Value Score Breakdown" />
        <div className="hiq-card divide-y divide-slate-50">
          {sortedByScore.map(({ h, s }) => (
            <div
              key={h.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors"
            >
              <ScoreRing score={s.valueScore} size={48} />
              <div className="flex items-center gap-2 w-36">
                <span className="text-lg">{h.emoji}</span>
                <span className="text-sm font-semibold text-brand-900 truncate">
                  {h.name}
                </span>
              </div>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${s.valueScore}%`,
                      background: `linear-gradient(90deg, ${h.color}88, ${h.color})`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-right text-xs w-52">
                <MiniStat label="$/hr"   value={s.dph > 0 ? fmtDPH(s.dph) : "—"} />
                <MiniStat label="Skill"  value={`${h.skillRating}/5`} />
                <MiniStat label="Consis" value={`${s.consistency}/5`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── E. Time Allocation ── */}
      <section>
        <SectionTitle emoji="📅" title="Suggested Weekly Allocation" />
        <p className="mb-4 text-xs text-slate-400">
          Based on {WEEKLY}h / week, weighted by Value Score
        </p>
        <div className="hiq-card space-y-3 p-5">
          {sortedByScore.map(({ h, s }) => {
            const hrs = ((s.valueScore / totalScore) * WEEKLY).toFixed(1);
            const pct = (s.valueScore / totalScore) * 100;
            return (
              <div key={h.id} className="flex items-center gap-3">
                <div className="flex w-36 flex-shrink-0 items-center gap-2">
                  <span className="text-base">{h.emoji}</span>
                  <span className="truncate text-sm font-semibold text-brand-900">
                    {h.name}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden rounded-full h-2.5 bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${h.color}88, ${h.color})`,
                    }}
                  />
                </div>
                <span className="w-14 text-right text-sm font-bold text-brand-900">
                  {hrs}h/wk
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionTitle({ emoji, title }: { emoji: string; title: string }) {
  return (
    <h2
      className="mb-4 flex items-center gap-2 text-base font-extrabold text-brand-900"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <span>{emoji}</span> {title}
    </h2>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-xs font-semibold text-brand-900">{value}</p>
    </div>
  );
}
