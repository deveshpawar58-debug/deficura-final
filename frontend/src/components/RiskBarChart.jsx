import React from 'react';
import { getTierColorClasses } from '../utils/helpers';

export default function RiskBarChart({ nutrients = [] }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Comparative Risk Distribution S(N)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Normalized score comparison with clinical threshold cutoffs
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
          Range [0.0 - 1.0]
        </span>
      </div>

      <div className="space-y-3.5 pt-2">
        {nutrients.map(n => {
          const colorStyles = getTierColorClasses(n.risk_tier);

          return (
            <div key={n.nutrient_id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {n.name}
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colorStyles.badge}`}>
                    {n.risk_tier}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-xs w-12 text-right">
                    {n.score_pct}%
                  </span>
                </div>
              </div>

              <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="absolute top-0 bottom-0 left-[25%] w-px bg-slate-300 dark:bg-slate-700 z-10" />
                <div className="absolute top-0 bottom-0 left-[50%] w-px bg-slate-300 dark:bg-slate-700 z-10" />
                <div className="absolute top-0 bottom-0 left-[75%] w-px bg-slate-300 dark:bg-slate-700 z-10" />

                <div
                  className={`h-full rounded-full transition-all duration-700 ${colorStyles.bar}`}
                  style={{ width: `${Math.max(2, n.score_pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
