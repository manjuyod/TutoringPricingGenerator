import test from "node:test";
import assert from "node:assert/strict";

import { simulateTieredPage2Layout } from "./tieredPage2Layout";

test("package A still fits on tiered page 2 for the 2-8 workflow", () => {
  const result = simulateTieredPage2Layout({
    monthlyRows: 5,
    prepayRows: 4,
    twelveMonthRows: 4,
    eighteenMonthRows: 4,
    twentyFourMonthRows: 2,
  });

  assert.equal(result.pageCount, 1);
});

test("package B fits on tiered page 2 for the 2-8 workflow", () => {
  const result = simulateTieredPage2Layout({
    monthlyRows: 5,
    prepayRows: 4,
    twelveMonthRows: 4,
    eighteenMonthRows: 4,
    twentyFourMonthRows: 3,
  });

  assert.equal(result.pageCount, 1);
});
