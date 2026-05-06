"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/HustleCard.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Trash2 } from "lucide-react";
import ScoreRing from "./ScoreRing";
import { fmtDPH, fmt$ } from "@/lib/calculations";
import type { Hustle, HustleStats, Tag } from "@/lib/calculations";

const TAG_CFG: Record<Tag, { bg: string; text: string; border: string; emoji: string }> = {
  INCREASE: { bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200", emoji: "📈" },
  DECREASE: { bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200",   emoji: "📉" },
  REPLACE:  { bg: "bg-red-50",      text: "text-red-700",     border: "border-red-200",     emoji: "🔄" },
  HOLD:     { bg: "bg-slate-50",    text: "text-slate-600",   border: "border-slate-200",   emoji: "🔍" },
};

interface Props {
  hustle:   Hustle;
  stats:    HustleStats | undefined;
  bestDPH:  number;
  onRemove: (id: string) => void;
  onLog:    (id: string) => void;
}

export default function HustleCard({ hustle, stats, bestDPH, onRemove, onLog }: Props) {
  const s        = stats;
  const tag      = s?.tag ?? "HOLD";
  const cfg      = TAG_CFG[tag];
  const dph      = s?.dph ?? 0;
  const oppCost  = bestDPH > 0 && dph > 0 ? Math.max(0, bestDPH - dph) : 0;

  return (
    <article className="hiq-card group flex flex-col overflow-hidden hover:shadow-card-lg hover:-translate-y-0.5 animate-fade-in">
      {/* Colour accent bar */}
      <div className="h-1 w-full" style={{ background: hustle.color }} />

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
              style={{ background: `${hustle.color}18` }}
            >
              {hustle.emoji}
            </div>
            <div>
              <p className="font-semibold text-brand-900 leading-tight">{hustle.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{hustle.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`hiq-badge ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
              {cfg.emoji} {tag}
            </span>
            <button
              onClick={() => onRemove(hustle.id)}
              className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-slate-300 transition-all hover:bg-red-50 hover:text-red-400"
              aria-label="Remove hustle"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Score + stats grid */}
        <div className="flex items-center gap-4">
          <ScoreRing score={s?.valueScore ?? 0} size={60} />
          <div className="grid grid-cols-2 gap-x-5 gap-y-2 flex-1">
            <Stat label="$/hr"        value={dph > 0 ? fmtDPH(dph) : "—"} highlight />
            <Stat label="Sessions"    value={String(s?.sessionCount ?? 0)} />
            <Stat label="Total Earned" value={s && s.totalIncome > 0 ? fmt$(s.totalIncome) : "—"} />
            <Stat label="Skill Rating" value={`${hustle.skillRating}/5`} />
          </div>
        </div>

        {/* Score bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${s?.valueScore ?? 0}%`,
              background: `linear-gradient(90deg, ${hustle.color}99, ${hustle.color})`,
            }}
          />
        </div>

        {/* Opportunity cost pill */}
        {oppCost > 0.5 && (
          <div className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-[11px] text-brand-600">
            <span>⏱</span>
            <span>
              <strong>Opp. cost:</strong> every hr here ={" "}
              <strong>${oppCost.toFixed(2)}</strong> less than your top hustle
            </span>
          </div>
        )}

        {/* Log session CTA */}
        <button
          onClick={() => onLog(hustle.id)}
          className="mt-auto rounded-xl border border-blue-100 py-2 text-xs font-semibold text-brand-600 transition-all hover:border-brand-600 hover:bg-brand-50"
        >
          + Log Session
        </button>
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="hiq-label">{label}</p>
      <p
        className={`text-sm font-semibold leading-tight ${
          highlight ? "text-brand-600" : "text-brand-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
