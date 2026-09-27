// Compare raw device values, independently of display rounding and ml/oz selection.
export function getResourceWarnings(waterLiters: number, powderGrams: number, quality: string, chamberUses: number) {
  return {
    water: waterLiters > 0 && waterLiters < 0.3,
    formula: powderGrams > 0 && powderGrams < 100,
    quality: quality === 'good', // Middle TDS tier is displayed as Normal.
    chamber: chamberUses >= 6 && chamberUses < 8,
  };
}

export function getResourceAlarms(waterLiters: number, powderGrams: number, quality: string, chamberUses: number) {
  return {
    water: waterLiters === 0,
    formula: powderGrams === 0,
    quality: quality === 'poor',
    chamber: chamberUses >= 8,
  };
}

export function isResourceBlocked(alarms: ReturnType<typeof getResourceAlarms>, mode: 'milk' | 'water') {
  return alarms.water || (mode === 'milk' && (alarms.formula || alarms.chamber));
}
