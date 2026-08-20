import json
import os
import datetime
from modules.config_loader import get_food_recommendations
from modules.scoring_engine import score_assessment
from modules.meal_planner import generate_personalized_meal_plan
from modules.history_storage import save_assessment_record

foods = get_food_recommendations()

# Sample 1: Urban Tech Professional - High Vitamin D and B12
symptoms_1 = {
    'fatigue': True,
    'bone_pain': True,
    'tingling_numbness': True,
    'memory_issues': True,
    'depression_low_mood': True,
    'chronic_fatigue': True
}
res_1 = score_assessment(symptoms_1)
plan_1 = generate_personalized_meal_plan(res_1)
payload_1 = {'scoring': res_1, 'meal_plan': plan_1, 'food_recommendations': foods, 'reported_symptoms_input': symptoms_1}

# Sample 2: Young Adult with Anemia & Folate Risk
symptoms_2 = {
    'fatigue': True,
    'pallor': True,
    'brittle_nails': True,
    'hair_loss': True,
    'breathlessness': True,
    'glossitis_mouth_ulcers': True,
    'poor_concentration': True
}
res_2 = score_assessment(symptoms_2)
plan_2 = generate_personalized_meal_plan(res_2)
payload_2 = {'scoring': res_2, 'meal_plan': plan_2, 'food_recommendations': foods, 'reported_symptoms_input': symptoms_2}

# Sample 3: Improved Post-Intervention Assessment
symptoms_3 = {
    'fatigue': False,
    'pallor': False,
    'brittle_nails': False,
    'bone_pain': False,
    'muscle_cramps': False
}
res_3 = score_assessment(symptoms_3)
plan_3 = generate_personalized_meal_plan(res_3)
payload_3 = {'scoring': res_3, 'meal_plan': plan_3, 'food_recommendations': foods, 'reported_symptoms_input': symptoms_3}

# Save sample records with back-dated timestamps for trend chart
rec1 = save_assessment_record('default_user', payload_1)
rec2 = save_assessment_record('default_user', payload_2)
rec3 = save_assessment_record('default_user', payload_3)

# Adjust timestamps for trend illustration
data_path = r'C:\Users\Lenovo\.gemini\antigravity\scratch\deficura\backend\data\history.json'
with open(data_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

if 'default_user' in db and len(db['default_user']) >= 3:
    db['default_user'][0]['timestamp'] = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=30)).isoformat()
    db['default_user'][0]['date_formatted'] = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime('%b %d, %Y - %I:%M %p')
    
    db['default_user'][1]['timestamp'] = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=14)).isoformat()
    db['default_user'][1]['date_formatted'] = (datetime.datetime.now() - datetime.timedelta(days=14)).strftime('%b %d, %Y - %I:%M %p')
    
    db['default_user'][2]['timestamp'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    db['default_user'][2]['date_formatted'] = datetime.datetime.now().strftime('%b %d, %Y - %I:%M %p')
    
    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2)

print("Pre-populated seed history created successfully!")
