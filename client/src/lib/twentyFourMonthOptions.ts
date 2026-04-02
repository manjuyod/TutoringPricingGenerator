import type { FinancingOption } from "./pricingCalculations";

export function selectTwentyFourMonthPlanOptions(
  options: FinancingOption[],
): FinancingOption[] {
  return [...options]
    .filter(({ hours }) => hours >= 128)
    .sort((left, right) => right.hours - left.hours)
    .slice(0, 3)
    .sort((left, right) => left.hours - right.hours);
}
