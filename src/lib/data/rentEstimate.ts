// Crude regional rent estimates, used only to pre-fill the rent field when
// a sale listing (which never shows rent) is scraped. Always surfaced to
// the user as an estimate to review — never presented as market data.
//
// Figures are rounded approximations of ONS Private Rental Market
// Statistics (mean monthly rent by region and bedroom count, 2025).
// Review yearly.

const RENT_BY_REGION: Record<string, [number, number, number, number]> = {
  // England regions (postcodes.io `region`)          1bed  2bed  3bed  4+bed
  London: [1450, 1750, 2100, 2800],
  "South East": [950, 1200, 1450, 2000],
  "East of England": [850, 1050, 1250, 1700],
  "South West": [800, 1000, 1200, 1600],
  "West Midlands": [725, 875, 1050, 1400],
  "East Midlands": [675, 825, 975, 1300],
  "North West": [700, 850, 1000, 1300],
  "Yorkshire and The Humber": [650, 800, 950, 1250],
  "North East": [550, 675, 800, 1050],
  // Countries (postcodes.io `country`, when region is null)
  Wales: [650, 800, 950, 1250],
  Scotland: [750, 950, 1150, 1500],
  "Northern Ireland": [650, 775, 900, 1150],
};

const FALLBACK: [number, number, number, number] = [750, 925, 1100, 1450]; // GB-ish average

/**
 * Rough monthly rent for a region + bedroom count, in whole pounds.
 * `region` should be the postcodes.io region (England) or country name.
 */
export function estimateMonthlyRent(
  region: string | null,
  bedrooms: number,
): number {
  const table = (region && RENT_BY_REGION[region]) || FALLBACK;
  const idx = Math.min(Math.max(Math.round(bedrooms), 1), 4) - 1;
  return table[idx];
}
