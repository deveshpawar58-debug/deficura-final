import unittest
import json
from app import app

class TestFullDefiCuraApplication(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    # --- EXISTING FEATURES REGRESSION TESTS ---
    def test_health_check(self):
        res = self.client.get('/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['app'], 'DefiCura')

    def test_nutrients_metadata(self):
        res = self.client.get('/nutrients')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(len(data['nutrients']), 7)
        self.assertEqual(data['total_unique_symptoms'], 24)

    def test_symptom_assessment(self):
        payload = {"symptoms": {"fatigue": True, "pallor": True, "brittle_nails": True}}
        res = self.client.post('/assess', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("scoring", data)
        self.assertIn("meal_plan", data)
        self.assertIn("food_recommendations", data)
        self.assertTrue(data['performance_target_met'])

    def test_history_and_pdf(self):
        res = self.client.get('/history?user_id=default_user')
        self.assertEqual(res.status_code, 200)

        pdf_payload = {
            "scoring": {
                "nutrients": [],
                "summary": {"overall_status": "Healthy", "overall_severity": "healthy", "total_symptoms_reported": 0}
            },
            "meal_plan": {"weekly_schedule": []},
            "food_recommendations": {}
        }
        res_pdf = self.client.post('/report/pdf', json=pdf_payload)
        self.assertEqual(res_pdf.status_code, 200)
        self.assertTrue(res_pdf.data.startswith(b'%PDF'))

    # --- NEW FEATURE: BLOOD REPORT ANALYZER TESTS ---
    def test_blood_report_extract_from_text(self):
        lab_text = """
        Hemoglobin: 10.4 g/dL (Reference: 12.0 - 16.0)
        Vitamin B12: 175 pg/mL (Reference: 200 - 900)
        Fasting Glucose: 115 mg/dL (Reference: 70 - 99)
        Serum Creatinine: 0.9 mg/dL (Reference: 0.6 - 1.2)
        Total Cholesterol: 220 mg/dL (Reference: 125 - 200)
        """
        res = self.client.post('/blood-report/extract', json={"raw_text": lab_text})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['total_detected'], 5)
        
        test_names = [p['test_id'] for p in data['extracted_parameters']]
        self.assertIn('hemoglobin', test_names)
        self.assertIn('vitamin_b12', test_names)
        self.assertIn('fasting_glucose', test_names)
        self.assertIn('creatinine', test_names)
        self.assertIn('cholesterol_total', test_names)

    def test_blood_report_analyze_verified(self):
        parameters = [
            {
                "test_id": "hemoglobin",
                "test_name": "Hemoglobin (Hb)",
                "category": "cbc",
                "category_name": "Complete Blood Count (CBC)",
                "result": 10.4,
                "unit": "g/dL",
                "reference_low": 12.0,
                "reference_high": 16.0,
                "reference_source": "laboratory",
                "reference_text": "12.0 - 16.0"
            },
            {
                "test_id": "vitamin_b12",
                "test_name": "Vitamin B12 (Cobalamin)",
                "category": "vitamins",
                "category_name": "Vitamins & Micronutrients",
                "result": 175.0,
                "unit": "pg/mL",
                "reference_low": 200.0,
                "reference_high": 900.0,
                "reference_source": "laboratory",
                "reference_text": "200.0 - 900.0"
            },
            {
                "test_id": "creatinine",
                "test_name": "Serum Creatinine",
                "category": "kidney",
                "category_name": "Kidney Function & Electrolytes",
                "result": 0.9,
                "unit": "mg/dL",
                "reference_low": 0.6,
                "reference_high": 1.2,
                "reference_source": "laboratory",
                "reference_text": "0.6 - 1.2"
            }
        ]

        res = self.client.post('/blood-report/analyze', json={"parameters": parameters})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        
        analysis = data['analysis']
        self.assertEqual(analysis['summary']['total_analyzed'], 3)
        self.assertEqual(analysis['summary']['below_range_count'], 2) # Hb, B12
        self.assertEqual(analysis['summary']['within_range_count'], 1) # Creatinine
        
        # Non-diagnostic explanations
        hb_item = next(p for p in analysis['parameters'] if p['test_id'] == 'hemoglobin')
        self.assertEqual(hb_item['status'], 'below_range')
        self.assertNotIn("You have anemia", hb_item['explanation']) # Non-diagnostic rule
        
        # 5-Slot Indian Meal Plan
        meals = analysis['recommended_meals']
        self.assertIn("breakfast", meals)
        self.assertIn("mid_morning", meals)
        self.assertIn("lunch", meals)
        self.assertIn("evening_snack", meals)
        self.assertIn("dinner", meals)
        
        # Precautions & Disclaimer
        self.assertTrue(len(analysis['precautions']) >= 4)
        self.assertIn("disclaimer", analysis)
        self.assertIn("does not diagnose medical conditions", analysis['disclaimer'])

if __name__ == '__main__':
    unittest.main()
