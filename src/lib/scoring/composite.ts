export const FACTOR_WEIGHTS = {
  yield: 0.25,
  areaGrowth: 0.15,
  demand: 0.15,
  refinance: 0.10,
  bmv: 0.15,
  tenantProfile: 0.10,
  licensingRisk: 0.10,
} as const;

export type FactorKey = keyof typeof FACTOR_WEIGHTS;

export type FactorScores = {
  [K in FactorKey]: number | null;
};

/**
 * Weighted composite. If a factor is null (insufficient data), its weight is
 * redistributed proportionally across the remaining factors. Returns null
 * only if every factor is null.
 */
export function computeComposite(scores: FactorScores): number | null {
  const present = (Object.entries(scores) as [FactorKey, number | null][])
    .filter(([, v]) => v != null) as [FactorKey, number][];

  if (present.length === 0) return null;

  const totalWeight = present.reduce(
    (sum, [k]) => sum + FACTOR_WEIGHTS[k],
    0,
  );
  const weighted = present.reduce(
    (sum, [k, v]) => sum + v * (FACTOR_WEIGHTS[k] / totalWeight),
    0,
  );
  return Math.round(weighted);
}
