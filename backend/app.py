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
from modules.blood_report_parser import extract_text_from_file, parse_blood_report_text
from modules.blood_report_analyzer import analyze_verified_report

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

@app.route('/blood-report/extract', methods=['POST'])
def extract_blood_report():
    """
    Accepts uploaded file (PDF/Image) or raw text and returns extracted blood test parameters.
    """
    try:
        raw_text = ""
        filename = "pasted_text.txt"
        
        # Check if multipart file was uploaded
        if 'file' in request.files:
            uploaded_file = request.files['file']
            if uploaded_file.filename:
                filename = uploaded_file.filename
                file_bytes = uploaded_file.read()
                raw_text = extract_text_from_file(file_bytes, filename)
        else:
            # Check for JSON payload with raw_text
            json_data = request.get_json(force=True, silent=True) or {}
            raw_text = json_data.get('raw_text', '')
            
        if not raw_text.strip():
            return jsonify({
                'success': False,
                'error': 'No readable text could be extracted. Please paste your laboratory text or enter parameters manually.',
                'extracted_parameters': [],
                'total_detected': 0
            }), 200
            
        extracted_params = parse_blood_report_text(raw_text)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'extracted_parameters': extracted_params,
            'total_detected': len(extracted_params),
            'raw_text_snippet': raw_text[:500] if raw_text else ''
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error extracting blood report: {str(e)}',
            'extracted_parameters': [],
            'total_detected': 0
        }), 500

@app.route('/blood-report/analyze', methods=['POST'])
def analyze_blood_report():
    """
    Accepts user-verified list of parameters, compares against reference ranges,
    and returns deterministic analysis, nutritional considerations, Indian food recommendations,
    precautions, and doctor consultation guidance.
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        parameters = data.get('parameters', [])
        
        if not parameters:
            return jsonify({
                'success': False,
                'error': 'No parameters provided for analysis.'
            }), 400
            
        analysis_result = analyze_verified_report(parameters)
        
        return jsonify({
            'success': True,
            'analysis': analysis_result
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error analyzing parameters: {str(e)}'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"DefiCura Backend running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
