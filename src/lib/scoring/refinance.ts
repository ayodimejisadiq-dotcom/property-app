/**
 * Refinance potential — equity unlocked at year 5 vs original deposit.
 *
 * Pure math. We assume:
 *   - Annual price growth = 3% (conservative UK long-run avg)
 *   - Refinance LTV = 75% (standard BTL remortgage)
 *
 * Score reflects how many multiples of the original deposit a year-5
 * refinance could free up. >2x is exceptional, ~1x is healthy, <0.5x is
 * a sign the deal needs heavy capital growth or BMV to make sense.
 */

const ANNUAL_GROWTH = 0.03;
const REFINANCE_LTV = 0.75;
const PROJECTION_YEARS = 5;

export interface RefinanceInputs {
  pricePence: number;
  depositPercent: number;
}

export interface RefinanceResult {
  score: number;
  /** equity unlocked at year 5 as a multiple of the original deposit */
  equityMultiple: number;
  /** projected property value at year 5, pence */
  projectedValuePence: number;
  /** equity available at 75% LTV refinance, pence */
  unlockablePence: number;
  reasoning: string;
}

export function scoreRefinance(input: RefinanceInputs): RefinanceResult {
  const { pricePence, depositPercent } = input;
  const deposit = Math.round(pricePence * (depositPercent / 100));
  const originalLoan = pricePence - deposit;

  const projectedValue = Math.round(
    pricePence * Math.pow(1 + ANNUAL_GROWTH, PROJECTION_YEARS),
  );
  const newLoan = Math.round(projectedValue * REFINANCE_LTV);
  const unlockable = Math.max(0, newLoan - originalLoan);

  const equityMultiple = deposit > 0 ? unlockable / deposit : 0;

  const score = scoreFromMultiple(equityMultiple);

  return {
    score,
    equityMultiple,
    projectedValuePence: projectedValue,
    unlockablePence: unlockable,
    reasoning: reasoningFor(equityMultiple),
  };
}

function scoreFromMultiple(m: number): number {
  // 0x → 20, 0.5x → 50, 1x → 70, 1.5x → 85, 2x+ → 95
  if (m >= 2) return 95;
  if (m >= 1.5) return Math.round(85 + (m - 1.5) * 20);
  if (m >= 1) return Math.round(70 + (m - 1) * 30);
  if (m >= 0.5) return Math.round(50 + (m - 0.5) * 40);
  if (m > 0) return Math.round(20 + m * 60);
  return 20;
}

function reasoningFor(m: number): string {
  const pct = Math.round(m * 100);
  if (m >= 1) {
    return `A year-5 refinance could unlock around ${pct}% of the original deposit at 75% LTV (assuming 3%/yr growth).`;
  }
  if (m >= 0.5) {
    return `Refinance at year 5 could unlock about ${pct}% of the original deposit — useful but not transformative.`;
  }
  return `Modest projected equity gain (${pct}% of deposit by year 5). The deal leans on cashflow rather than refinance.`;
}
