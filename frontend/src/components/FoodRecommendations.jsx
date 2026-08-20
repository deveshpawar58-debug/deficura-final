import React, { useState } from 'react';
import { Utensils, Sparkles, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';
import { getTierColorClasses } from '../utils/helpers';

export default function FoodRecommendations({ foodRecommendations = {}, nutrients = [] }) {
  const [selectedNutrient, setSelectedNutrient] = useState(nutrients[0]?.nutrient_id || 'iron');

  const currentNutrientInfo = nutrients.find(n => n.nutrient_id === selectedNutrient) || nutrients[0];
  const currentFoodData = foodRecommendations[selectedNutrient] || foodRecommendations['iron'];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Utensils className="w-4 h-4" />
            <span>Targeted Indian Superfoods</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Micronutrient-Dense Indian Food Sources
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Everyday culturally accessible Indian staples, preparation methods, and absorption synergy tips
          </p>
        </div>
      </div>

      {/* Nutrient Selection Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {nutrients.map(n => {
          const isActive = selectedNutrient === n.nutrient_id;
          const colorStyles = getTierColorClasses(n.risk_tier);

          return (
            <button
              key={n.nutrient_id}
              onClick={() => setSelectedNutrient(n.nutrient_id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{n.name}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-white/20 text-white' : colorStyles.badge
              }`}>
                {n.risk_tier}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Nutrient Food Highlights */}
      {currentFoodData && (
        <div className="space-y-6">
          
          {/* Target Clinical Header */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                Clinical Target for {currentFoodData.nutrient_name}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {currentFoodData.clinical_target}
              </h4>
            </div>
            {currentNutrientInfo && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${getTierColorClasses(currentNutrientInfo.risk_tier).badge}`}>
                Status: {currentNutrientInfo.risk_tier} ({currentNutrientInfo.score_pct}%)
              </span>
            )}
          </div>

          {/* Key Food Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentFoodData.key_foods?.map((food, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-300 dark:hover:border-blue-700 transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {food.type}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                      {food.iron_content || food.b12_content || food.d_content || food.calcium_content || food.zinc_content || food.folate_content || food.vit_a_content || 'High Density'}
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                    {food.name}
                  </h5>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Serving: <span className="text-slate-700 dark:text-slate-300 font-medium">{food.serving}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-start space-x-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{food.highlight}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bioavailability & Absorption Rules */}
          {currentFoodData.bioavailability_rules?.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Critical Indian Bioavailability & Kitchen Preparation Rules</span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                {currentFoodData.bioavailability_rules.map((rule, rIdx) => (
                  <li key={rIdx} className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
