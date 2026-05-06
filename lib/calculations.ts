// ─────────────────────────────────────────────────────────────────────────────
// lib/calculations.ts  –  HustleIQ Value Score Engine
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export type Category =
  | "Freelance"
  | "Gig Economy"
  | "Content Creation"
  | "Tutoring"
  | "Retail / Resale"
  | "Real Estate"
  | "Investing"
  | "Other";

export type Tag = "INCREASE" | "DECREASE" | "REPLACE" | "HOLD";

export interface Session {
  id: string;
  hustleId: string;
  date: string;       // ISO date string  "2024-06-01"
  hours: number;
  income: number;
  notes?: string;
}

export interface Hustle {
  id: string;
  name: string;
  category: Category;
  emoji: string;
  skillRating: number;  // 1 – 5  (user input)
  createdAt: string;    // ISO
  color: string;        // accent hex for card top border
}

// ── Derived per-hustle stats ─────────────────────────────────────────────────

export interface HustleStats {
  hustleId: string;
  totalHours: number;
  totalIncome: number;
  dph: number;           // dollars-per-hour  (0 if no sessions)
  sessionCount: number;
  consistency: number;   // 1-5 derived from session count
  valueScore: number;    // 0 – 100
  tag: Tag;
  oppCostPerHour: number;  // cost vs best DPH hustle
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Clamp a number between min and max */
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

/** Map sessionCount → consistency score 1-5 */
function sessionsToConsistency(count: number): number {
  if (count <= 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  if (count <= 7) return 4;
  return 5;
}

// ── Core: compute stats for every hustle ────────────────────────────────────

/**
 * computeAllStats
 *
 * For every hustle, aggregate sessions → derive DPH, consistency, value score,
 * opportunity cost, and tag recommendation.
 *
 * Formula (PRD):
 *   ValueScore = (normDPH * 0.60) + (normSkill * 0.25) + (normConsistency * 0.15)
 *   Normalised to 0-100.
 */
export function computeAllStats(
  hustles: Hustle[],
  sessions: Session[]
): HustleStats[] {
  if (hustles.length === 0) return [];

  // 1. Aggregate raw numbers per hustle
  const raw = hustles.map((h) => {
    const hs = sessions.filter((s) => s.hustleId === h.id);
    const totalHours  = hs.reduce((a, s) => a + s.hours, 0);
    const totalIncome = hs.reduce((a, s) => a + s.income, 0);
    const dph         = totalHours > 0 ? totalIncome / totalHours : 0;
    const sessionCount = hs.length;
    const consistency = sessionsToConsistency(sessionCount);
    return { h, totalHours, totalIncome, dph, sessionCount, consistency };
  });

  // 2. Find max DPH for normalisation (floor at $25 so new hustles get a fair baseline)
  const maxDPH = Math.max(25, ...raw.map((r) => r.dph));

  // 3. Compute value scores
  const withScores = raw.map((r) => {
    const normDPH         = clamp((r.dph / maxDPH) * 100, 0, 100);
    const normSkill       = clamp(((r.h.skillRating - 1) / 4) * 100, 0, 100);
    const normConsistency = clamp(((r.consistency - 1) / 4) * 100, 0, 100);
    const valueScore = Math.round(
      normDPH * 0.60 + normSkill * 0.25 + normConsistency * 0.15
    );
    return { ...r, valueScore };
  });

  // 4. Best DPH hustle (for opportunity cost)
  const bestDPH = Math.max(0, ...withScores.map((r) => r.dph));

  // 5. Assign tags
  const scores = withScores.map((r) => r.valueScore);
  const maxScore = Math.max(1, ...scores);
  const minScore = Math.min(...scores);

  const stats: HustleStats[] = withScores.map((r) => {
    const oppCostPerHour = Math.max(0, bestDPH - r.dph);

    let tag: Tag;
    if (hustles.length === 1) {
      tag = "HOLD";
    } else if (r.valueScore === maxScore) {
      tag = "INCREASE";
    } else if (r.valueScore === minScore && r.valueScore < 40) {
      tag = "REPLACE";
    } else if (r.dph < bestDPH * 0.55 && r.sessionCount > 0) {
      tag = "DECREASE";
    } else {
      tag = "HOLD";
    }

    return {
      hustleId:      r.h.id,
      totalHours:    r.totalHours,
      totalIncome:   r.totalIncome,
      dph:           r.dph,
      sessionCount:  r.sessionCount,
      consistency:   r.consistency,
      valueScore:    r.valueScore,
      tag,
      oppCostPerHour,
    };
  });

  return stats;
}

// ── Insights helpers ─────────────────────────────────────────────────────────

export interface Insight {
  type: "INCREASE" | "DECREASE" | "REPLACE" | "OPPORTUNITY";
  hustleName: string;
  hustleEmoji: string;
  headline: string;
  body: string;
}

export function buildInsights(
  hustles: Hustle[],
  stats: HustleStats[]
): Insight[] {
  if (hustles.length === 0) return [];

  const insights: Insight[] = [];

  // Pair hustle with stats
  const pairs = hustles
    .map((h) => ({ h, s: stats.find((x) => x.hustleId === h.id)! }))
    .filter((p) => p.s)
    .sort((a, b) => b.s.valueScore - a.s.valueScore);

  const best  = pairs[0];
  const worst = pairs[pairs.length - 1];
  const bestDPH = Math.max(0, ...pairs.map((p) => p.s.dph));

  // INCREASE – top scorer
  if (best) {
    insights.push({
      type: "INCREASE",
      hustleName:  best.h.name,
      hustleEmoji: best.h.emoji,
      headline: `Invest more time in ${best.h.name}`,
      body: `With a Value Score of ${best.s.valueScore}/100 and $${best.s.dph.toFixed(2)}/hr, this is your highest-return hustle. Prioritise it.`,
    });
  }

  // OPPORTUNITY COST for every hustle below best
  pairs.slice(1).forEach(({ h, s }) => {
    if (s.dph > 0 && s.oppCostPerHour > 0.5) {
      insights.push({
        type: "OPPORTUNITY",
        hustleName:  h.name,
        hustleEmoji: h.emoji,
        headline: `Every hour on ${h.name} costs you $${s.oppCostPerHour.toFixed(2)}`,
        body: `Your best hustle (${best.h.name}) earns $${bestDPH.toFixed(2)}/hr. Shifting one hour from ${h.name} could net you $${s.oppCostPerHour.toFixed(2)} more.`,
      });
    }
  });

  // DECREASE – below 55 % of best DPH
  pairs.forEach(({ h, s }) => {
    if (s.dph > 0 && s.dph < bestDPH * 0.55 && s.tag === "DECREASE") {
      insights.push({
        type: "DECREASE",
        hustleName:  h.name,
        hustleEmoji: h.emoji,
        headline: `Reduce time on ${h.name}`,
        body: `At $${s.dph.toFixed(2)}/hr this hustle underperforms your average. Cut hours here and redirect them to higher-value work.`,
      });
    }
  });

  // REPLACE – worst with low score
  if (worst && worst.s.tag === "REPLACE" && pairs.length >= 2) {
    insights.push({
      type: "REPLACE",
      hustleName:  worst.h.name,
      hustleEmoji: worst.h.emoji,
      headline: `Consider replacing ${worst.h.name}`,
      body: `Score ${worst.s.valueScore}/100 is your portfolio's weakest link. The time you spend here could earn $${worst.s.oppCostPerHour.toFixed(2)}/hr more elsewhere.`,
    });
  }

  return insights;
}

// ── Formatting helpers ───────────────────────────────────────────────────────

export function fmt$(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function fmtDPH(n: number): string {
  return `$${n.toFixed(2)}/hr`;
}

// ── Preset hustles ───────────────────────────────────────────────────────────

export interface HustlePreset {
  name: string;
  category: Category;
  emoji: string;
  color: string;
  skillRating: number;
  avgEarnings: string;
  description: string;
  audience: "teen" | "adult";
}

export const HUSTLE_PRESETS: HustlePreset[] = [
  // ── Teens ──────────────────────────────────────────────────────────────────
  {
    name: "Freelance Graphic Design",
    category: "Freelance",
    emoji: "🎨",
    color: "#3b82f6",
    skillRating: 5,
    avgEarnings: "$20 – $50 / hr",
    description: "Create logos and social graphics for small businesses on Fiverr or Upwork.",
    audience: "teen",
  },
  {
    name: "Content Creation",
    category: "Content Creation",
    emoji: "📱",
    color: "#ec4899",
    skillRating: 4,
    avgEarnings: "$15 – $80 / hr",
    description: "Grow a niche on TikTok or YouTube. Monetise through brand deals and affiliates.",
    audience: "teen",
  },
  // ── Adults ─────────────────────────────────────────────────────────────────
  {
    name: "Real Estate Rentals",
    category: "Real Estate",
    emoji: "🏠",
    color: "#10b981",
    skillRating: 4,
    avgEarnings: "$40 – $120 / hr equiv.",
    description: "Buy, rent, or manage properties. Passive income with long-term appreciation.",
    audience: "adult",
  },
  {
    name: "Stock & Options Trading",
    category: "Investing",
    emoji: "📈",
    color: "#f59e0b",
    skillRating: 3,
    avgEarnings: "Highly variable",
    description: "Trade equities and options. High risk / reward — best for disciplined researchers.",
    audience: "adult",
  },
];

export const CATEGORIES: Category[] = [
  "Freelance",
  "Gig Economy",
  "Content Creation",
  "Tutoring",
  "Retail / Resale",
  "Real Estate",
  "Investing",
  "Other",
];

export const CARD_COLORS = [
  "#3b82f6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
];
