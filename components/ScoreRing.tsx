"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/ScoreRing.tsx  –  Animated SVG ring showing the Value Score
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreRing({ score, size = 56, strokeWidth = 5 }: Props) {
  const r          = (size - strokeWidth * 2) / 2;
  const cx         = size / 2;
  const cy         = size / 2;
  const circ       = 2 * Math.PI * r;
  const dashFill   = (Math.min(100, Math.max(0, score)) / 100) * circ;
  const dashOffset = circ / 4; // rotate start to 12 o'clock

  const color =
    score >= 65 ? "#059669" :
    score >= 40 ? "#d97706" :
                  "#dc2626";

  const bg =
    score >= 65 ? "#d1fae5" :
    score >= 40 ? "#fef3c7" :
                  "#fee2e2";

  const fontSize = size < 44 ? 10 : size < 64 ? 13 : 16;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`Value Score ${score}`}
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={strokeWidth}
      />
      {/* fill */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${dashFill} ${circ}`}
        strokeDashoffset={dashOffset}
        style={{ transition: "stroke-dasharray .6s ease" }}
      />
      {/* score text */}
      <text
        x={cx} y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fontWeight="800"
        fontFamily="'Plus Jakarta Sans', Inter, sans-serif"
        fill={color}
      >
        {score}
      </text>
    </svg>
  );
}
