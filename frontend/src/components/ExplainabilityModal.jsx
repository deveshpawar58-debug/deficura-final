import React from 'react';
import { X, Calculator, CheckCircle2, BookOpen } from 'lucide-react';
import { getTierColorClasses } from '../utils/helpers';

export default function ExplainabilityModal({ nutrient, onClose }) {
  if (!nutrient) return null;

  const colorStyles = getTierColorClasses(nutrient.risk_tier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colorStyles.badge}`}>
                {nutrient.risk_tier}
              </span>
              <span className="text-xs text-slate-400">Deterministic Explainability</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {nutrient.name} Risk Score Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {nutrient.subtitle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm">
          
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 font-bold text-xs">
              <Calculator className="w-4 h-4" />
              <span>Deterministic Scoring Formula</span>
            </div>
            <div className="font-mono text-xs sm:text-sm bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-200/60 dark:border-blue-900 text-slate-900 dark:text-blue-100 overflow-x-auto">
              S({nutrient.name}) = Σ [ w(s) × p(s) ] / Max_Score = {nutrient.raw_score} / {nutrient.max_score} = {nutrient.score} ({nutrient.score_pct}%)
            </div>
            <p className="text-[11px] text-blue-600 dark:text-blue-300/80">
              Where w(s) is clinical symptom weight (range 1-5), p(s) is presence (0 or 1), normalized to [0, 1].
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>India Prevalence & Clinical Context</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {nutrient.prevalence_india}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              1. Contributing Reported Symptoms ({nutrient.contributing_symptoms?.length || 0})
            </h4>

            {nutrient.contributing_symptoms?.length > 0 ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
                {nutrient.contributing_symptoms.map(c => (
                  <div key={c.id} className="p-3.5 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                        <span>{c.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          Weight: {c.weight}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {c.clinical_description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        +{c.contribution_pct}%
                      </span>
                      <p className="text-[10px] text-slate-400">of max score</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero clinical symptoms reported for this micronutrient. Risk remains at healthy baseline (0%).</span>
              </div>
            )}
          </div>

          {nutrient.unreported_symptoms?.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                2. Potential Symptoms Not Reported ({nutrient.unreported_symptoms.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                {nutrient.unreported_symptoms.map(u => (
                  <div key={u.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <span className="truncate pr-2">{u.name}</span>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">w={u.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 transition shadow-sm"
          >
            Close Breakdown
          </button>
        </div>

      </div>
    </div>
  );
}
