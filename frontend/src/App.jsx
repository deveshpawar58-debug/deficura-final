import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SymptomQuestionnaire from './components/SymptomQuestionnaire';
import ResultsDashboard from './components/ResultsDashboard';
import HistoryView from './components/HistoryView';
import LoadingOverlay from './components/LoadingOverlay';
import { 
  fetchNutrientsMetadata, 
  submitAssessment, 
  fetchHistory, 
  downloadPdfReport 
} from './services/api';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('deficura_dark') === 'true' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [masterSymptoms, setMasterSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState({});
  const [assessmentData, setAssessmentData] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  
  const [activeView, setActiveView] = useState('questionnaire'); // 'questionnaire', 'results', 'history'
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync Dark Mode Class to HTML Root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('deficura_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('deficura_dark', 'false');
    }
  }, [darkMode]);

  // Initial Data Fetch
  useEffect(() => {
    async function init() {
      try {
        const metadata = await fetchNutrientsMetadata();
        setMasterSymptoms(metadata.master_symptoms || []);
        
        const hist = await fetchHistory('default_user');
        setHistoryRecords(hist.history || []);
      } catch (err) {
        console.error('Failed initial load:', err);
        setErrorMessage('Failed to connect to DefiCura backend. Ensure Flask server is running.');
      }
    }
    init();
  }, []);

  const handleToggleSymptom = (symptomId) => {
    setSelectedSymptoms(prev => ({
      ...prev,
      [symptomId]: !prev[symptomId]
    }));
  };

  const handleSelectPersona = (personaSymptoms) => {
    const newSelected = {};
    personaSymptoms.forEach(sid => {
      newSelected[sid] = true;
    });
    setSelectedSymptoms(newSelected);
  };

  const handleSelectAll = () => {
    const allObj = {};
    masterSymptoms.forEach(s => {
      allObj[s.id] = true;
    });
    setSelectedSymptoms(allObj);
  };

  const handleClearAll = () => {
    setSelectedSymptoms({});
  };

  const handleSubmitAssessment = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Artificial delay (600ms) for intentional clinical feeling
      const [res] = await Promise.all([
        submitAssessment(selectedSymptoms, 'default_user'),
        new Promise(resolve => setTimeout(resolve, 600))
      ]);
      setAssessmentData(res);
      setActiveView('results');

      // Refresh history in background
      const hist = await fetchHistory('default_user');
      setHistoryRecords(hist.history || []);
    } catch (err) {
      console.error('Assessment failed:', err);
      setErrorMessage('Assessment calculation failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async (payload) => {
    setIsDownloadingPdf(true);
    try {
      await downloadPdfReport(payload || assessmentData);
    } catch (err) {
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleResetAssessment = () => {
    setSelectedSymptoms({});
    setAssessmentData(null);
    setActiveView('questionnaire');
  };

  const handleViewHistory = async () => {
    try {
      const hist = await fetchHistory('default_user');
      setHistoryRecords(hist.history || []);
      setActiveView('history');
    } catch (err) {
      console.error('History load error:', err);
    }
  };

  const handleSelectHistoricalRecord = (recordData) => {
    setAssessmentData(recordData);
    setActiveView('results');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      
      {/* Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onViewHistory={handleViewHistory}
        onResetAssessment={handleResetAssessment}
        hasResults={!!assessmentData}
        activeTab={activeView}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* View 1: Symptom Questionnaire */}
        {activeView === 'questionnaire' && (
          <SymptomQuestionnaire
            masterSymptoms={masterSymptoms}
            selectedSymptoms={selectedSymptoms}
            onToggleSymptom={handleToggleSymptom}
            onSelectPersona={handleSelectPersona}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
            onSubmit={handleSubmitAssessment}
            isLoading={isLoading}
          />
        )}

        {/* View 2: Results Dashboard */}
        {activeView === 'results' && assessmentData && (
          <ResultsDashboard
            assessmentData={assessmentData}
            onRetake={handleResetAssessment}
            onDownloadPdf={handleDownloadPdf}
            isDownloadingPdf={isDownloadingPdf}
          />
        )}

        {/* View 3: History & Trends */}
        {activeView === 'history' && (
          <HistoryView
            history={historyRecords}
            onSelectRecord={handleSelectHistoricalRecord}
            onBackToQuestionnaire={() => setActiveView(assessmentData ? 'results' : 'questionnaire')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            DefiCura — Evidence-Based Micronutrient Deficiency Risk Engine & Meal Planner (India Focus)
          </p>
          <p className="text-[11px] text-slate-400">
            Deterministic rule-based clinical scoring across Iron, Vitamin B12, Vitamin D, Calcium, Zinc, Folate, and Vitamin A.
          </p>
        </div>
      </footer>

      {/* Clinical Loading Overlay */}
      {isLoading && <LoadingOverlay />}

    </div>
  );
}
