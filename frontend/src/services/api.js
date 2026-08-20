const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export async function fetchNutrientsMetadata() {
  try {
    const res = await fetch(`${API_BASE}/nutrients`);
    if (!res.ok) throw new Error('Failed to load nutrients metadata');
    return await res.json();
  } catch (err) {
    console.error('API Error (fetchNutrientsMetadata):', err);
    throw err;
  }
}

export async function submitAssessment(symptoms, userId = 'default_user') {
  try {
    const res = await fetch(`${API_BASE}/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms, user_id: userId })
    });
    if (!res.ok) throw new Error('Assessment calculation failed');
    return await res.json();
  } catch (err) {
    console.error('API Error (submitAssessment):', err);
    throw err;
  }
}

export async function fetchHistory(userId = 'default_user') {
  try {
    const res = await fetch(`${API_BASE}/history?user_id=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch assessment history');
    return await res.json();
  } catch (err) {
    console.error('API Error (fetchHistory):', err);
    throw err;
  }
}

export async function downloadPdfReport(assessmentPayload) {
  try {
    const res = await fetch(`${API_BASE}/report/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentPayload)
    });
    if (!res.ok) throw new Error('PDF generation failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DefiCura_Nutritional_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error('API Error (downloadPdfReport):', err);
    throw err;
  }
}
