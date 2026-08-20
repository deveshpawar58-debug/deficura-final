import json
import os
from typing import Dict, List, Any

CONFIG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'config'))

_CACHE: Dict[str, Any] = {}

def load_json(filename: str) -> Dict[str, Any]:
    filepath = os.path.join(CONFIG_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_nutrients() -> List[Dict[str, Any]]:
    if 'nutrients' not in _CACHE:
        _CACHE['nutrients'] = load_json('nutrients.json').get('nutrients', [])
    return _CACHE['nutrients']

def get_thresholds() -> List[Dict[str, Any]]:
    if 'thresholds' not in _CACHE:
        _CACHE['thresholds'] = load_json('thresholds.json').get('tiers', [])
    return _CACHE['thresholds']

def get_food_recommendations() -> Dict[str, Any]:
    if 'foods' not in _CACHE:
        _CACHE['foods'] = load_json('food_recommendations.json').get('recommendations', {})
    return _CACHE['foods']

def get_meal_plan_template() -> Dict[str, Any]:
    if 'meal_plan' not in _CACHE:
        _CACHE['meal_plan'] = load_json('meal_plan_template.json')
    return _CACHE['meal_plan']

def reload_configs() -> None:
    _CACHE.clear()

def get_master_symptom_list() -> List[Dict[str, Any]]:
    nutrients = get_nutrients()
    symptoms_map: Dict[str, Dict[str, Any]] = {}
    
    for nutrient in nutrients:
        n_id = nutrient['id']
        n_name = nutrient['name']
        for sym in nutrient.get('symptoms', []):
            s_id = sym['id']
            if s_id not in symptoms_map:
                symptoms_map[s_id] = {
                    'id': s_id,
                    'name': sym['name'],
                    'clinical_description': sym['clinical_description'],
                    'affected_nutrients': []
                }
            symptoms_map[s_id]['affected_nutrients'].append({
                'id': n_id,
                'name': n_name,
                'weight': sym['weight']
            })
            
    master_list = list(symptoms_map.values())
    for item in master_list:
        item['is_shared'] = len(item['affected_nutrients']) > 1
        item['nutrient_count'] = len(item['affected_nutrients'])
        
    return master_list
