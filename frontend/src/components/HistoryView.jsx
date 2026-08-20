import React from 'react';
import { History, TrendingUp, Calendar, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { getTierColorClasses } from '../utils/helpers';

export default function HistoryView({ history = [], onSelectRecord, onBackToQuestionnaire }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToQuestionnaire}
          className="inline-flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-2 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessment</span>
        </button>

        <span className="text-xs text-slate-400 font-mono">
          {history.length} assessment record(s) stored locally
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Longitudinal Tracking</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Micronutrient Risk History & Progression
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare risk profiles across repeat assessments to evaluate symptom resolution and dietary recovery
          </p>
        </div>

        {/* Timeline List */}
        {history.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No Past Assessments Recorded Yet
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Complete your first symptom questionnaire to establish your baseline health score and begin tracking trends over time.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {history.map((rec, idx) => {
              const summary = rec.summary || {};
              const scores = rec.nutrient_scores || {};
              const isFirst = idx === 0;

              return (
                <div
                  key={rec.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isFirst 
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>{rec.date_formatted || 'Recorded Assessment'}</span>
                      </span>
                      {isFirst && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                          Latest
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {summary.overall_status || 'Assessment completed'}
                    </p>

                    {/* Nutrient mini pill badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {Object.entries(scores).map(([nid, ninfo]) => (
                        <span
                          key={nid}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getTierColorClasses(ninfo.risk_tier).badge}`}
                        >
                          {ninfo.name}: {ninfo.score_pct}%
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* View Details Action */}
                  <button
                    onClick={() => onSelectRecord(rec.full_data || rec)}
                    className="inline-flex items-center justify-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition shrink-0 shadow-sm"
                  >
                    <span>View Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
