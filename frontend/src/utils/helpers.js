export const BODILY_SYSTEMS = [
  { id: 'all', name: 'All Symptoms', icon: 'Sparkles' },
  { id: 'energy', name: 'Energy & Fatigue', icon: 'Zap' },
  { id: 'neuro', name: 'Neurological & Brain', icon: 'Brain' },
  { id: 'muscles', name: 'Muscles, Bones & Teeth', icon: 'Activity' },
  { id: 'immunity', name: 'Immunity, Skin & Hair', icon: 'Shield' },
  { id: 'sensory', name: 'Vision, Mouth & Senses', icon: 'Eye' }
];

export function categorizeSymptom(symptomId) {
  const energyIds = ['fatigue', 'breathlessness', 'chronic_fatigue'];
  const neuroIds = ['tingling_numbness', 'memory_issues', 'mood_changes', 'poor_concentration', 'depression_low_mood'];
  const muscleIds = ['bone_pain', 'muscle_weakness', 'muscle_cramps', 'dental_problems', 'bone_fractures'];
  const immunityIds = ['frequent_infections', 'slow_wound_healing', 'dry_scaly_skin', 'hair_loss', 'hair_thinning', 'brittle_nails', 'pallor'];
  const sensoryIds = ['night_blindness', 'dry_itchy_eyes', 'taste_smell_loss', 'glossitis_mouth_ulcers'];

  if (energyIds.includes(symptomId)) return 'energy';
  if (neuroIds.includes(symptomId)) return 'neuro';
  if (muscleIds.includes(symptomId)) return 'muscles';
  if (immunityIds.includes(symptomId)) return 'immunity';
  if (sensoryIds.includes(symptomId)) return 'sensory';
  return 'energy';
}

export const SAMPLE_PERSONAS = [
  {
    id: 'urban_worker',
    name: 'Urban IT Professional',
    subtitle: 'Indoor desk worker with minimal sunlight & fatigue',
    symptoms: ['fatigue', 'bone_pain', 'tingling_numbness', 'memory_issues', 'depression_low_mood', 'chronic_fatigue'],
    tag: 'Vit D + B12 Risk'
  },
  {
    id: 'anemic_vegetarian',
    name: 'Vegetarian Young Adult',
    subtitle: 'Low iron & folate symptoms with hair shedding & pallor',
    symptoms: ['fatigue', 'pallor', 'brittle_nails', 'hair_loss', 'breathlessness', 'glossitis_mouth_ulcers', 'poor_concentration'],
    tag: 'Iron + Folate Risk'
  },
  {
    id: 'elderly_profile',
    name: 'Senior / Elderly Profile',
    subtitle: 'Muscle cramps, bone tenderness & paresthesia',
    symptoms: ['muscle_cramps', 'bone_fractures', 'dental_problems', 'tingling_numbness', 'memory_issues', 'bone_pain'],
    tag: 'Calcium + B12 Risk'
  },
  {
    id: 'low_immunity',
    name: 'Low Immunity Profile',
    subtitle: 'Recurrent colds, night vision strain & slow healing',
    symptoms: ['frequent_infections', 'slow_wound_healing', 'taste_smell_loss', 'night_blindness', 'dry_itchy_eyes', 'dry_scaly_skin'],
    tag: 'Zinc + Vit A Risk'
  },
  {
    id: 'healthy_profile',
    name: 'Balanced Healthy',
    subtitle: 'No significant symptoms reported',
    symptoms: [],
    tag: 'Baseline Optimal'
  }
];

export function getTierColorClasses(tierLabel) {
  if (tierLabel?.includes('High')) {
    return {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-300 dark:border-rose-800',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700',
      text: 'text-rose-600 dark:text-rose-400',
      bar: 'bg-rose-500',
      hex: '#EF4444'
    };
  }
  if (tierLabel?.includes('Medium')) {
    return {
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      border: 'border-orange-300 dark:border-orange-800',
      badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300 border border-orange-300 dark:border-orange-700',
      text: 'text-orange-600 dark:text-orange-400',
      bar: 'bg-orange-500',
      hex: '#F97316'
    };
  }
  if (tierLabel?.includes('Low')) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-300 dark:border-amber-800',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700',
      text: 'text-amber-600 dark:text-amber-400',
      bar: 'bg-amber-500',
      hex: '#F59E0B'
    };
  }
  return {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
    text: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
    hex: '#10B981'
  };
}
