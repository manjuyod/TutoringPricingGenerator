import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { PAGE_ONE_BOTTOM_LIMIT_MM, calculatePageImagePlacement } from "../client/src/lib/pdfLayoutHelpers";

assert.equal(PAGE_ONE_BOTTOM_LIMIT_MM, 270);

const fittedPlacement = calculatePageImagePlacement({
  contentHeightPx: 1200,
  contentWidthPx: 816,
});

assert.ok(fittedPlacement.imageHeightMm <= PAGE_ONE_BOTTOM_LIMIT_MM);
assert.ok(fittedPlacement.imageWidthMm < 215.9);
assert.ok(fittedPlacement.xOffsetMm > 0);

const naturalPlacement = calculatePageImagePlacement({
  contentHeightPx: 900,
  contentWidthPx: 816,
});

assert.equal(naturalPlacement.imageWidthMm, 215.9);
assert.equal(naturalPlacement.xOffsetMm, 0);

const generatorSource = fs.readFileSync(
  path.resolve("client/src/lib/htmlToPdfGenerator.ts"),
  "utf8",
);

assert.match(generatorSource, /contentElement\.scrollHeight/);
assert.match(generatorSource, /contentElement\.scrollWidth/);
assert.doesNotMatch(generatorSource, /height:\s*PDF_PAGE_PX\.height,/);

console.log("Page 1 auto-fit capture verified.");
