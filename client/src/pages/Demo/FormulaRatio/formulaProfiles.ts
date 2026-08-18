export interface FormulaProfileListItem {
  id: string;
  brand: string;
  productLine: string;
  ageRange: string;
  powderPerScoop: number;
  waterPerScoop: number;
  addedAt: string;
}

export interface FormulaProfileData {
  brand: string;
  productLine: string;
  ageRange: string;
  powderPerScoop: number;
  waterPerScoop: number;
}

const FORMULA_PROFILES_KEY = 'formula_profiles';
const SELECTED_FORMULA_ID_KEY = 'selected_formula_id';

export const DEFAULT_FORMULA_PROFILES: FormulaProfileListItem[] = [
  {
    id: 'kabrita',
    brand: 'Kabrita',
    productLine: 'Pro-Total Comfort',
    ageRange: '12+ months',
    powderPerScoop: 8.8,
    waterPerScoop: 2,
    addedAt: '2026-06-15 09:30',
  },
  {
    id: 'aptamil',
    brand: 'Aptamil',
    productLine: 'Gold+',
    ageRange: '0-6 months',
    powderPerScoop: 9.1,
    waterPerScoop: 4,
    addedAt: '2026-06-10 14:20',
  },
  {
    id: 'nan',
    brand: 'NAN',
    productLine: 'Optipro',
    ageRange: '6-12 months',
    powderPerScoop: 8.8,
    waterPerScoop: 4,
    addedAt: '2026-05-28 11:45',
  },
  {
    id: 'similac',
    brand: 'Similac',
    productLine: 'Advance',
    ageRange: '0-12 months',
    powderPerScoop: 8.7,
    waterPerScoop: 2,
    addedAt: '2026-05-20 16:10',
  },
  {
    id: 'enfamil',
    brand: 'Enfamil',
    productLine: 'NeuroPro',
    ageRange: '0-12 months',
    powderPerScoop: 8.8,
    waterPerScoop: 2,
    addedAt: '2026-04-12 08:55',
  },
  {
    id: 'hipp',
    brand: 'HiPP',
    productLine: 'Combiotic',
    ageRange: '6+ months',
    powderPerScoop: 9.3,
    waterPerScoop: 2,
    addedAt: '2026-03-08 10:30',
  },
];

export const readFormulaProfiles = (): FormulaProfileListItem[] => {
  const stored = localStorage.getItem(FORMULA_PROFILES_KEY);
  if (!stored) return DEFAULT_FORMULA_PROFILES;

  try {
    const saved = JSON.parse(stored) as FormulaProfileListItem[];
    if (!Array.isArray(saved)) return DEFAULT_FORMULA_PROFILES;

    return DEFAULT_FORMULA_PROFILES.map((profile) => ({
      ...profile,
      ...saved.find((item) => item.id === profile.id),
    }));
  } catch {
    localStorage.removeItem(FORMULA_PROFILES_KEY);
    return DEFAULT_FORMULA_PROFILES;
  }
};

export const readSelectedFormulaId = (): string => {
  const selectedId = localStorage.getItem(SELECTED_FORMULA_ID_KEY);
  return readFormulaProfiles().some((profile) => profile.id === selectedId)
    ? selectedId!
    : DEFAULT_FORMULA_PROFILES[0].id;
};

export const setActiveFormulaProfile = (
  profile: FormulaProfileListItem,
): void => {
  const activeProfile: FormulaProfileData = {
    brand: profile.brand,
    productLine: profile.productLine,
    ageRange: profile.ageRange,
    powderPerScoop: profile.powderPerScoop,
    waterPerScoop: profile.waterPerScoop,
  };

  localStorage.setItem(SELECTED_FORMULA_ID_KEY, profile.id);
  localStorage.setItem('formula_profile', JSON.stringify(activeProfile));
  localStorage.setItem('formula_profile_configured', 'true');
  window.dispatchEvent(new Event('formulaProfileUpdated'));
};

export const updateFormulaProfile = (
  id: string,
  data: FormulaProfileData,
): FormulaProfileListItem | null => {
  const profiles = readFormulaProfiles();
  const index = profiles.findIndex((profile) => profile.id === id);
  if (index === -1) return null;

  const updatedProfile = { ...profiles[index], ...data };
  profiles[index] = updatedProfile;
  localStorage.setItem(FORMULA_PROFILES_KEY, JSON.stringify(profiles));

  if (readSelectedFormulaId() === id) {
    setActiveFormulaProfile(updatedProfile);
  }

  return updatedProfile;
};
