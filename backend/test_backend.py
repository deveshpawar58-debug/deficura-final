import unittest
import json
from modules.config_loader import get_nutrients, get_thresholds, get_master_symptom_list, get_food_recommendations
from modules.scoring_engine import score_assessment, evaluate_risk_tier
from modules.meal_planner import generate_personalized_meal_plan
from modules.history_storage import save_assessment_record, get_user_history
from modules.pdf_generator import generate_pdf_report

class TestDefiCuraBackend(unittest.TestCase):
    def test_config_integrity(self):
        nutrients = get_nutrients()
        self.assertEqual(len(nutrients), 7, "Must contain exactly 7 nutrients")
        
        # Check all 7 nutrients exist
        nutrient_ids = {n['id'] for n in nutrients}
        expected_ids = {'iron', 'vitamin_b12', 'vitamin_d', 'calcium', 'zinc', 'folate', 'vitamin_a'}
        self.assertEqual(nutrient_ids, expected_ids)
        
        # Check symptom weights match max_score
        for n in nutrients:
            calc_max = sum(s['weight'] for s in n['symptoms'])
            self.assertEqual(calc_max, n['max_score'], f"Max score mismatch in {n['name']}")
            
    def test_master_symptoms_deduplication(self):
        symptoms = get_master_symptom_list()
        self.assertTrue(18 <= len(symptoms) <= 30, f"Deduplicated count {len(symptoms)} should be ~24")
        
        # Verify multi-nutrient shared symptoms (e.g. fatigue, frequent_infections)
        fatigue = next((s for s in symptoms if s['id'] == 'fatigue'), None)
        self.assertIsNotNone(fatigue)
        self.assertTrue(fatigue['is_shared'])
        self.assertTrue(len(fatigue['affected_nutrients']) >= 2)
        
    def test_zero_symptoms_healthy(self):
        res = score_assessment({})
        for n in res['nutrients']:
            self.assertEqual(n['score'], 0.0)
            self.assertEqual(n['risk_tier'], 'Healthy')
        self.assertEqual(res['summary']['healthy_count'], 7)
        
    def test_all_symptoms_high(self):
        symptoms = get_master_symptom_list()
        all_true = {s['id']: True for s in symptoms}
        res = score_assessment(all_true)
        for n in res['nutrients']:
            self.assertEqual(n['score'], 1.0)
            self.assertEqual(n['risk_tier'], 'High Risk')
        self.assertEqual(res['summary']['high_risk_count'], 7)
        
    def test_explainability_math(self):
        # Report only fatigue
        res = score_assessment({'fatigue': True})
        iron = next(n for n in res['nutrients'] if n['nutrient_id'] == 'iron')
        self.assertEqual(iron['raw_score'], 4)
        self.assertEqual(iron['max_score'], 20)
        self.assertEqual(iron['score'], 0.20)
        self.assertEqual(len(iron['contributing_symptoms']), 1)
        self.assertEqual(iron['contributing_symptoms'][0]['id'], 'fatigue')
        
    def test_meal_plan_generation(self):
        res = score_assessment({'fatigue': True, 'pallor': True, 'brittle_nails': True})
        plan = generate_personalized_meal_plan(res)
        self.assertEqual(len(plan['weekly_schedule']), 7)
        self.assertTrue(len(plan['at_risk_nutrients']) > 0)
        
    def test_history_and_pdf(self):
        res = score_assessment({'fatigue': True, 'bone_pain': True})
        plan = generate_personalized_meal_plan(res)
        foods = get_food_recommendations()
        payload = {
            'scoring': res,
            'meal_plan': plan,
            'food_recommendations': foods
        }
        
        # Test History Save
        rec = save_assessment_record('test_user_1', payload)
        self.assertIn('id', rec)
        history = get_user_history('test_user_1')
        self.assertTrue(len(history) >= 1)
        
        # Test PDF Generation
        pdf_bytes = generate_pdf_report(payload)
        self.assertTrue(len(pdf_bytes) > 500)
        self.assertTrue(pdf_bytes.startswith(b'%PDF'))

if __name__ == '__main__':
    unittest.main()
