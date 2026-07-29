import { scoreYield, reasoningYield } from "./yield";
import { scoreRefinance } from "./refinance";
import { scoreLicensingRisk } from "./licensingRisk";
import { scoreAreaGrowth } from "./areaGrowth";
import { scoreBmv } from "./bmv";
import { scoreDemand } from "./demand";
import { scoreTenantProfile } from "./tenantProfile";
import { computeComposite, type FactorScores } from "./composite";
import type { AreaStats } from "@/lib/data/areaStats";

export interface ScoringInput {
  grossYieldBps: number;
  pricePence: number;
  depositPercent: number;
  postcode: string;
  /** Land Registry / census area data; null when unavailable */
  areaStats: AreaStats | null;
}

export interface ScoringResult {
  composite: number | null;
  factors: FactorScores;
  scoredFactorCount: number;
  details: {
    yield: { reasoning: string };
    refinance: ReturnType<typeof scoreRefinance>;
    licensing: ReturnType<typeof scoreLicensingRisk>;
    areaGrowth: ReturnType<typeof scoreAreaGrowth>;
    bmv: ReturnType<typeof scoreBmv>;
    demand: ReturnType<typeof scoreDemand>;
    tenantProfile: ReturnType<typeof scoreTenantProfile>;
  };
}

export function runScoring(input: ScoringInput): ScoringResult {
  const grossYieldPercent = input.grossYieldBps / 100;
  const refinance = scoreRefinance({
    pricePence: input.pricePence,
    depositPercent: input.depositPercent,
  });
  const licensing = scoreLicensingRisk(input.postcode);

  const areaGrowth = scoreAreaGrowth(input.areaStats?.hpi ?? null);
  const bmv = scoreBmv(
    Math.round(input.pricePence / 100),
    input.areaStats?.comps ?? null,
  );
  const demand = scoreDemand(input.areaStats);
  const tenantProfile = scoreTenantProfile(input.areaStats?.tenure ?? null);

  const factors: FactorScores = {
    yield: scoreYield(grossYieldPercent),
    refinance: refinance.score,
    licensingRisk: licensing.score,
    areaGrowth: areaGrowth.score,
    demand: demand.score,
    bmv: bmv.score,
    tenantProfile: tenantProfile.score,
  };

  const scoredFactorCount = Object.values(factors).filter(
    (v) => v != null,
  ).length;

  return {
    composite: computeComposite(factors),
    factors,
    scoredFactorCount,
    details: {
      yield: { reasoning: reasoningYield(grossYieldPercent) },
      refinance,
      licensing,
      areaGrowth,
      bmv,
      demand,
      tenantProfile,
    },
  };
}
