import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  Utensils, 
  ShieldAlert, 
  UserCheck, 
  RotateCcw, 
  Printer, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  FileCheck,
  Search,
  Clock,
  ExternalLink
} from 'lucide-react';
import { extractBloodReportFromFile, extractBloodReportFromText, analyzeBloodReportParameters } from '../services/api';

const DEMO_REPORTS = [
  {
    id: 'anemia_b12',
    name: 'Anemia & B12 Panel',
    desc: 'Sample with low Hemoglobin, low Ferritin, low B12, and low Vit D',
    text: `COMPLETE BLOOD COUNT (CBC)
Hemoglobin: 10.2 g/dL (Reference Range: 12.0 - 16.0)
RBC Count: 3.7 mil/uL (Reference: 4.0 - 5.5)
Total Leukocyte Count (WBC): 6800 /uL (Reference: 4000 - 11000)
Platelet Count: 240 10^3/uL (Reference: 150 - 450)
Packed Cell Volume (PCV): 33.5 % (Reference: 36.0 - 48.0)
MCV: 74.0 fL (Reference: 80.0 - 100.0)
MCH: 24.5 pg (Reference: 27.0 - 32.0)
RDW: 16.2 % (Reference: 11.5 - 14.5)

IRON & VITAMINS
Serum Ferritin: 11.0 ng/mL (Reference: 15.0 - 200.0)
Serum Iron: 48.0 mcg/dL (Reference: 60.0 - 170.0)
TIBC: 460.0 mcg/dL (Reference: 240.0 - 450.0)
Vitamin B12: 155.0 pg/mL (Reference: 200.0 - 900.0)
25-OH Vitamin D: 16.5 ng/mL (Reference: 30.0 - 100.0)`
  },
  {
    id: 'metabolic_lipid',
    name: 'Metabolic & Lipid Check',
    desc: 'Sample with elevated Fasting Sugar, HbA1c, and Triglycerides',
    text: `GLUCOSE & DIABETIC PROFILE
Fasting Blood Sugar: 118.0 mg/dL (Reference: 70.0 - 99.0)
HbA1c: 6.2 % (Reference: 4.0 - 5.6)

LIPID PROFILE
Total Cholesterol: 228.0 mg/dL (Reference: 125.0 - 200.0)
Triglycerides: 210.0 mg/dL (Reference: 0.0 - 150.0)
LDL Cholesterol: 142.0 mg/dL (Reference: 0.0 - 100.0)
HDL Cholesterol: 38.0 mg/dL (Reference: 40.0 - 60.0)
VLDL: 42.0 mg/dL (Reference: 2.0 - 30.0)

KIDNEY & LIVER
Serum Creatinine: 0.85 mg/dL (Reference: 0.6 - 1.2)
Blood Urea: 18.0 mg/dL (Reference: 7.0 - 20.0)
ALT / SGPT: 42.0 U/L (Reference: 7.0 - 56.0)`
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive Health Check',
    desc: 'Sample broad routine laboratory screening panel',
    text: `COMPLETE BLOOD COUNT
Hemoglobin: 13.8 g/dL (Reference: 12.0 - 16.0)
Total Leukocyte Count (WBC): 7200 /uL (Reference: 4000 - 11000)
Platelet Count: 280 10^3/uL (Reference: 150 - 450)
MCV: 88.0 fL (Reference: 80.0 - 100.0)

MICRONUTRIENTS & BIOCHEMISTRY
Vitamin B12: 340.0 pg/mL (Reference: 200.0 - 900.0)
25-OH Vitamin D: 22.0 ng/mL (Reference: 30.0 - 100.0)
Serum Calcium: 9.4 mg/dL (Reference: 8.8 - 10.2)
Serum Creatinine: 0.9 mg/dL (Reference: 0.6 - 1.2)
Total Bilirubin: 0.7 mg/dL (Reference: 0.2 - 1.2)
Total Cholesterol: 185.0 mg/dL (Reference: 125.0 - 200.0)`
  }
];

