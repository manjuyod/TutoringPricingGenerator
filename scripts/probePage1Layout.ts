import { calculatePageImagePlacement, PAGE_ONE_BOTTOM_LIMIT_MM, PDF_PAGE_MM, PDF_PAGE_PX } from "../client/src/lib/pdfLayoutHelpers";

const scenarios = [
  { name: "letter-baseline", contentWidthPx: PDF_PAGE_PX.width, contentHeightPx: PDF_PAGE_PX.height },
  { name: "tall-content", contentWidthPx: PDF_PAGE_PX.width, contentHeightPx: 1240 },
];

for (const scenario of scenarios) {
  const placement = calculatePageImagePlacement(scenario);
  console.log(
    `${scenario.name}: captureHeight=${placement.captureHeightPx}px, imageWidth=${placement.imageWidthMm}mm, imageHeight=${placement.imageHeightMm}mm, xOffset=${placement.xOffsetMm}mm, pageHeight=${PDF_PAGE_MM.height}mm, bottomLimit=${PAGE_ONE_BOTTOM_LIMIT_MM}mm`,
  );
}
