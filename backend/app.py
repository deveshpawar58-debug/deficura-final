import os
import time
import uuid
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from modules.config_loader import (
    get_nutrients, get_thresholds, get_food_recommendations,
    get_meal_plan_template, get_master_symptom_list
)
from modules.scoring_engine import score_assessment
from modules.meal_planner import generate_personalized_meal_plan
from modules.history_storage import save_assessment_record, get_user_history, get_assessment_by_id
from modules.pdf_generator import generate_pdf_report

app = Flask(__name__)
# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'app': 'DefiCura',
        'version': '1.0.0',
        'engine': 'deterministic_rule_based_scoring'
    }), 200

@app.route('/nutrients', methods=['GET'])
def get_nutrients_metadata():
    """
    Returns master deduplicated symptom checklist and nutrient mappings.
    """
    nutrients = get_nutrients()
    master_symptoms = get_master_symptom_list()
    thresholds = get_thresholds()
    food_recommendations = get_food_recommendations()
    
    return jsonify({
        'nutrients': nutrients,
        'master_symptoms': master_symptoms,
        'thresholds': thresholds,
        'food_recommendations': food_recommendations,
        'total_unique_symptoms': len(master_symptoms)
    }), 200

@app.route('/assess', methods=['POST'])
def assess_symptoms():
    """
    Accepts JSON body with symptoms checklist (binary Yes/No) and optional user_id.
    Runs rule-based scoring engine across all 7 nutrients, generates personalized meal plan,
    and returns complete explainable analysis within <0.8s.
    """
    start_time = time.time()
    data = request.get_json(force=True, silent=True) or {}
    
    symptoms = data.get('symptoms', {})
    user_id = data.get('user_id') or 'default_user'
    
    # 1. Scoring Engine
    scoring_result = score_assessment(symptoms)
    
    # 2. Personalized Meal Plan Generator
    meal_plan = generate_personalized_meal_plan(scoring_result)
    
    # 3. Targeted Food Recommendations
    all_foods = get_food_recommendations()
    # Filter relevant food recommendations (highlight at-risk ones, include all)
    relevant_foods = {}
    for n in scoring_result['nutrients']:
        n_id = n['nutrient_id']
        if n_id in all_foods:
            relevant_foods[n_id] = all_foods[n_id]
            
    # Combine full assessment payload
    assessment_payload = {
        'scoring': scoring_result,
        'meal_plan': meal_plan,
        'food_recommendations': relevant_foods,
        'reported_symptoms_input': symptoms
    }
    
    # 4. Save to History
    saved_record = save_assessment_record(user_id, assessment_payload)
    
    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    
    return jsonify({
        'assessment_id': saved_record['id'],
        'user_id': user_id,
        'timestamp': saved_record['timestamp'],
        'date_formatted': saved_record['date_formatted'],
        'scoring': scoring_result,
        'meal_plan': meal_plan,
        'food_recommendations': relevant_foods,
        'latency_ms': elapsed_ms,
        'performance_target_met': elapsed_ms < 800
    }), 200

@app.route('/history', methods=['GET'])
def get_history():
    """
    Returns past assessment timeline for trend tracking.
    """
    user_id = request.args.get('user_id', 'default_user')
    history = get_user_history(user_id)
    return jsonify({
        'user_id': user_id,
        'total_assessments': len(history),
        'history': history
    }), 200

@app.route('/report/pdf', methods=['POST'])
def export_pdf():
    """
    Generates and returns downloadable PDF medical report.
    """
    data = request.get_json(force=True, silent=True) or {}
    
    # If assessment_id provided, fetch from storage, else use passed assessment body
    assessment_id = data.get('assessment_id')
    if assessment_id:
        record = get_assessment_by_id(assessment_id)
        if record:
            assessment_data = record.get('full_data', {})
        else:
            assessment_data = data
    else:
        assessment_data = data
        
    pdf_bytes = generate_pdf_report(assessment_data)
    
    response = make_response(pdf_bytes)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename=DefiCura_Nutritional_Report.pdf'
    return response

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"DefiCura Backend running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
