import unittest
from modules.blood_report_parser import parse_blood_report_text
from modules.blood_report_analyzer import analyze_verified_report, evaluate_parameter_status

class TestBloodReportAnalyzer(unittest.TestCase):
    def test_parameter_status_evaluation(self):
        self.assertEqual(evaluate_parameter_status(10.4, 12.0, 16.0), "below_range")
        self.assertEqual(evaluate_parameter_status(14.0, 12.0, 16.0), "within_range")
        self.assertEqual(evaluate_parameter_status(17.5, 12.0, 16.0), "above_range")
        self.assertEqual(evaluate_parameter_status(None, 12.0, 16.0), "unable_to_determine")

    def test_text_parsing_and_analysis(self):
        sample_lab_text = """
        COMPLETE BLOOD COUNT (CBC)
        Hemoglobin: 10.4 g/dL (Reference Range: 12.0 - 16.0)
        RBC Count: 3.8 mil/uL (Reference: 4.0 - 5.5)
        Total Leukocyte Count (WBC): 6500 /uL (Reference: 4000 - 11000)
        Platelet Count: 220 10^3/uL (Reference: 150 - 450)
        MCV: 76.0 fL (Reference: 80.0 - 100.0)

        BIOCHEMISTRY & VITAMINS
        Vitamin B12: 165 pg/mL (Reference: 200 - 900)
        25-OH Vitamin D: 18.2 ng/mL (Reference: 30.0 - 100.0)
        Fasting Blood Sugar: 112 mg/dL (Reference: 70 - 99)
        Serum Creatinine: 0.9 mg/dL (Reference: 0.6 - 1.2)
        Total Cholesterol: 215 mg/dL (Reference: 125 - 200)
        """

        extracted = parse_blood_report_text(sample_lab_text)
        self.assertTrue(len(extracted) >= 8, f"Expected at least 8 extracted tests, got {len(extracted)}")
        
        hb = next((t for t in extracted if t['test_id'] == 'hemoglobin'), None)
        self.assertIsNotNone(hb)
        self.assertEqual(hb['result'], 10.4)
        self.assertEqual(hb['reference_low'], 12.0)
        self.assertEqual(hb['reference_high'], 16.0)
        self.assertEqual(hb['reference_source'], 'laboratory')

        analysis = analyze_verified_report(extracted)
        self.assertEqual(analysis['summary']['total_analyzed'], len(extracted))
        self.assertTrue(analysis['summary']['below_range_count'] >= 3) # Hb, RBC, MCV, B12, Vit D
        self.assertTrue(analysis['summary']['above_range_count'] >= 2) # Fasting Glucose, Cholesterol
        self.assertTrue(len(analysis['nutritional_considerations']) >= 4)
        self.assertTrue(len(analysis['precautions']) >= 4)
        self.assertIn("breakfast", analysis['recommended_meals'])
        self.assertIn("disclaimer", analysis)

if __name__ == '__main__':
    unittest.main()
