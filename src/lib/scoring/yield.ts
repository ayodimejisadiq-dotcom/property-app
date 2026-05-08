/**
 * Yield score — UK BTL benchmarks, linear interpolation between bands.
 *
 *   ≥ 8%  → 95
 *   7–8%  → 80–95 (interpolated)
 *   6–7%  → 65–80
 *   5–6%  → 50–65
 *   4–5%  → 35–50
 *   < 4%  → 20–35 (interpolated down to 0% = 20 floor)
 */
export function scoreYield(grossYieldPercent: number): number {
  const y = grossYieldPercent;
  if (y >= 8) return 95;
  if (y >= 7) return Math.round(80 + (y - 7) * 15);
  if (y >= 6) return Math.round(65 + (y - 6) * 15);
  if (y >= 5) return Math.round(50 + (y - 5) * 15);
  if (y >= 4) return Math.round(35 + (y - 4) * 15);
  if (y > 0) return Math.round(20 + (y / 4) * 15);
  return 20;
}

export function reasoningYield(grossYieldPercent: number): string {
  const y = grossYieldPercent.toFixed(1);
  if (grossYieldPercent >= 7) {
    return `Gross yield of ${y}% is above the UK BTL benchmark.`;
  }
  if (grossYieldPercent >= 5) {
    return `Gross yield of ${y}% is around the UK BTL average.`;
  }
  return `Gross yield of ${y}% is below the UK BTL average; cashflow may be tight.`;
}
