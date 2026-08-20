from typing import Dict, List, Any, Union
from .config_loader import get_nutrients, get_thresholds

def evaluate_risk_tier(score: float, thresholds: List[Dict[str, Any]]) -> Dict[str, Any]:
    score_clamped = max(0.0, min(1.0, score))
    for tier in thresholds:
        min_s = tier['min_score']
        max_s = tier['max_score']
        if max_s >= 1.0:
            if min_s <= score_clamped <= max_s:
                return tier
        else:
            if min_s <= score_clamped < max_s:
                return tier
    if score_clamped >= 0.75:
        return thresholds[-1]
    return thresholds[0]

def score_assessment(reported_symptoms: Dict[str, Union[bool, int]]) -> Dict[str, Any]:
    nutrients = get_nutrients()
    thresholds = get_thresholds()
    
    cleaned_symptoms = {}
    for s_id, val in reported_symptoms.items():
        cleaned_symptoms[s_id] = 1 if bool(val) else 0
        
    nutrient_results = []
    total_symptoms_reported = sum(1 for v in cleaned_symptoms.values() if v == 1)
    
    tier_counts = {'Healthy': 0, 'Low Risk': 0, 'Medium Risk': 0, 'High Risk': 0}
    high_risk_nutrients = []
    medium_risk_nutrients = []
    
    for nutrient in nutrients:
        n_id = nutrient['id']
        n_name = nutrient['name']
        n_subtitle = nutrient.get('subtitle', '')
        max_score = float(nutrient['max_score'])
        symptoms_list = nutrient.get('symptoms', [])
        
        raw_score = 0
        contributing_symptoms = []
        unreported_symptoms = []
        
        for sym in symptoms_list:
            s_id = sym['id']
            weight = sym['weight']
            is_present = cleaned_symptoms.get(s_id, 0) == 1
            
            if is_present:
                raw_score += weight
                contributing_symptoms.append({
                    'id': s_id,
                    'name': sym['name'],
                    'clinical_description': sym['clinical_description'],
                    'weight': weight,
                    'contribution_fraction': round(weight / max_score, 4),
                    'contribution_pct': round((weight / max_score) * 100, 1)
                })
            else:
                unreported_symptoms.append({
                    'id': s_id,
                    'name': sym['name'],
                    'clinical_description': sym['clinical_description'],
                    'weight': weight
                })
                
        normalized_score = round(raw_score / max_score, 4) if max_score > 0 else 0.0
        normalized_score = min(1.0, max(0.0, normalized_score))
        
        tier = evaluate_risk_tier(normalized_score, thresholds)
        tier_label = tier['label']
        tier_counts[tier_label] = tier_counts.get(tier_label, 0) + 1
        
        if tier['id'] == 'high':
            high_risk_nutrients.append(n_name)
        elif tier['id'] == 'medium':
            medium_risk_nutrients.append(n_name)
            
        symptom_weights_str = ' + '.join([str(c['weight']) for c in contributing_symptoms]) if contributing_symptoms else '0'
        math_formula = f"S({n_name}) = [{symptom_weights_str}] / {int(max_score)} = {raw_score} / {int(max_score)} = {normalized_score:.2f} ({normalized_score * 100:.1f}%)"
        
        nutrient_results.append({
            'nutrient_id': n_id,
            'name': n_name,
            'subtitle': n_subtitle,
            'raw_score': raw_score,
            'max_score': int(max_score),
            'score': normalized_score,
            'score_pct': round(normalized_score * 100, 1),
            'risk_tier': tier_label,
            'tier_id': tier['id'],
            'color': tier['color'],
            'hex_color': tier['hex_color'],
            'badge_class': tier['badge_class'],
            'action_summary': tier['action_summary'],
            'description': nutrient.get('description', ''),
            'prevalence_india': nutrient.get('prevalence_india', ''),
            'math_formula': math_formula,
            'contributing_symptoms': contributing_symptoms,
            'unreported_symptoms': unreported_symptoms,
            'total_possible_symptoms': len(symptoms_list),
            'reported_symptom_count': len(contributing_symptoms)
        })
        
    if high_risk_nutrients:
        high_str = ', '.join(high_risk_nutrients)
        overall_status = f"High Risk detected for {len(high_risk_nutrients)} micronutrient(s): {high_str}."
        overall_severity = 'high'
    elif medium_risk_nutrients:
        med_str = ', '.join(medium_risk_nutrients)
        overall_status = f"Moderate Risk detected for {len(medium_risk_nutrients)} micronutrient(s): {med_str}."
        overall_severity = 'medium'
    elif tier_counts.get('Low Risk', 0) > 0:
        overall_status = "Mild deficiency indicators detected. Dietary optimizations recommended."
        overall_severity = 'low'
    else:
        overall_status = "All 7 micronutrient risk profiles are within healthy baseline parameters."
        overall_severity = 'healthy'
        
    return {
        'nutrients': nutrient_results,
        'summary': {
            'total_symptoms_reported': total_symptoms_reported,
            'high_risk_count': len(high_risk_nutrients),
            'medium_risk_count': len(medium_risk_nutrients),
            'low_risk_count': tier_counts.get('Low Risk', 0),
            'healthy_count': tier_counts.get('Healthy', 0),
            'high_risk_nutrients': high_risk_nutrients,
            'medium_risk_nutrients': medium_risk_nutrients,
            'overall_status': overall_status,
            'overall_severity': overall_severity
        }
    }
