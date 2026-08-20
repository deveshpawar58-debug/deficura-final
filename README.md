# DefiCura — Symptom-Driven Micronutrient Risk Engine & Meal Planner

**DefiCura** is a deterministic, rule-based full-stack web application for clinical micronutrient deficiency risk stratification and personalized Indian meal planning, specifically targeting the **7 most prevalent micronutrient deficiencies documented in the Indian population**.

Unlike opaque machine learning models, DefiCura uses a fully transparent, explainable weighted scoring algorithm where every risk score mathematically traces back to user-reported symptoms.

---

## 🔬 Why These Specific 7 Micronutrients? (India-Specific Epidemiological Rationale)

According to national health surveys (NFHS-5, ICMR-NIN, and Comprehensive National Nutrition Survey), micronutrient malnutrition ("hidden hunger") in India is concentrated across 7 critical micronutrients:

1. **Iron (Fe)**: Over **53% of women** (15–49 yrs) and **25% of men** suffer from Iron Deficiency Anemia (IDA), driven by high dietary phytic acid in cereal-heavy diets and low bioavailable heme iron intake.
2. **Vitamin B12 (Cobalamin)**: Up to **70% of Indian adults** exhibit suboptimal serum B12. Because B12 is synthesized exclusively by microorganisms and absent in unfortified plant foods, lacto-vegetarian and plant-predominant Indian diets have an acute reliance on dairy or fortification.
3. **Vitamin D (Cholecalciferol)**: Affects **70–90% of Indians** across urban and rural demographics. High epidermal melanin pigmentation attenuates cutaneous UV-B synthesis, exacerbated by indoor desk lifestyles and modest dietary intake.
4. **Calcium (Ca)**: Mean dietary calcium intake in India is **<400 mg/day** (less than half the ICMR recommended 1000 mg/day). Excessive cereal phytates and oxalates bind free calcium, increasing lifetime risk for early osteopenia and muscle cramping.
5. **Zinc (Zn)**: Affects **40–50% of the population**. High cereal-to-meat ratios and unleavened flatbreads contain phytates that chelate zinc in the intestinal lumen, blunting mucosal immunity and wound healing.
6. **Folate (Vitamin B9)**: Affects **30–45% of women and youth**. While green leafy vegetables are staple ingredients, prolonged high-heat open-pot boiling in traditional Indian cooking oxidizes up to 70% of natural dietary folates.
7. **Vitamin A (Retinol)**: Historically endemic (~30–40% subclinical deficiency in vulnerable groups). Dietary beta-carotene conversion efficiency is low without sufficient concurrent dietary lipids (fats/ghee).

---

## 🧮 Deterministic Scoring Algorithm & Formula

For each nutrient N, the normalized risk score S(N) is calculated as:

$$\Large S(N) = \frac{\sum_{s \in S_N} [w(s) \times p(s)]}{\text{Max\_Score}(N)}$$

Where:
- $w(s) \in [1, 5]$ is the clinical weight assigned to symptom $s$ based on diagnostic sensitivity/specificity.
- $p(s) \in \{0, 1\}$ is the binary presence indicator ($1 = \text{reported}$, $0 = \text{absent}$).
- $\text{Max\_Score}(N) = \sum_{s \in S_N} w(s)$ is the theoretical maximum score for that nutrient.
- $S(N)$ is strictly normalized to the continuous range $[0.0, 1.0]$.

### Clinical Risk Tier Cutoffs (Configured via JSON):
- **Healthy**: $0.00 \le S(N) < 0.25$ (Optimal baseline)
- **Low Risk**: $0.25 \le S(N) < 0.50$ (Early subtle indicators)
- **Medium Risk**: $0.50 \le S(N) < 0.75$ (Moderate symptom cluster; targeted meal swaps)
- **High Risk**: $0.75 \le S(N) \le 1.00$ (Severe multi-symptom indication; serum test recommended)

---

## 🏗️ Tech Stack & Architecture

- **Frontend**: React.js (SPA), Tailwind CSS, Lucide Icons, Vite, Custom 7-Axis SVG Radar Engine.
- **Backend**: Python (Flask REST API), Flask-CORS, ReportLab (Medical PDF generation engine).
- **Data Layer**: 100% JSON-driven configuration files (`nutrients.json`, `thresholds.json`, `food_recommendations.json`, `meal_plan_template.json`). No external database required.
- **Performance**: Response time $< 0.8\text{s}$ per `/assess` request (benchmarked at **~0.45 ms**).

---

## 🚀 Quick Setup & Run Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ (Node 20 LTS included in `tools/node`)

### 1. Backend Setup & Run
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start Flask Backend (Port 5000)
python app.py
```
*Backend will run at `http://127.0.0.1:5000`.*

### 2. Frontend Setup & Run
```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite Development Server (Port 5173)
npm run dev
```
*Frontend will be accessible at `http://localhost:5173`.*

---

## 🧪 Synthetic Pilot Validation & Automated Tests

### Run 60-Participant Synthetic Benchmark
Simulates a 60-participant synthetic pilot cohort with diverse demographic archetypes (Urban IT workers, young vegetarian adults, elderly individuals, low-immunity youth), computes latency percentiles, and generates an aggregate risk distribution table:
```bash
cd backend
python seed_validation.py
```

### Run Unit Tests
Verifies mathematical scoring integrity, boundary conditions ($0.0, 0.25, 0.5, 0.75, 1.0$), explainability breakdown, and PDF export:
```bash
cd backend
python test_backend.py
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status & engine version |
| `GET` | `/nutrients` | Deduplicated ~24 master symptom list & 7 nutrient clinical configs |
| `POST` | `/assess` | Accepts binary symptoms JSON; returns normalized scores, explainability breakdown & 7-day Indian meal plan |
| `GET` | `/history?user_id=...` | Returns longitudinal assessment history for trend tracking |
| `POST` | `/report/pdf` | Generates and downloads a formal multi-page medical PDF report |

---

## ⚖️ Clinical & Legal Disclaimer
DefiCura is an educational, deterministic risk-stratification system designed for dietary optimization and preventative awareness. It does not provide medical diagnoses. Individuals with moderate-to-high risk scores should consult certified clinical dietitians or physicians for formal serum assays (e.g., Serum Ferritin, Serum B12, 25-OH Vitamin D).
