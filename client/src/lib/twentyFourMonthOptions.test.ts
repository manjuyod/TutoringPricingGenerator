import test from "node:test";
import assert from "node:assert/strict";

import { selectTwentyFourMonthPlanOptions } from "./twentyFourMonthOptions";

const makeOption = (hours: number) => ({
  hours,
  adjustedHourlyRate: 0,
  totalCost: 0,
  discountPercent: 0,
  monthlyCost: 0,
  savings: 0,
});

test("keeps only eligible Package A rows for the 24-month table", () => {
  const result = selectTwentyFourMonthPlanOptions([
    makeOption(64),
    makeOption(96),
    makeOption(128),
    makeOption(192),
  ]);

  assert.deepEqual(result.map(({ hours }) => hours), [128, 192]);
});

test("keeps Package B rows in ascending order", () => {
  const result = selectTwentyFourMonthPlanOptions([
    makeOption(96),
    makeOption(128),
    makeOption(160),
    makeOption(192),
  ]);

  assert.deepEqual(result.map(({ hours }) => hours), [128, 160, 192]);
});

test("keeps the three most expensive eligible Package D rows", () => {
  const result = selectTwentyFourMonthPlanOptions([
    makeOption(128),
    makeOption(256),
    makeOption(320),
    makeOption(400),
  ]);

  assert.deepEqual(result.map(({ hours }) => hours), [256, 320, 400]);
});

test("sorts ascending after selecting the three most expensive eligible rows", () => {
  const result = selectTwentyFourMonthPlanOptions([
    makeOption(400),
    makeOption(128),
    makeOption(320),
    makeOption(256),
  ]);

  assert.deepEqual(result.map(({ hours }) => hours), [256, 320, 400]);
});
