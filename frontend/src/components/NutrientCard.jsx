import React from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { getTierColorClasses } from '../utils/helpers';

export default function NutrientCard({ nutrient, onOpenExplainability }) {
  const {
    name,
    subtitle,
    raw_score,
    max_score,
    score_pct,
    risk_tier,
    contributing_symptoms = [],
    action_summary
  } = nutrient;

  const colorStyles = getTierColorClasses(risk_tier);

  return (
    <div className={`p-5 rounded-2xl border ${colorStyles.border} ${colorStyles.bg} transition-all hover:shadow-md flex flex-col justify-between space-y-4`}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>{name}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${colorStyles.badge}`}>
            {risk_tier}
          </span>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-300">
              Risk Score S(N): <span className="font-mono">{score_pct}%</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              Raw: {raw_score} / {max_score} pts
            </span>
          </div>

          <div className="relative w-full h-2.5 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${colorStyles.bar}`}
              style={{ width: `${Math.max(4, score_pct)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-[9px] text-slate-400 px-0.5">
            <span>Healthy (0)</span>
            <span>Low (.25)</span>
            <span>Med (.50)</span>
            <span>High (.75)</span>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Reported Symptoms:</span>
            <span className="font-mono text-slate-400">{contributing_symptoms.length} active</span>
          </p>

          {contributing_symptoms.length > 0 ? (
            <div className="space-y-1">
              {contributing_symptoms.slice(0, 2).map(c => (
                <div key={c.id} className="text-[11px] flex items-center justify-between text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 px-2 py-1 rounded-md border border-slate-200/60 dark:border-slate-800">
                  <span className="truncate pr-1">• {c.name}</span>
                  <span className="font-mono text-[10px] text-slate-500 shrink-0">+w{c.weight}</span>
                </div>
              ))}
              {contributing_symptoms.length > 2 && (
                <p className="text-[10px] text-slate-400 italic">
                  +{contributing_symptoms.length - 2} more symptoms driving score
                </p>
              )}
            </div>
          ) : (
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/30 px-2 py-1 rounded-md">
              ✓ No deficiency symptoms reported
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
          {action_summary}
        </p>
      </div>

      <button
        onClick={() => onOpenExplainability(nutrient)}
        className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition group shadow-sm"
      >
        <span className="flex items-center space-x-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
          <span>Explain My Score Math</span>
        </span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
