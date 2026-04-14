import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { PDF_PAGE_FORMAT, PDF_PAGE_MM, PDF_PAGE_PX, PAGE_TWO_BOTTOM_LIMIT_MM } from "../client/src/lib/pdfLayoutHelpers";

assert.equal(PDF_PAGE_FORMAT, "letter");
assert.deepEqual(PDF_PAGE_MM, { width: 215.9, height: 279.4 });
assert.deepEqual(PDF_PAGE_PX, { width: 816, height: 1056 });
assert.equal(PAGE_TWO_BOTTOM_LIMIT_MM, 270);

const generatorSource = fs.readFileSync(
  path.resolve("client/src/lib/htmlToPdfGenerator.ts"),
  "utf8",
);

assert.match(generatorSource, /renderFinancingPlanTable\('12 Month Plan', financingOptions\.twelveMonth\);/);
assert.match(generatorSource, /renderFinancingPlanTable\('18 Month Plan', financingOptions\.eighteenMonth\);/);
assert.match(generatorSource, /renderFinancingPlanTable\(\s*'24 Month Plan',\s*selectTwentyFourMonthPlanOptions\(financingOptions\.twentyFourMonth\)\s*\);/s);
assert.doesNotMatch(generatorSource, /buildCombinedFinancingRows\(financingOptions\)/);

console.log("Letter PDF layout helpers verified.");
