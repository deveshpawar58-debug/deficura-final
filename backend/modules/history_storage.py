import json
import os
import uuid
import datetime
from typing import Dict, List, Any, Optional

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data'))
HISTORY_FILE = os.path.join(DATA_DIR, 'history.json')

def _load_history_db() -> Dict[str, List[Dict[str, Any]]]:
    if not os.path.exists(HISTORY_FILE):
        return {}
    try:
        with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}

def _save_history_db(data: Dict[str, List[Dict[str, Any]]]) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def save_assessment_record(user_id: str, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
    db = _load_history_db()
    if user_id not in db:
        db[user_id] = []
        
    assessment_id = str(uuid.uuid4())
    record = {
        'id': assessment_id,
        'user_id': user_id,
        'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'date_formatted': datetime.datetime.now().strftime('%b %d, %Y - %I:%M %p'),
        'summary': assessment_data.get('scoring', {}).get('summary', {}),
        'nutrient_scores': {
            n['nutrient_id']: {
                'name': n['name'],
                'score': n['score'],
                'score_pct': n['score_pct'],
                'risk_tier': n['risk_tier'],
                'hex_color': n['hex_color']
            } for n in assessment_data.get('scoring', {}).get('nutrients', [])
        },
        'full_data': assessment_data
    }
    
    db[user_id].append(record)
    _save_history_db(db)
    return record

def get_user_history(user_id: str) -> List[Dict[str, Any]]:
    db = _load_history_db()
    records = db.get(user_id, [])
    return sorted(records, key=lambda x: x.get('timestamp', ''), reverse=True)

def get_assessment_by_id(assessment_id: str) -> Optional[Dict[str, Any]]:
    db = _load_history_db()
    for user_id, assessments in db.items():
        for item in assessments:
            if item.get('id') == assessment_id:
                return item
    return None
