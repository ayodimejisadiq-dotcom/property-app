export const CURRENT_DISCLAIMER_VERSION = "1.0";

// UK Stamp Duty Land Tax bands for additional dwellings (BTL).
// Source: https://www.gov.uk/stamp-duty-land-tax/residential-property-rates
// Verify before each tax-year change.
export const SDLT_BTL_BANDS: ReadonlyArray<{
  upTo: number | null; // pence; null = no upper bound
  rate: number; // 0.05 = 5%
}> = [
  { upTo: 25_000_000, rate: 0.05 }, // 0 – £250k
  { upTo: 92_500_000, rate: 0.10 }, // £250k – £925k
  { upTo: 150_000_000, rate: 0.15 }, // £925k – £1.5m
  { upTo: null, rate: 0.17 }, // £1.5m+
];

export const DEFAULT_SURVEY_COST = 60_000; // £600 in pence
export const DEFAULT_LEGAL_COST = 150_000; // £1,500 in pence

export const FREE_TIER_MONTHLY_DEALS = 5;
