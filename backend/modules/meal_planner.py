from typing import Dict, List, Any
import copy
from .config_loader import get_meal_plan_template, get_food_recommendations

def generate_personalized_meal_plan(scoring_result: Dict[str, Any]) -> Dict[str, Any]:
    template_data = get_meal_plan_template()
    food_recs = get_food_recommendations()
    
    base_plan = copy.deepcopy(template_data.get('weekly_base_plan', []))
    swap_rules = template_data.get('nutrient_targeted_swaps', {})
    
    at_risk_nutrients = []
    nutrients_list = scoring_result.get('nutrients', [])
    
    for n in nutrients_list:
        tier_label = n.get('risk_tier', '')
        short_tier = 'High' if 'High' in tier_label else ('Medium' if 'Medium' in tier_label else ('Low' if 'Low' in tier_label else 'Healthy'))
        n_id = n['nutrient_id']
        
        if short_tier in ['Medium', 'High', 'Low']:
            at_risk_nutrients.append({
                'id': n_id,
                'name': n['name'],
                'tier': short_tier,
                'score_pct': n['score_pct']
            })
            
    tier_rank = {'High': 3, 'Medium': 2, 'Low': 1, 'Healthy': 0}
    at_risk_nutrients.sort(key=lambda x: (tier_rank.get(x['tier'], 0), x['score_pct']), reverse=True)
    
    active_swaps = []
    tailored_bioavailability_tips = []
    
    for item in at_risk_nutrients:
        n_id = item['id']
        tier = item['tier']
        rule = swap_rules.get(n_id)
        if rule and (tier in rule.get('trigger_tiers', []) or (tier == 'Low' and 'Medium' in rule.get('trigger_tiers', []))):
            for swap in rule.get('meal_swaps', []):
                active_swaps.append({
                    'nutrient_id': n_id,
                    'nutrient_name': item['name'],
                    'tier': tier,
                    'meal_slot': swap['meal_slot'],
                    'swap_item': swap['swap_item']
                })
        if n_id in food_recs:
            for rule_text in food_recs[n_id].get('bioavailability_rules', []):
                if rule_text not in tailored_bioavailability_tips:
                    tailored_bioavailability_tips.append(rule_text)
                    
    for day_idx, day_plan in enumerate(base_plan):
        day_plan['customized_additions'] = []
        for swap in active_swaps:
            slot = swap['meal_slot']
            if slot in day_plan:
                if (day_idx % 2 == 0 and swap['tier'] == 'High') or (day_idx % 3 == 0 and swap['tier'] == 'Medium'):
                    day_plan['customized_additions'].append({
                        'nutrient': swap['nutrient_name'],
                        'tier': swap['tier'],
                        'slot': slot.replace('_', ' ').title(),
                        'recommendation': swap['swap_item']
                    })
                    
    return {
        'weekly_schedule': base_plan,
        'at_risk_nutrients': at_risk_nutrients,
        'active_swaps': active_swaps,
        'bioavailability_rules': tailored_bioavailability_tips[:6],
        'total_targeted_interventions': len(active_swaps)
    }
