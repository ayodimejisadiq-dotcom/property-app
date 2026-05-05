import { scoreYield } from "./yield";
import { computeComposite, type FactorScores } from "./composite";

export interface ScoringInput {
  grossYieldBps: number;
}

export interface ScoringResult {
  composite: number | null;
  factors: FactorScores;
}

export function runScoring(input: ScoringInput): ScoringResult {
  const grossYieldPercent = input.grossYieldBps / 100;

  const factors: FactorScores = {
    yield: scoreYield(grossYieldPercent),
    // The remaining 6 factors require Phase 3 data sources (Land Registry,
    // ONS Census, council licensing). Until those land they return null and
    // composite-weighting redistributes accordingly.
    areaGrowth: null,
    demand: null,
    refinance: null,
    bmv: null,
    tenantProfile: null,
    licensingRisk: null,
  };

  return { composite: computeComposite(factors), factors };
}
