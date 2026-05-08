import { scoreYield } from "./yield";
import { scoreRefinance } from "./refinance";
import { scoreLicensingRisk } from "./licensingRisk";
import { computeComposite, type FactorScores } from "./composite";

export interface ScoringInput {
  grossYieldBps: number;
  pricePence: number;
  depositPercent: number;
  postcode: string;
}

export interface ScoringResult {
  composite: number | null;
  factors: FactorScores;
  details: {
    refinance: ReturnType<typeof scoreRefinance>;
    licensing: ReturnType<typeof scoreLicensingRisk>;
  };
}

export function runScoring(input: ScoringInput): ScoringResult {
  const grossYieldPercent = input.grossYieldBps / 100;
  const refinance = scoreRefinance({
    pricePence: input.pricePence,
    depositPercent: input.depositPercent,
  });
  const licensing = scoreLicensingRisk(input.postcode);

  const factors: FactorScores = {
    yield: scoreYield(grossYieldPercent),
    refinance: refinance.score,
    licensingRisk: licensing.score,
    // Phase 3 data: Land Registry + ONS Census
    areaGrowth: null,
    demand: null,
    bmv: null,
    tenantProfile: null,
  };

  return {
    composite: computeComposite(factors),
    factors,
    details: { refinance, licensing },
  };
}
