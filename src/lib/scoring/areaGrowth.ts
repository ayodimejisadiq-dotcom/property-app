import type { HpiStats } from "@/lib/data/areaStats";

export interface AreaGrowthResult {
  score: number | null;
  /** 5-year price growth, percent */
  growthPct: number | null;
  reasoning: string;
  source: string;
}

const SOURCE = "HM Land Registry UK House Price Index";

/**
 * Area growth — 5-year local-authority house price growth from the UK HPI.
 *
 *   ≥ 35%   → 90–95
 *   25–35%  → 75–90
 *   15–25%  → 60–75
 *   5–15%   → 45–60
 *   0–5%    → 35–45
 *   < 0%    → 20–35 (floor 20 at −10% or worse)
 */
export function scoreAreaGrowth(hpi: HpiStats | null): AreaGrowthResult {
  if (!hpi || hpi.growth5yPct == null) {
    return {
      score: null,
      growthPct: null,
      reasoning:
        "No house price index data was available for this area, so growth couldn't be scored.",
      source: SOURCE,
    };
  }

  const g = hpi.growth5yPct;
  let score: number;
  if (g >= 35) score = Math.min(95, Math.round(90 + (g - 35) * 0.5));
  else if (g >= 25) score = Math.round(75 + ((g - 25) / 10) * 15);
  else if (g >= 15) score = Math.round(60 + ((g - 15) / 10) * 15);
  else if (g >= 5) score = Math.round(45 + ((g - 5) / 10) * 15);
  else if (g >= 0) score = Math.round(35 + (g / 5) * 10);
  else score = Math.max(20, Math.round(35 + g * 1.5));

  const avg = hpi.latestAvgPricePounds.toLocaleString("en-GB");
  const direction =
    g >= 15 ? "well above" : g >= 5 ? "around" : g >= 0 ? "below" : "negative versus";
  return {
    score,
    growthPct: g,
    reasoning: `Average prices in this local authority grew ${g.toFixed(1)}% over 5 years (to £${avg} as of ${hpi.latestMonth}) — ${direction} typical UK growth.`,
    source: SOURCE,
  };
}