export default function BloodReportAnalyzer() {
  const [stage, setStage] = useState('upload'); // 'upload' | 'verify' | 'results'
  
  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawTextInput, setRawTextInput] = useState('');
  const [inputMode, setInputMode] = useState('file'); // 'file' | 'text'
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const fileInputRef = useRef(null);

  // Verification state
  const [extractedParameters, setExtractedParameters] = useState([]);

  // Analysis results state
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractError(null);
    }
  };

  // Handle Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setExtractError(null);
    }
  };

  // Extract laboratory values
  const handleExtract = async () => {
    setIsExtracting(true);
    setExtractError(null);
    try {
      let res;
      if (inputMode === 'file') {
        if (!selectedFile) {
          setExtractError('Please select a PDF or image file first.');
          setIsExtracting(false);
          return;
        }
        res = await extractBloodReportFromFile(selectedFile);
      } else {
        if (!rawTextInput.trim()) {
          setExtractError('Please paste your laboratory report text first.');
          setIsExtracting(false);
          return;
        }
        res = await extractBloodReportFromText(rawTextInput);
      }

      if (res.success && res.extracted_parameters && res.extracted_parameters.length > 0) {
        setExtractedParameters(res.extracted_parameters);
        setStage('verify');
      } else {
        setExtractError(res.error || 'No standard blood parameters could be automatically recognized. You can paste raw text or add values manually.');
      }
    } catch (err) {
      setExtractError('Extraction failed. Please check backend connection or paste text manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Demo selection helper
  const handleSelectDemo = async (demo) => {
    setInputMode('text');
    setRawTextInput(demo.text);
    setIsExtracting(true);
    setExtractError(null);
    try {
      const res = await extractBloodReportFromText(demo.text);
      if (res.success && res.extracted_parameters) {
        setExtractedParameters(res.extracted_parameters);
        setStage('verify');
      }
    } catch (err) {
      setExtractError('Demo extraction failed.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Verification table field updates
  const handleParameterChange = (index, field, value) => {
    setExtractedParameters(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveParameter = (index) => {
    setExtractedParameters(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddManualParameter = () => {
    setExtractedParameters(prev => [
      ...prev,
      {
        test_id: `custom_${Date.now()}`,
        test_name: 'Custom Parameter',
        category: 'other',
        category_name: 'Other',
        result: 0,
        unit: 'mg/dL',
        reference_low: 0,
        reference_high: 100,
        reference_source: 'general',
        reference_text: '0 - 100'
      }
    ]);
  };

  // Submit verified parameters for analysis
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeBloodReportParameters(extractedParameters);
      if (res.success && res.analysis) {
        setAnalysisResults(res.analysis);
        setStage('results');
      } else {
        alert(res.error || 'Analysis failed. Please check inputs.');
      }
    } catch (err) {
      alert('Analysis request failed. Please check backend.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtering for Results stage
  const filteredParameters = (analysisResults?.parameters || []).filter(item => {
    const matchesCategory = activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
    const matchesSearch = item.test_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          item.category_name.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const abnormalItems = (analysisResults?.parameters || []).filter(
    item => item.status === 'below_range' || item.status === 'above_range'
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md border border-white/20">
            <FileCheck className="w-3.5 h-3.5 text-teal-200" />
            <span>Blood Report Analyzer</span>
            <span>•</span>
            <span>Laboratory Value Verification</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Comprehensive Blood Report Nutritional Interpretation
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Upload your laboratory report (PDF or Image) or paste test results. We extract values, allow you to verify them, compare against your laboratory's reference ranges, and generate personalized Indian food recommendations without medical diagnosis.
          </p>
        </div>
      </div>

      {/* STAGE 1: UPLOAD REPORT */}
      {stage === 'upload' && (
        <div className="space-y-6">
          
          {/* Preset Demo Reports Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Try Preset Sample Lab Reports (1-Click Test)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Instant demonstration</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEMO_REPORTS.map(demo => (
                <button
                  key={demo.id}
                  onClick={() => handleSelectDemo(demo)}
                  className="text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition group"
                >
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 mb-1">
                    {demo.name}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {demo.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Upload Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Upload Your Blood Test Report
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supported formats: PDF (digital lab reports), JPG, JPEG, PNG, or direct text paste
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setInputMode('file')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    inputMode === 'file' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  File Upload
                </button>
                <button
                  onClick={() => setInputMode('text')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    inputMode === 'text' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            {/* File Dropzone */}
            {inputMode === 'file' ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl p-8 sm:p-12 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 hover:bg-teal-50/30 dark:hover:bg-teal-950/10 transition group space-y-4"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <Upload className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {selectedFile ? (
                      <span className="text-teal-600 dark:text-teal-400 font-semibold">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    ) : (
                      <span>Click to browse or drag and drop your blood report here</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    PDF, PNG, JPG (maximum 10MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Paste Laboratory Portal Text / Summary
                </label>
                <textarea
                  rows={8}
                  value={rawTextInput}
                  onChange={(e) => setRawTextInput(e.target.value)}
                  placeholder="Paste test names, results, and reference ranges here (e.g. Hemoglobin: 10.4 g/dL, Reference: 12-16)..."
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            )}

            {/* Error Message */}
            {extractError && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{extractError}</span>
              </div>
            )}

            {/* Extract Action Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleExtract}
                disabled={isExtracting || (inputMode === 'file' && !selectedFile) || (inputMode === 'text' && !rawTextInput.trim())}
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98]"
              >
                <span>{isExtracting ? 'Extracting Laboratory Values...' : 'Extract & Verify Values'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STAGE 2: REVIEW & VERIFICATION */}
      {stage === 'verify' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
                <UserCheck className="w-4 h-4" />
                <span>Step 2 — Human Verification</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Review & Confirm Extracted Results
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Medical numbers must never be blindly trusted from OCR. Confirm or correct extracted values and reference ranges before analysis.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setStage('upload')}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              >
                Back to Upload
              </button>
              <button
                onClick={handleAddManualParameter}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 rounded-xl transition border border-teal-200 dark:border-teal-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Test</span>
              </button>
            </div>
          </div>

          {/* Verification Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Test Parameter</th>
                  <th className="p-3.5">Extracted Value</th>
                  <th className="p-3.5">Unit</th>
                  <th className="p-3.5">Ref Low</th>
                  <th className="p-3.5">Ref High</th>
                  <th className="p-3.5">Range Source</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {extractedParameters.map((param, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    
                    {/* Test Name */}
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      <input
                        type="text"
                        value={param.test_name}
                        onChange={(e) => handleParameterChange(idx, 'test_name', e.target.value)}
                        className="w-full p-1.5 bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-700 rounded-lg text-xs font-bold"
                      />
                      <span className="text-[10px] text-slate-400 font-normal block px-1.5">
                        {param.category_name}
                      </span>
                    </td>

                    {/* Result Value */}
                    <td className="p-3">
                      <input
                        type="number"
                        step="any"
                        value={param.result}
                        onChange={(e) => handleParameterChange(idx, 'result', e.target.value)}
                        className="w-24 p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold text-xs text-blue-600 dark:text-blue-400"
                      />
                    </td>

                    {/* Unit */}
                    <td className="p-3">
                      <input
                        type="text"
                        value={param.unit}
                        onChange={(e) => handleParameterChange(idx, 'unit', e.target.value)}
                        className="w-20 p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-xs"
                      />
                    </td>

                    {/* Ref Low */}
                    <td className="p-3">
                      <input
                        type="number"
                        step="any"
                        value={param.reference_low ?? ''}
                        onChange={(e) => handleParameterChange(idx, 'reference_low', e.target.value)}
                        placeholder="Low"
                        className="w-20 p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-xs"
                      />
                    </td>

                    {/* Ref High */}
                    <td className="p-3">
                      <input
                        type="number"
                        step="any"
                        value={param.reference_high ?? ''}
                        onChange={(e) => handleParameterChange(idx, 'reference_high', e.target.value)}
                        placeholder="High"
                        className="w-20 p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-xs"
                      />
                    </td>

                    {/* Ref Source Badge */}
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        param.reference_source === 'laboratory'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300'
                      }`}>
                        {param.reference_source === 'laboratory' ? 'From Lab Report' : 'General Fallback'}
                      </span>
                    </td>

                    {/* Remove */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRemoveParameter(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Remove parameter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              {extractedParameters.length} parameter(s) ready for deterministic nutritional analysis.
            </span>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || extractedParameters.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 shadow-lg shadow-teal-500/20 transition active:scale-[0.98]"
            >
              <span>{isAnalyzing ? 'Analyzing Laboratory Results...' : 'Confirm & Generate Analysis'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* STAGE 3: RESULTS & NUTRITIONAL GUIDANCE */}
      {stage === 'results' && analysisResults && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Summary Metric Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Laboratory Analysis Summary
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Blood Report Summary
                </h2>
              </div>

              <div className="no-print flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Report</span>
                </button>
                <button
                  onClick={() => setStage('verify')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Edit Values
                </button>
                <button
                  onClick={() => { setStage('upload'); setSelectedFile(null); setRawTextInput(''); }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition shadow-sm"
                >
                  New Analysis
                </button>
              </div>
            </div>

            {/* Counter Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-semibold block">Analyzed</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{analysisResults.summary.total_analyzed}</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold block">Within Range</span>
                <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{analysisResults.summary.within_range_count}</span>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
                <span className="text-xs text-rose-700 dark:text-rose-300 font-semibold block">Below Range</span>
                <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-300">{analysisResults.summary.below_range_count}</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold block">Above Range</span>
                <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">{analysisResults.summary.above_range_count}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-400 font-semibold block">Undetermined</span>
                <span className="text-2xl font-extrabold text-slate-700 dark:text-slate-300">{analysisResults.summary.unable_count}</span>
              </div>
            </div>

          </div>

          {/* IMPORTANT RESULTS (ABNORMAL PARAMETER CARDS) */}
          {abnormalItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Important Results Outside Reference Ranges ({abnormalItems.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {abnormalItems.map((item, idx) => {
                  const isBelow = item.status === 'below_range';
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border transition-all space-y-3 ${
                        isBelow 
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60' 
                          : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            {item.category_name}
                          </span>
                          <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                            {item.test_name}
                          </h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                          isBelow 
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200 border border-rose-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200 border border-amber-300'
                        }`}>
                          {item.status_label}
                        </span>
                      </div>

                      <div className="flex items-baseline space-x-2 text-sm">
                        <span className="font-extrabold font-mono text-lg text-slate-900 dark:text-white">
                          {item.result} {item.unit}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          (Reference: {item.reference_text})
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {item.explanation}
                      </p>

                      {item.nutritional_note && (
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                          <span className="font-bold text-teal-700 dark:text-teal-300 flex items-center space-x-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Nutritional Relevance:</span>
                          </span>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                            {item.nutritional_note}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ALL RESULTS TABLE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                All Analyzed Blood Parameters ({filteredParameters.length})
              </h3>

              {/* Search & Filter */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter parameters..."
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Parameter</th>
                    <th className="p-3.5">Result</th>
                    <th className="p-3.5">Reference Range</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredParameters.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {item.test_name}
                        <span className="text-[10px] text-slate-400 font-normal block">{item.category_name}</span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.result} {item.unit}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {item.reference_text}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'within_range' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          item.status === 'below_range' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          item.status === 'above_range' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {item.status_label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* NUTRITIONAL CONSIDERATIONS SECTION */}
          {analysisResults.nutritional_considerations.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 font-extrabold text-base">
                <Utensils className="w-5 h-5" />
                <span>Nutritional Considerations</span>
              </div>

              <div className="space-y-3">
                {analysisResults.nutritional_considerations.map((c, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {c.test_name} ({c.result_str})
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                        {c.status_label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {c.nutritional_note}
                    </p>
                    {c.foods && c.foods.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-500 mr-1">Recommended Indian sources:</span>
                        {c.foods.map((food, fIdx) => (
                          <span key={fIdx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                            {food}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECOMMENDED FOODS / 5-SLOT INDIAN MEAL PLAN */}
          {analysisResults.recommended_meals && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
                  <Utensils className="w-4 h-4" />
                  <span>Personalized Indian Food Strategy</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Recommended Foods & Structured Meal Plan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Food-first nutritional recommendations distributed across regular Indian meal slots
                </p>
              </div>

              {analysisResults.recommended_meals.clinical_highlights?.length > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <span className="font-bold flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Report Highlights:</span>
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {analysisResults.recommended_meals.clinical_highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Breakfast */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    🌅 Breakfast (Morning)
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {analysisResults.recommended_meals.breakfast.description}
                  </p>
                </div>

                {/* Mid-Morning */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    ☀️ Mid-Morning
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {analysisResults.recommended_meals.mid_morning.description}
                  </p>
                </div>

                {/* Lunch */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    🍱 Lunch (Afternoon Thali)
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {analysisResults.recommended_meals.lunch.description}
                  </p>
                </div>

                {/* Evening Snack */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    🍵 Evening Snack
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {analysisResults.recommended_meals.evening_snack.description}
                  </p>
                </div>

                {/* Dinner */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 md:col-span-2 lg:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    🌙 Light Dinner (Raat ka Khana)
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {analysisResults.recommended_meals.dinner.description}
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* PRECAUTIONS SECTION */}
          {analysisResults.precautions.length > 0 && (
            <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Precautions</span>
              </div>
              <ul className="space-y-2 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                {analysisResults.precautions.map((p, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* WHEN TO CONSULT A HEALTHCARE PROFESSIONAL */}
          {analysisResults.doctor_guidance.length > 0 && (
            <div className="p-6 rounded-3xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                <span>When to Consult a Healthcare Professional</span>
              </div>
              <ul className="space-y-1.5 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                {analysisResults.doctor_guidance.map((g, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">→</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* DISCLAIMER SECTION */}
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1 leading-relaxed">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Disclaimer:
            </span>
            <p>{analysisResults.disclaimer}</p>
          </div>

        </div>
      )}

    </div>
  );
}
