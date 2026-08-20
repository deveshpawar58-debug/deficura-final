import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Info, 
  PieChart, 
  Utensils, 
  Calendar, 
  Clock,
  Sparkles
} from 'lucide-react';
import NutrientCard from './NutrientCard';
import RadarChart from './RadarChart';
import RiskBarChart from './RiskBarChart';
import FoodRecommendations from './FoodRecommendations';
import MealPlanView from './MealPlanView';
import ExplainabilityModal from './ExplainabilityModal';

export default function ResultsDashboard({ 
  assessmentData, 
  onRetake, 
  onDownloadPdf, 
  isDownloadingPdf 
}) {
  const [activeExplainNutrient, setActiveExplainNutrient] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('overview'); // overview, foods, mealplan

  if (!assessmentData || !assessmentData.scoring) return null;

  const { scoring, meal_plan, food_recommendations, latency_ms } = assessmentData;
  const { nutrients = [], summary = {} } = scoring;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Clinical Summary Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        summary.overall_severity === 'high'
          ? 'bg-gradient-to-r from-rose-700 via-rose-600 to-amber-700'
          : summary.overall_severity === 'medium'
          ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600'
          : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600'
      }`}>
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md">
            {summary.overall_severity === 'healthy' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-200" />
            )}
            <span>Deterministic Clinical Evaluation Complete</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {summary.overall_status}
          </h1>

          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Evaluated {summary.total_symptoms_reported} reported symptoms across 7 micronutrients. 
            {summary.high_risk_count > 0 && ` Flagged ${summary.high_risk_count} High Risk tier(s).`}
            {summary.medium_risk_count > 0 && ` Flagged ${summary.medium_risk_count} Medium Risk tier(s).`}
          </p>
        </div>

        {/* Action Button Bar */}
        <div className="no-print flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onDownloadPdf(assessmentData)}
            disabled={isDownloadingPdf}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Report</span>
          </button>

          <button
            onClick={onRetake}
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Retake</span>
          </button>
        </div>
      </div>

      {/* Latency & Performance Indicator Note */}
      <div className="no-print flex items-center justify-between px-2 text-[11px] text-slate-400">
        <span className="flex items-center space-x-1.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Rule-Based Scoring Latency: <strong>{latency_ms ? `${latency_ms} ms` : '< 10 ms'}</strong> (Offline, Deterministic)</span>
        </span>
        <span>7 Indian Micronutrients Audited</span>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="no-print flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setDashboardTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            dashboardTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Risk Matrix & Charts</span>
        </button>

        <button
          onClick={() => setDashboardTab('foods')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            dashboardTab === 'foods'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Indian Superfoods & Tips</span>
        </button>

        <button
          onClick={() => setDashboardTab('mealplan')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            dashboardTab === 'mealplan'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>7-Day Meal Schedule</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW (Nutrient Cards + Radar + Bar Chart) */}
      {dashboardTab === 'overview' && (
        <div className="space-y-8">
          
          {/* 7 Nutrient Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Individual Micronutrient Risk Status
              </h2>
              <span className="text-xs text-slate-400">
                Click "Explain My Score Math" on any card for formula audit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nutrients.map(n => (
                <NutrientCard
                  key={n.nutrient_id}
                  nutrient={n}
                  onOpenExplainability={(nutrientObj) => setActiveExplainNutrient(nutrientObj)}
                />
              ))}
            </div>
          </div>

          {/* Visual Charts: 7-Axis Radar & Comparative Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-break-inside-avoid">
            <RadarChart nutrients={nutrients} />
            <RiskBarChart nutrients={nutrients} />
          </div>

          {/* Embedded Food Recommendations Preview */}
          <div className="pt-2">
            <FoodRecommendations
              foodRecommendations={food_recommendations}
              nutrients={nutrients}
            />
          </div>

          {/* Embedded 7-Day Meal Plan */}
          <div className="pt-2">
            <MealPlanView
              mealPlan={meal_plan}
              onPrint={handlePrint}
            />
          </div>

        </div>
      )}

      {/* TAB 2: INDIAN FOODS ONLY */}
      {dashboardTab === 'foods' && (
        <FoodRecommendations
          foodRecommendations={food_recommendations}
          nutrients={nutrients}
        />
      )}

      {/* TAB 3: 7-DAY MEAL PLAN ONLY */}
      {dashboardTab === 'mealplan' && (
        <MealPlanView
          mealPlan={meal_plan}
          onPrint={handlePrint}
        />
      )}

      {/* Mathematical Explainability Modal */}
      {activeExplainNutrient && (
        <ExplainabilityModal
          nutrient={activeExplainNutrient}
          onClose={() => setActiveExplainNutrient(null)}
        />
      )}

    </div>
  );
}
