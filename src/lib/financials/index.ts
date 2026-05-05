import {
  SDLT_BTL_BANDS,
  DEFAULT_SURVEY_COST,
  DEFAULT_LEGAL_COST,
} from "@/lib/constants";

export interface FinancialsInput {
  pricePence: number;
  monthlyRentPence: number;
  depositPercent: number;
  mortgageRate: number; // annual %
  mortgageTermYears: number;
}

export interface FinancialsResult {
  /** basis points (740 = 7.40%) */
  grossYieldBps: number;
  netYieldBps: number;
  /** monthly P&I or interest-only payment, pence */
  monthlyMortgagePayment: number;
  /** monthly cash in - cash out, pence (can be negative) */
  monthlyCashflow: number;
  /** annual operating costs (excl mortgage), pence */
  annualOperatingCosts: number;
  /** stamp duty incl. BTL 3% surcharge, pence */
  stampDuty: number;
  /** total upfront cash needed, pence */
  totalAcquisitionCost: number;
  /** year-1 cash ROI in basis points */
  cashRoiBps: number;
}

export function calcStampDuty(pricePence: number): number {
  let remaining = pricePence;
  let lastUpper = 0;
  let total = 0;
  for (const band of SDLT_BTL_BANDS) {
    const upper = band.upTo ?? Infinity;
    const slice = Math.max(0, Math.min(remaining, upper - lastUpper));
    total += Math.round(slice * band.rate);
    remaining -= slice;
    lastUpper = upper;
    if (remaining <= 0) break;
  }
  return total;
}

export function calcMonthlyInterestOnly(
  loanPence: number,
  rateAnnualPercent: number,
): number {
  return Math.round((loanPence * (rateAnnualPercent / 100)) / 12);
}

export function calcAnnualOperatingCosts(
  pricePence: number,
  monthlyRentPence: number,
): number {
  const annualRent = monthlyRentPence * 12;
  const lettingFees = Math.round(annualRent * 0.1); // 10% letting agent
  const insurance = 30_000; // £300/yr
  const maintenance = Math.round(pricePence * 0.01); // 1% of price/yr
  const void1Month = monthlyRentPence;
  return lettingFees + insurance + maintenance + void1Month;
}

export function computeFinancials(input: FinancialsInput): FinancialsResult {
  const { pricePence, monthlyRentPence, depositPercent, mortgageRate } = input;
  const annualRent = monthlyRentPence * 12;

  const grossYieldBps = Math.round((annualRent / pricePence) * 10_000);

  const annualOpCosts = calcAnnualOperatingCosts(pricePence, monthlyRentPence);
  const netAnnualRent = annualRent - annualOpCosts;
  const netYieldBps = Math.round((netAnnualRent / pricePence) * 10_000);

  const loan = Math.round(pricePence * (1 - depositPercent / 100));
  const monthlyMortgage = calcMonthlyInterestOnly(loan, mortgageRate);

  const monthlyCashflow =
    monthlyRentPence - monthlyMortgage - Math.round(annualOpCosts / 12);

  const stampDuty = calcStampDuty(pricePence);
  const deposit = pricePence - loan;
  const totalAcquisitionCost =
    deposit + stampDuty + DEFAULT_SURVEY_COST + DEFAULT_LEGAL_COST;

  const cashRoiBps = totalAcquisitionCost
    ? Math.round((monthlyCashflow * 12 / totalAcquisitionCost) * 10_000)
    : 0;

  return {
    grossYieldBps,
    netYieldBps,
    monthlyMortgagePayment: monthlyMortgage,
    monthlyCashflow,
    annualOperatingCosts: annualOpCosts,
    stampDuty,
    totalAcquisitionCost,
    cashRoiBps,
  };
}
