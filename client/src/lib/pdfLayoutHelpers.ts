export const PDF_PAGE_FORMAT = "letter" as const;
export const PDF_PAGE_MM = {
  width: 215.9,
  height: 279.4,
} as const;
export const PDF_PAGE_PX = {
  width: 816,
  height: 1056,
} as const;
export const PAGE_ONE_BOTTOM_LIMIT_MM = 270;
export const PAGE_TWO_BOTTOM_LIMIT_MM = 270;

interface PageImagePlacementInput {
  contentHeightPx: number;
  contentWidthPx: number;
}

interface PageImagePlacement {
  imageWidthMm: number;
  imageHeightMm: number;
  xOffsetMm: number;
  captureHeightPx: number;
}

export function calculatePageImagePlacement({
  contentHeightPx,
  contentWidthPx,
}: PageImagePlacementInput): PageImagePlacement {
  const captureHeightPx = Math.max(contentHeightPx, PDF_PAGE_PX.height);
  const naturalHeightMm = (captureHeightPx / contentWidthPx) * PDF_PAGE_MM.width;
  const maxHeightMm = captureHeightPx > PDF_PAGE_PX.height ? PAGE_ONE_BOTTOM_LIMIT_MM : PDF_PAGE_MM.height;
  const scale = Math.min(1, maxHeightMm / naturalHeightMm);
  const imageWidthMm = PDF_PAGE_MM.width * scale;
  const imageHeightMm = naturalHeightMm * scale;

  return {
    imageWidthMm: Number(imageWidthMm.toFixed(3)),
    imageHeightMm: Number(imageHeightMm.toFixed(3)),
    xOffsetMm: Number(((PDF_PAGE_MM.width - imageWidthMm) / 2).toFixed(3)),
    captureHeightPx,
  };
}
