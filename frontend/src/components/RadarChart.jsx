import React from 'react';

export default function RadarChart({ nutrients = [] }) {
  if (!nutrients || nutrients.length === 0) return null;

  const size = 380;
  const center = size / 2;
  const radius = size * 0.38;
  const total = nutrients.length;
  const angleStep = (Math.PI * 2) / total;
  const rings = [0.25, 0.5, 0.75, 1.0];

  const scorePoints = nutrients.map((n, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (n.score || 0) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-between">
      <div className="text-center mb-2">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          7-Nutrient Risk Radar Matrix
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Simultaneous multi-axis risk visualization
        </p>
      </div>

      <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
          {rings.map((ring, idx) => {
            const points = nutrients.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const r = ring * radius;
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ');

            return (
              <g key={idx}>
                <polygon
                  points={points}
                  fill={idx === 0 ? 'rgba(16, 185, 129, 0.05)' : idx === 3 ? 'rgba(239, 68, 68, 0.03)' : 'none'}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  strokeDasharray={idx < 3 ? '2 2' : 'none'}
                  className="dark:stroke-slate-700"
                />
                <text
                  x={center + 4}
                  y={center - ring * radius + 10}
                  fontSize="8"
                  fill="#94a3b8"
                  className="font-mono font-bold"
                >
                  {Math.round(ring * 100)}%
                </text>
              </g>
            );
          })}

          {nutrients.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#e2e8f0"
                strokeWidth="1"
                className="dark:stroke-slate-800"
              />
            );
          })}

          <polygon
            points={scorePoints}
            fill="rgba(59, 130, 246, 0.25)"
            stroke="#2563eb"
            strokeWidth="2.5"
            className="animate-pulse duration-1000"
          />

          {nutrients.map((n, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = (n.score || 0) * radius;
            const dotX = center + r * Math.cos(angle);
            const dotY = center + r * Math.sin(angle);

            const labelR = radius + 24;
            const labelX = center + labelR * Math.cos(angle);
            const labelY = center + labelR * Math.sin(angle);

            return (
              <g key={n.nutrient_id}>
                <circle
                  cx={dotX}
                  cy={dotY}
                  r="4.5"
                  fill={n.hex_color || '#3B82F6'}
                  stroke="white"
                  strokeWidth="1.5"
                  className="shadow"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[11px] font-bold fill-slate-800 dark:fill-slate-200"
                >
                  {n.name}
                </text>
                <text
                  x={labelX}
                  y={labelY + 11}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[9px] font-mono fill-slate-400 dark:fill-slate-500 font-semibold"
                >
                  {n.score_pct}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-center space-x-3 pt-3 text-[10px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Healthy (&lt;25%)</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Low (25-50%)</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>Med (50-75%)</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>High (&gt;75%)</span>
        </span>
      </div>
    </div>
  );
}
