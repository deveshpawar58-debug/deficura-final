import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Search, 
  Sparkles, 
  Zap, 
  Brain, 
  Activity, 
  Shield, 
  Eye, 
  Share2, 
  ArrowRight,
  Info,
  X
} from 'lucide-react';
import { BODILY_SYSTEMS, categorizeSymptom, SAMPLE_PERSONAS } from '../utils/helpers';

export default function SymptomQuestionnaire({ 
  masterSymptoms = [], 
  selectedSymptoms = {}, 
  onToggleSymptom, 
  onSelectPersona, 
  onSelectAll, 
  onClearAll, 
  onSubmit, 
  isLoading 
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCount = useMemo(() => {
    return Object.values(selectedSymptoms).filter(Boolean).length;
  }, [selectedSymptoms]);

  const filteredSymptoms = useMemo(() => {
    return masterSymptoms.filter(sym => {
      const matchesSearch = sym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sym.clinical_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sym.affected_nutrients.some(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;
      if (activeCategory === 'all') return true;
      return categorizeSymptom(sym.id) === activeCategory;
    });
  }, [masterSymptoms, searchQuery, activeCategory]);

  const categoryIcons = {
    all: Sparkles,
    energy: Zap,
    neuro: Brain,
    muscles: Activity,
    immunity: Shield,
    sensory: Eye
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Intro Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-blue-500/10">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md border border-white/20">
            <span>Deterministic Scoring Algorithm</span>
            <span>•</span>
            <span>No Black-Box ML</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Indian Micronutrient Deficiency Risk Assessment
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Report your observed symptoms below. Our clinical rule-based engine will compute normalized risk scores across the 
            <strong> 7 most prevalent Indian deficiencies</strong> (Iron, B12, Vitamin D, Calcium, Zinc, Folate, Vitamin A) and construct your personalized 7-day Indian meal plan.
          </p>
        </div>
      </div>

      {/* Preset Persona Quick-Select Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Demo Preset Personas (1-Click Test)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Pre-fills realistic clinical profiles</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {SAMPLE_PERSONAS.map(persona => (
            <button
              key={persona.id}
              onClick={() => onSelectPersona(persona.symptoms)}
              className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {persona.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-1.5">
                {persona.subtitle}
              </p>
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100/80 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                {persona.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Questionnaire Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
        
        {/* Search & Category Filter Navigation */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Deduplicated Master Symptom Checklist
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Check all symptoms you have experienced over the past 4-8 weeks ({selectedCount} of {masterSymptoms.length} selected)
              </p>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
              >
                Clear All
              </button>
              <button
                onClick={onSelectAll}
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg transition"
              >
                Select All
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symptoms by name, body area, or nutrient (e.g. fatigue, eyes, iron)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bodily System Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {BODILY_SYSTEMS.map(sys => {
              const IconComp = categoryIcons[sys.id] || Sparkles;
              const isActive = activeCategory === sys.id;
              return (
                <button
                  key={sys.id}
                  onClick={() => setActiveCategory(sys.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{sys.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Symptom Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredSymptoms.map(sym => {
            const isChecked = !!selectedSymptoms[sym.id];
            const isShared = sym.is_shared;

            return (
              <div
                key={sym.id}
                onClick={() => onToggleSymptom(sym.id)}
                className={`relative group p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start space-x-3.5 ${
                  isChecked
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm'
                    : 'bg-slate-50/40 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Custom Checkbox */}
                <div
                  className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs sm:text-sm font-bold transition-colors ${
                      isChecked ? 'text-blue-900 dark:text-blue-200' : 'text-slate-900 dark:text-white'
                    }`}>
                      {sym.name}
                    </h4>

                    {/* Shared Multi-Nutrient Flag Badge */}
                    {isShared && (
                      <span 
                        className="inline-flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                        title={`This symptom independently weights across ${sym.affected_nutrients.length} nutrients`}
                      >
                        <Share2 className="w-2.5 h-2.5" />
                        <span>Shared ({sym.affected_nutrients.length})</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {sym.clinical_description}
                  </p>

                  {/* Impacted Nutrients Tag Badges */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-slate-400 font-medium mr-1">Feeds:</span>
                    {sym.affected_nutrients.map(n => (
                      <span
                        key={n.id}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition ${
                          isChecked 
                            ? 'bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
                            : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {n.name} <span className="opacity-70 font-mono text-[9px]">+w{n.weight}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Assessment Action Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              {selectedCount === 0 
                ? 'No symptoms selected (will assess baseline healthy status)' 
                : `${selectedCount} symptom(s) actively contributing to scoring matrix`}
            </span>
          </div>

          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Get My Assessment & Meal Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
