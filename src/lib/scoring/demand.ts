import type { AreaStats } from "@/lib/data/areaStats";

export interface DemandResult {
  score: number | null;
  volumeTrendPct: number | null;
  privateRentedPct: number | null;
  reasoning: string;
  source: string;
  /** Always true — flagged in the UI so users know this is inferred */
  isProxy: true;
}

const SOURCE =
  "Proxy: HM Land Registry sales volumes + ONS Census 2021 tenure";

/**
 * Demand — a labelled proxy, not a direct measurement. Combines:
 *   - transaction-volume trend (latest 12m vs prior 12m of local sales):
 *     a liquid, active market scores higher
 *   - private-rented share of households from the census: a deeper rental
 *     market suggests steadier tenant demand
 *
 * Base 50, ±20 from volume trend, ±15 from rental share, clamped 15–90.
 * Requires at least one of the two inputs; null otherwise.
 */
export function scoreDemand(stats: AreaStats | null): DemandResult {
  const hpi = stats?.hpi ?? null;
  const tenure = stats?.tenure ?? null;

  const hasVolumes =
    hpi?.salesVolume12m != null &&
    hpi.salesVolumePrev12m != null &&
    hpi.salesVolumePrev12m > 0;
  const hasTenure = tenure != null;

  if (!hasVolumes && !hasTenure) {
    return {
      score: null,
      volumeTrendPct: null,
      privateRentedPct: null,
      reasoning:
        "Not enough market-activity or tenure data was available to estimate demand for this area.",
      source: SOURCE,
      isProxy: true,
    };
  }

  let score = 50;
  const parts: string[] = [];

  let volumeTrendPct: number | null = null;
  if (hasVolumes && hpi) {
    volumeTrendPct =
      Math.round(
        ((hpi.salesVolume12m! - hpi.salesVolumePrev12m!) /
          hpi.salesVolumePrev12m!) *
          1000,
      ) / 10;
    // ±20 points across a ∓40% swing in transaction volume
    score += Math.max(-20, Math.min(20, volumeTrendPct / 2));
    parts.push(
      `sales volumes ${volumeTrendPct >= 0 ? "up" : "down"} ${Math.abs(volumeTrendPct).toFixed(1)}% year-on-year`,
    );
  }

  let privateRentedPct: number | null = null;
  if (hasTenure && tenure) {
    privateRentedPct = tenure.privateRentedPct;
    // UK average private-rented share is ~20%; ±15 points across 5–35%
    score += Math.max(-15, Math.min(15, (privateRentedPct - 20) * 1.0));
    parts.push(
      `${privateRentedPct.toFixed(1)}% of local households privately rent (UK avg ~20%)`,
    );
  }

  score = Math.round(Math.max(15, Math.min(90, score)));

  return {
    score,
    volumeTrendPct,
    privateRentedPct,
    reasoning: `Proxy estimate from market activity: ${parts.join("; ")}. This infers demand from liquidity and rental depth, not from live applicant or void data.`,
    source: SOURCE,
    isProxy: true,
  };
}
