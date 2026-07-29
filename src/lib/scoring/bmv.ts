import type { CompsStats } from "@/lib/data/areaStats";

export interface BmvResult {
  score: number | null;
  /** Positive = asking price below local sold median, percent */
  discountPct: number | null;
  compsMedianPounds: number | null;
  compsCount: number | null;
  reasoning: string;
  source: string;
}

const SOURCE = "HM Land Registry Price Paid Data";

/**
 * Below-market-value — asking price vs the median sold price for the same
 * property type in the postcode sector (falling back to the district) over
 * the last 18 months. Bedrooms aren't recorded in sold-price data, so this
 * is a type-level comparison, not a like-for-like valuation.
 *
 *   ≥ 15% below median → 85–95
 *   5–15% below        → 65–85
 *   within ±5%         → 45–65
 *   5–15% above        → 25–45
 *   > 15% above        → 15
 */
export function scoreBmv(
  askingPricePounds: number,
  comps: CompsStats | null,
): BmvResult {
  if (!comps || comps.count < 5 || comps.medianPricePounds <= 0) {
    return {
      score: null,
      discountPct: null,
      compsMedianPounds: comps?.medianPricePounds ?? null,
      compsCount: comps?.count ?? null,
      reasoning:
        "Too few recent sold transactions in this area to compare the asking price against.",
      source: SOURCE,
    };
  }

  const median = comps.medianPricePounds;
  const discount = ((median - askingPricePounds) / median) * 100;
  const d = Math.round(discount * 10) / 10;

  let score: number;
  if (d >= 15) score = Math.min(95, Math.round(85 + (d - 15) * 0.5));
  else if (d >= 5) score = Math.round(65 + ((d - 5) / 10) * 20);
  else if (d >= -5) score = Math.round(45 + ((d + 5) / 10) * 20);
  else if (d >= -15) score = Math.round(25 + ((d + 15) / 10) * 20);
  else score = 15;

  const scope = `${comps.count} ${comps.typeFiltered ? "same-type " : ""}sales in this postcode ${comps.level} over ${comps.windowMonths} months`;
  const rel =
    d >= 5
      ? `${d.toFixed(1)}% below`
      : d <= -5
        ? `${Math.abs(d).toFixed(1)}% above`
        : "in line with";
  return {
    score,
    discountPct: d,
    compsMedianPounds: median,
    compsCount: comps.count,
    reasoning: `Asking price is ${rel} the £${median.toLocaleString("en-GB")} median of ${scope}. Sold data doesn't record bedrooms or condition — verify with a valuation.`,
    source: SOURCE,
  };
}
