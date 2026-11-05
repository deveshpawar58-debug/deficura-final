import re
import os
import json
import io
from typing import Dict, List, Any, Optional, Tuple

try:
    import pypdf
except ImportError:
    pypdf = None

try:
    from PIL import Image
    import pytesseract
except ImportError:
    Image = None
    pytesseract = None

CONFIG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'config'))
BLOOD_CONFIG_FILE = os.path.join(CONFIG_DIR, 'blood_parameters.json')

_BLOOD_CONFIG_CACHE = None

def get_blood_config() -> Dict[str, Any]:
    global _BLOOD_CONFIG_CACHE
    if _BLOOD_CONFIG_CACHE is None:
        if os.path.exists(BLOOD_CONFIG_FILE):
            with open(BLOOD_CONFIG_FILE, 'r', encoding='utf-8') as f:
                _BLOOD_CONFIG_CACHE = json.load(f)
        else:
            _BLOOD_CONFIG_CACHE = {"categories": {}, "parameters": {}}
    return _BLOOD_CONFIG_CACHE

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from digital PDF bytes using pypdf.
    """
    if not pypdf:
        raise RuntimeError("pypdf is not installed.")
    
    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    extracted_text = []
    for page_num, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text:
            extracted_text.append(page_text)
    return "\n".join(extracted_text)

def extract_text_from_image(file_bytes: bytes) -> str:
    """
    Extracts text from image bytes using PIL and pytesseract (if OCR engine available).
    """
    if not Image:
        raise RuntimeError("Pillow is not installed.")
    
    img = Image.open(io.BytesIO(file_bytes))
    if pytesseract:
        try:
            return pytesseract.image_to_string(img)
        except Exception as e:
            # If tesseract binary is not configured on OS, gracefully return fallback note
            return ""
    return ""

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """
    Detects file type from extension and extracts raw text.
    """
    ext = os.path.splitext(filename.lower())[1]
    if ext == '.pdf':
        return extract_text_from_pdf(file_bytes)
    elif ext in ['.jpg', '.jpeg', '.png', '.webp']:
        return extract_text_from_image(file_bytes)
    else:
        # Try UTF-8 plain text decode
        try:
            return file_bytes.decode('utf-8')
        except Exception:
            return ""

def _find_reference_range_in_text(line: str) -> Tuple[Optional[float], Optional[float], str]:
    """
    Finds printed reference ranges in a text line like '12.0 - 16.0', '12-16', '70 - 110', '< 200', '>= 60'.
    """
    # Pattern 1: standard low - high range (e.g. 12.0 - 16.0, 150000 - 450000, 0.6 - 1.2, 70-140)
    range_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)', line, re.IGNORECASE)
    if range_match:
        try:
            low = float(range_match.group(1))
            high = float(range_match.group(2))
            return low, high, f"{low} - {high}"
        except ValueError:
            pass

    # Pattern 2: Upper bound e.g. "< 200", "<= 100", "< 1.2"
    upper_match = re.search(r'(?:<|<=|less\s+than)\s*(\d+(?:\.\d+)?)', line, re.IGNORECASE)
    if upper_match:
        try:
            high = float(upper_match.group(1))
            return 0.0, high, f"< {high}"
        except ValueError:
            pass

    # Pattern 3: Lower bound e.g. "> 60", ">= 30", "> 40"
    lower_match = re.search(r'(?:>|>=|greater\s+than)\s*(\d+(?:\.\d+)?)', line, re.IGNORECASE)
    if lower_match:
        try:
            low = float(lower_match.group(1))
            return low, None, f"> {low}"
        except ValueError:
            pass

    return None, None, ""

def _find_numbers_in_line(line: str) -> List[float]:
    """
    Extracts numerical candidate tokens from a line.
    """
    tokens = re.findall(r'(?<![A-Za-z])(?:\d+(?:\.\d+)?|\.\d+)(?![A-Za-z])', line)
    numbers = []
    for t in tokens:
        try:
            numbers.append(float(t))
        except ValueError:
            pass
    return numbers

def parse_blood_report_text(raw_text: str) -> List[Dict[str, Any]]:
    """
    Parses unstructured text extracted from blood test reports,
    identifying test names, values, units, and printed reference ranges.
    """
    config = get_blood_config()
    param_configs = config.get("parameters", {})
    categories = config.get("categories", {})
    
    lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
    extracted_results: Dict[str, Dict[str, Any]] = {}
    
    # Process line by line
    for line in lines:
        line_clean = line.lower()
        
        # Check against each configured parameter
        for param_id, p_info in param_configs.items():
            if param_id in extracted_results:
                continue # Already found earlier
            
            # Match aliases
            matched_alias = None
            for alias in p_info.get("aliases", []):
                # Ensure word boundary or clear substring
                pattern = r'\b' + re.escape(alias.lower()) + r'\b'
                if re.search(pattern, line_clean):
                    matched_alias = alias
                    break
            
            if matched_alias:
                # We found a parameter mention in this line
                ref_low, ref_high, ref_text = _find_reference_range_in_text(line)
                
                # Extract numbers from line
                numbers = _find_numbers_in_line(line)
                
                # If numbers found, determine the result value
                result_val = None
                if numbers:
                    # If reference range was found, avoid picking the range boundaries as result
                    if ref_low is not None and ref_high is not None:
                        # Find numbers in the line that are not equal to ref_low or ref_high
                        candidates = [n for n in numbers if n != ref_low and n != ref_high]
                        if candidates:
                            result_val = candidates[0]
                        else:
                            result_val = numbers[0]
                    else:
                        result_val = numbers[0]
                
                if result_val is not None:
                    # Determine unit
                    default_unit = p_info.get("default_unit", "")
                    # Check if standard unit is present in line
                    unit_match = re.search(r'(g/dl|mg/dl|pg/ml|ng/ml|u/l|iu/l|%|fL|pg|mil/ul|10\^3/ul|/ul|meq/l|mmol/l)', line, re.IGNORECASE)
                    detected_unit = unit_match.group(0) if unit_match else default_unit
                    
                    # Reference range resolution
                    if ref_low is None and ref_high is None:
                        def_ref = p_info.get("default_ref", {})
                        ref_low = def_ref.get("low")
                        ref_high = def_ref.get("high")
                        ref_source = "general"
                        if ref_low is not None and ref_high is not None:
                            ref_text = f"{ref_low} - {ref_high} (General)"
                        elif ref_high is not None:
                            ref_text = f"< {ref_high} (General)"
                        elif ref_low is not None:
                            ref_text = f"> {ref_low} (General)"
                        else:
                            ref_text = "N/A"
                    else:
                        ref_source = "laboratory"
                    
                    extracted_results[param_id] = {
                        "test_id": param_id,
                        "test_name": p_info.get("name", param_id.title()),
                        "category": p_info.get("category", "other"),
                        "category_name": categories.get(p_info.get("category", ""), "Other"),
                        "result": result_val,
                        "unit": detected_unit,
                        "reference_low": ref_low,
                        "reference_high": ref_high,
                        "reference_source": ref_source,
                        "reference_text": ref_text,
                        "description": p_info.get("description", "")
                    }
                    
    return list(extracted_results.values())
