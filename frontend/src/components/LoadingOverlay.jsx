import React from 'react';
import { Activity, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-950 border-t-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-7 h-7 text-blue-600 animate-pulse" />
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Evaluating Micronutrient Risk
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Executing deterministic clinical weighting across Iron, B12, Vitamin D, Calcium, Zinc, Folate, and Vitamin A...
        </p>

        <div className="space-y-2 text-left text-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center text-emerald-600 dark:text-emerald-400 space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Calculating normalized score matrix S(N)</span>
          </div>
          <div className="flex items-center text-emerald-600 dark:text-emerald-400 space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Generating tailored Indian meal plan</span>
          </div>
          <div className="flex items-center text-blue-600 dark:text-blue-400 space-x-2 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Structuring explainability breakdown</span>
          </div>
        </div>
      </div>
    </div>
  );
}
