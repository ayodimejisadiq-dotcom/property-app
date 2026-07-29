import type { CensusTenure } from "@/lib/data/census";

export interface TenantProfileResult {
  score: number | null;
  privateRentedPct: number | null;
  socialRentedPct: number | null;
  ownedPct: number | null;
  reasoning: string;
  source: string;
}

const SOURCE = "ONS Census 2021, table TS054 (tenure)";

/**
 * Tenant profile — depth and stability of the local rental market from
 * census tenure mix. Score is driven by the private-rented share (a deep
 * rental market means easier letting and re-letting), moderated down when
 * the area is dominated by social housing (different tenant pool, higher
 * management overhead for a standard BTL).
 *
 * Private-rented share:
 *   ≥ 30%  → 80–90
 *   20–30% → 65–80
 *   12–20% → 50–65
 *   6–12%  → 38–50
 *   < 6%   → 30
 * Then −10 if social-rented > 40%, −5 if 30–40%.
 */
export function scoreTenantProfile(
  tenure: CensusTenure | null,
): TenantProfileResult {
  if (!tenure) {
    return {
      score: null,
      privateRentedPct: null,
      socialRentedPct: null,
      ownedPct: null,
      reasoning:
        "Census tenure data wasn't available for this area (it covers England & Wales local authorities), so the tenant profile couldn't be scored.",
      source: SOURCE,
    };
  }

  const p = tenure.privateRentedPct;
  let score: number;
  if (p >= 30) score = Math.min(90, Math.round(80 + (p - 30) * 0.5));
  else if (p >= 20) score = Math.round(65 + ((p - 20) / 10) * 15);
  else if (p >= 12) score = Math.round(50 + ((p - 12) / 8) * 15);
  else if (p >= 6) score = Math.round(38 + ((p - 6) / 6) * 12);
  else score = 30;

  const notes: string[] = [
    `${p.toFixed(1)}% of households privately rent`,
    `${tenure.ownedPct.toFixed(1)}% own`,
    `${tenure.socialRentedPct.toFixed(1)}% social housing`,
  ];
  if (tenure.socialRentedPct > 40) score -= 10;
  else if (tenure.socialRentedPct > 30) score -= 5;
  score = Math.max(20, score);

  const depth =
    p >= 20
      ? "a deep local rental market"
      : p >= 12
        ? "a moderate local rental market"
        : "a mostly owner-occupied area";
  return {
    score,
    privateRentedPct: p,
    socialRentedPct: tenure.socialRentedPct,
    ownedPct: tenure.ownedPct,
    reasoning: `Census tenure shows ${depth}: ${notes.join(", ")}. Figures are local-authority level, not street level.`,
    source: SOURCE,
  };
}
