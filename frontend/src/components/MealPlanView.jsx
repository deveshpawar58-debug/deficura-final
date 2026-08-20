import React, { useState } from 'react';
import { Calendar, Clock, Sparkles, AlertCircle, ArrowRight, Printer } from 'lucide-react';

export default function MealPlanView({ mealPlan, onPrint }) {
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  if (!mealPlan || !mealPlan.weekly_schedule) return null;

  const schedule = mealPlan.weekly_schedule;
  const currentDay = schedule[activeDayIdx] || schedule[0];
  const atRisk = mealPlan.at_risk_nutrients || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Culturally Adapted Nutrition</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Personalized 7-Day Indian Meal Plan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Structured into 4 daily Indian meal slots with targeted nutrient swaps for your risk profile
          </p>
        </div>

        <button
          onClick={onPrint}
          className="no-print inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print Weekly Plan</span>
        </button>
      </div>

      {/* At-Risk Interventions Summary */}
      {atRisk.length > 0 && (
        <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-orange-900 dark:text-orange-200">
              Active Targeted Nutritional Interventions
            </h4>
            <p className="text-orange-800/90 dark:text-orange-300/90 leading-relaxed">
              This weekly schedule dynamically injects targeted Indian food preparations to counteract detected risks in:{' '}
              <strong className="font-semibold">{atRisk.map(a => `${a.name} (${a.tier})`).join(', ')}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Day Selector Buttons */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {schedule.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setActiveDayIdx(idx)}
            className={`flex-1 min-w-[110px] p-3 rounded-2xl border text-left transition ${
              activeDayIdx === idx
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <span className="text-[11px] font-bold block truncate">
              {day.day.split(' ')[0]} {day.day.split(' ')[1]}
            </span>
            <span className={`text-[10px] block truncate ${
              activeDayIdx === idx ? 'text-blue-100' : 'text-slate-400'
            }`}>
              {day.theme}
            </span>
          </button>
        ))}
      </div>

      {/* Day Card View */}
      {currentDay && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {currentDay.day}
              </h3>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Focus Theme: {currentDay.theme}
              </p>
            </div>
          </div>

          {/* 4 Meal Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Breakfast */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  🌅 Morning Breakfast (Nashta)
                </span>
                <span className="font-mono text-[11px] text-slate-400">{currentDay.breakfast.calories_approx}</span>
              </div>
              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                {currentDay.breakfast.title}
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentDay.breakfast.description}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {currentDay.breakfast.nutritional_focus.map((n, i) => (
                  <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    +{n}
                  </span>
                ))}
              </div>
            </div>

            {/* Lunch */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  ☀️ Afternoon Lunch (Thali)
                </span>
                <span className="font-mono text-[11px] text-slate-400">{currentDay.lunch.calories_approx}</span>
              </div>
              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                {currentDay.lunch.title}
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentDay.lunch.description}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {currentDay.lunch.nutritional_focus.map((n, i) => (
                  <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    +{n}
                  </span>
                ))}
              </div>
            </div>

            {/* Evening Snack */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  🍵 Evening Snack (Chai Time)
                </span>
                <span className="font-mono text-[11px] text-slate-400">{currentDay.evening_snack.calories_approx}</span>
              </div>
              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                {currentDay.evening_snack.title}
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentDay.evening_snack.description}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {currentDay.evening_snack.nutritional_focus.map((n, i) => (
                  <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                    +{n}
                  </span>
                ))}
              </div>
            </div>

            {/* Dinner */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  🌙 Light Dinner (Raat ka Khana)
                </span>
                <span className="font-mono text-[11px] text-slate-400">{currentDay.dinner.calories_approx}</span>
              </div>
              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                {currentDay.dinner.title}
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentDay.dinner.description}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {currentDay.dinner.nutritional_focus.map((n, i) => (
                  <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                    +{n}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Custom Targeted Swaps Injected for this day */}
          {currentDay.customized_additions?.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Tailored Meal Interventions for Today</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {currentDay.customized_additions.map((swap, sIdx) => (
                  <div key={sIdx} className="flex items-start space-x-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900">
                    <span className="font-bold text-blue-600 shrink-0">[{swap.slot}]:</span>
                    <span>{swap.recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
