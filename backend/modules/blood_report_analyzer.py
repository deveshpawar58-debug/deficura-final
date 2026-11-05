from typing import Dict, List, Any, Optional
from .blood_report_parser import get_blood_config

def evaluate_parameter_status(result: float, ref_low: Optional[float], ref_high: Optional[float]) -> str:
    """
    Deterministically evaluates result against laboratory or standard reference range.
    """
    if result is None:
        return "unable_to_determine"
        
    try:
        val = float(result)
    except (ValueError, TypeError):
        return "unable_to_determine"

    if ref_low is not None and val < float(ref_low):
        return "below_range"
    if ref_high is not None and val > float(ref_high):
        return "above_range"
    if ref_low is not None or ref_high is not None:
        return "within_range"
    return "unable_to_determine"

def analyze_verified_report(verified_parameters: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Processes user-verified laboratory parameters through deterministic rules to generate:
    - Status evaluation per test
    - Non-diagnostic explanations
    - Indian food recommendations tailored to abnormal parameters
    - Structured Indian meal plan
    - Precautions & healthcare consultation guidance
    """
    config = get_blood_config()
    param_configs = config.get("parameters", {})
    categories = config.get("categories", {})
    
    analyzed_tests = []
    within_count = 0
    below_count = 0
    above_count = 0
    unable_count = 0
    
    nutritional_considerations = []
    collected_foods = {
        "iron_rich": False,
        "b12_rich": False,
        "folate_rich": False,
        "vit_d_rich": False,
        "glycemic_support": False,
        "liver_support": False,
        "kidney_support": False,
        "lipid_support": False,
        "immune_support": False
    }
    
    precautions_set = set([
        "Do not stop or alter any prescribed medication based on this nutritional analysis.",
        "Do not start high-dose vitamin or mineral supplements solely based on this report without professional guidance.",
        "A single blood report does not establish a medical diagnosis; physiological and laboratory variations can occur.",
        "Reference ranges differ between diagnostic laboratories; always consult the specific laboratory's printed reference."
    ])
    
    doctor_consultation_points = []
    
    for item in verified_parameters:
        test_id = item.get("test_id")
        test_name = item.get("test_name", test_id)
        
        try:
            result_val = float(item.get("result")) if item.get("result") is not None else None
        except (ValueError, TypeError):
            result_val = None
            
        unit = item.get("unit", "")
        
        try:
            ref_low = float(item.get("reference_low")) if item.get("reference_low") is not None else None
        except (ValueError, TypeError):
            ref_low = None
            
        try:
            ref_high = float(item.get("reference_high")) if item.get("reference_high") is not None else None
        except (ValueError, TypeError):
            ref_high = None
            
        ref_source = item.get("reference_source", "general")
        ref_text = item.get("reference_text", "")
        if not ref_text:
            if ref_low is not None and ref_high is not None:
                ref_text = f"{ref_low} - {ref_high}"
            elif ref_high is not None:
                ref_text = f"< {ref_high}"
            elif ref_low is not None:
                ref_text = f"> {ref_low}"
            else:
                ref_text = "Not specified"
                
        status = evaluate_parameter_status(result_val, ref_low, ref_high)
        
        # Count stats
        if status == "within_range":
            within_count += 1
            status_label = "Within reference range"
            status_color = "emerald"
        elif status == "below_range":
            below_count += 1
            status_label = "Below laboratory reference range"
            status_color = "rose"
        elif status == "above_range":
            above_count += 1
            status_label = "Above laboratory reference range"
            status_color = "amber"
        else:
            unable_count += 1
            status_label = "Unable to determine"
            status_color = "slate"
            
        # Clinical guidance from config
        p_info = param_configs.get(test_id, {})
        explanation = ""
        nutritional_note = ""
        foods_list = []
        
        if status == "below_range" and "low" in p_info:
            low_cfg = p_info["low"]
            explanation = low_cfg.get("explanation", "Result is below the reference range.")
            nutritional_note = low_cfg.get("nutritional_considerations", "")
            foods_list = low_cfg.get("foods", [])
            for p in low_cfg.get("precautions", []):
                precautions_set.add(p)
        elif status == "above_range" and "high" in p_info:
            high_cfg = p_info["high"]
            explanation = high_cfg.get("explanation", "Result is above the reference range.")
            nutritional_note = high_cfg.get("nutritional_considerations", "")
            foods_list = high_cfg.get("foods", [])
            for p in high_cfg.get("precautions", []):
                precautions_set.add(p)
        elif status == "within_range":
            explanation = "Your result is within the reported laboratory reference range."
            nutritional_note = "Maintain your current balanced dietary intake."
            foods_list = []
        else:
            explanation = "Reference range not available for definitive comparison."
            nutritional_note = "Discuss this value with your diagnostic provider."
            
        # Add doctor consultation criteria if relevant
        if status in ["below_range", "above_range"] and p_info.get("doctor_guidance"):
            doctor_consultation_points.append(f"{test_name}: {p_info.get('doctor_guidance')}")
            
        # Collect nutritional considerations
        if status in ["below_range", "above_range"] and nutritional_note:
            nutritional_considerations.append({
                "test_name": test_name,
                "status": status,
                "status_label": status_label,
                "result_str": f"{result_val} {unit}",
                "ref_str": ref_text,
                "explanation": explanation,
                "nutritional_note": nutritional_note,
                "foods": foods_list
            })
            
            # Categorize food focus
            if test_id in ["hemoglobin", "serum_iron", "serum_ferritin", "mcv", "mch"]:
                collected_foods["iron_rich"] = True
            if test_id in ["vitamin_b12", "mcv"]:
                collected_foods["b12_rich"] = True
            if test_id in ["folate", "mcv", "rdw"]:
                collected_foods["folate_rich"] = True
            if test_id in ["vitamin_d"]:
                collected_foods["vit_d_rich"] = True
            if test_id in ["fasting_glucose", "random_glucose", "hba1c"]:
                collected_foods["glycemic_support"] = True
            if test_id in ["alt_sgpt", "ast_sgot", "bilirubin_total"]:
                collected_foods["liver_support"] = True
            if test_id in ["creatinine", "blood_urea", "egfr", "sodium", "potassium"]:
                collected_foods["kidney_support"] = True
            if test_id in ["cholesterol_total", "ldl", "triglycerides", "hdl"]:
                collected_foods["lipid_support"] = True
            if test_id in ["wbc", "neutrophils", "lymphocytes"]:
                collected_foods["immune_support"] = True

        analyzed_tests.append({
            "test_id": test_id,
            "test_name": test_name,
            "category": item.get("category", p_info.get("category", "other")),
            "category_name": categories.get(item.get("category", p_info.get("category", "")), "Other"),
            "result": result_val,
            "unit": unit,
            "reference_low": ref_low,
            "reference_high": ref_high,
            "reference_source": ref_source,
            "reference_text": ref_text,
            "status": status,
            "status_label": status_label,
            "status_color": status_color,
            "description": p_info.get("description", ""),
            "explanation": explanation,
            "nutritional_note": nutritional_note,
            "foods": foods_list
        })
        
    # Generate tailored Indian 5-slot meal plan based on detected considerations
    meal_plan = _generate_tailored_blood_meal_plan(collected_foods)
    
    return {
        "summary": {
            "total_analyzed": len(analyzed_tests),
            "within_range_count": within_count,
            "below_range_count": below_count,
            "above_range_count": above_count,
            "unable_count": unable_count
        },
        "parameters": analyzed_tests,
        "nutritional_considerations": nutritional_considerations,
        "recommended_meals": meal_plan,
        "precautions": list(precautions_set),
        "doctor_guidance": doctor_consultation_points,
        "disclaimer": (
            "This feature is intended for educational and nutritional guidance only. "
            "It does not diagnose medical conditions or replace professional medical advice. "
            "Laboratory results should be interpreted in the context of symptoms, medical history, "
            "medications, and other clinical information by a qualified physician."
        )
    }

def _generate_tailored_blood_meal_plan(focus_map: Dict[str, bool]) -> Dict[str, Any]:
    """
    Builds a structured 5-slot Indian dietary recommendation plan based on active blood markers.
    """
    # Defaults
    breakfast = "Sprouted Moong & Vegetable Poha with fresh lemon squeeze and crushed roasted peanuts."
    mid_morning = "Fresh Amla Juice or a bowl of Papaya / Sweet Lime (Mosambi) with soaked chia seeds."
    lunch = "Palak Toor Dal Tadka + 2 Whole Wheat Phulkas + Fresh Probiotic Curd (Dahi) + Cucumber-Tomato Salad."
    evening_snack = "Roasted Chana with organic Jaggery (Gur-Chana) or a handful of roasted Pumpkin Seeds."
    dinner = "Moringa (Drumstick) Sambar with Steamed Rice / Idlis or Methi Paneer Bhurji with Multigrain Roti."
    
    highlights = []
    
    if focus_map.get("iron_rich") or focus_map.get("folate_rich"):
        breakfast = "Sprouted Moong & Methi Cheela (pancake) served with fresh mint-amla chutney (Vitamin C boost)."
        lunch = "Palak Dal cooked in an iron kadai + 2 Whole Wheat Rotis + Beetroot Salad with generous lemon."
        evening_snack = "Gur-Chana (30g roasted chickpeas + jaggery) or Halim Seed soaked drink."
        highlights.append("Iron & Folate support: Green leafy vegetables paired with Vitamin C to maximize non-heme absorption.")
        
    if focus_map.get("b12_rich"):
        lunch += " + 1 bowl of fresh Dahi (Curd) or 100g Paneer."
        dinner = "Rohu/Mackerel Fish Curry (if non-veg) OR Methi Paneer Bhurji with 2 Missi Rotis + Dahi."
        highlights.append("Vitamin B12 focus: Daily lacto-vegetarian dairy (curd/paneer) or eggs/fish for cobalamin support.")
        
    if focus_map.get("vit_d_rich"):
        mid_morning = "Spend 15-20 minutes in midday sunlight (11 AM - 1:30 PM) followed by a glass of Chaas (Buttermilk)."
        dinner = "Sauteed sun-exposed button mushrooms in pure cow ghee with Yellow Moong Dal & Rotis."
        highlights.append("Vitamin D focus: Sunlight exposure combined with fat-soluble meal timing.")
        
    if focus_map.get("glycemic_support"):
        breakfast = "Methi (Fenugreek) Roti with Curd or Oats & Vegetable Upma."
        mid_morning = "1 glass soaked Methi Dana water followed by fresh Jamun / Green Apple."
        lunch = "Bitter Gourd (Karela) Sabzi + Toor Dal + 2 Multigrain (Jowar/Bajra) Rotis + Green Salad."
        dinner = "Lauki (Bottle Gourd) & Moong Dal Khichdi with Roasted Papad & Curd."
        highlights.append("Glycemic control: High-fiber millets, fenugreek seeds, and low-glycemic-index whole pulses.")
        
    if focus_map.get("lipid_support"):
        breakfast = "Oats Porridge with 1 tsp Flaxseed (Alsi) powder and 5 soaked almonds."
        lunch = "High-fiber Rajma / Chana with brown rice + Isabgol (Psyllium husk) before dinner."
        evening_snack = "Green Tea with Lemon + 3 Walnut halves (Omega-3 fats)."
        highlights.append("Lipid management: Beta-glucan soluble fiber (Oats/Isabgol) and omega-3s (Flaxseeds/Walnuts).")
        
    if focus_map.get("liver_support"):
        mid_morning = "Fresh Amla Juice or Coconut Water."
        lunch = "Light Moong Dal with Garlic-Jeera tempering, Steamed Rice, and boiled vegetables."
        dinner = "Clear Vegetable Soup with Turmeric & Ginger + 2 Soft Phulkas with Lauki Sabzi."
        highlights.append("Liver support: Light home-cooked meals, zero deep-fried foods, turmeric and garlic anti-inflammatory focus.")

    return {
        "breakfast": {
            "title": "Breakfast (Morning)",
            "description": breakfast
        },
        "mid_morning": {
            "title": "Mid-Morning",
            "description": mid_morning
        },
        "lunch": {
            "title": "Lunch (Afternoon)",
            "description": lunch
        },
        "evening_snack": {
            "title": "Evening Snack",
            "description": evening_snack
        },
        "dinner": {
            "title": "Dinner (Night)",
            "description": dinner
        },
        "clinical_highlights": highlights
    }
