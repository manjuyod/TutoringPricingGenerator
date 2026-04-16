import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { PAGE_TWO_BOTTOM_LIMIT_MM, PDF_PAGE_FORMAT, PDF_PAGE_MM } from "./pdfLayoutHelpers";

export const TIERED_PAGE2_BODY_CELL_PADDING = 1.75;
export const TIERED_MONTHLY_PREPAY_FONT_SIZE = 9;
export const TIERED_FINANCING_FONT_SIZE = 8;

export const TIERED_MONTHLY_PREPAY_TABLE_STYLES = {
  fontSize: TIERED_MONTHLY_PREPAY_FONT_SIZE,
  cellPadding: TIERED_PAGE2_BODY_CELL_PADDING,
  halign: "center" as const,
};

export const TIERED_FINANCING_TABLE_STYLES = {
  fontSize: TIERED_FINANCING_FONT_SIZE,
  cellPadding: TIERED_PAGE2_BODY_CELL_PADDING,
  halign: "center" as const,
};

interface TieredPage2LayoutScenario {
  monthlyRows: number;
  prepayRows: number;
  twelveMonthRows: number;
  eighteenMonthRows: number;
  twentyFourMonthRows: number;
}

export function simulateTieredPage2Layout({
  monthlyRows,
  prepayRows,
  twelveMonthRows,
  eighteenMonthRows,
  twentyFourMonthRows,
}: TieredPage2LayoutScenario) {
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: PDF_PAGE_FORMAT });
  const pageTwoBottomMargin = PDF_PAGE_MM.height - PAGE_TWO_BOTTOM_LIMIT_MM;

  let yPosition = 33;

  yPosition += 8;
  yPosition += 3;

  autoTable(pdf, {
    startY: yPosition,
    head: [["Hours/Week", "Monthly Cost", "Hourly Rate"]],
    body: Array.from({ length: monthlyRows }, () => ["2", "$400", "$50.00"]),
    theme: "grid",
    styles: TIERED_MONTHLY_PREPAY_TABLE_STYLES,
    headStyles: { fillColor: [0, 99, 168], textColor: 255, halign: "center" },
    margin: { left: 20, right: 20, bottom: pageTwoBottomMargin },
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 4;
  yPosition += 8;
  yPosition += 3;

  autoTable(pdf, {
    startY: yPosition,
    head: [["Hours", "Adj. Rate", "Total Cost", "Discount", "Savings"]],
    body: Array.from({ length: prepayRows }, () => ["96", "$42.50", "$4080", "15%", "$720"]),
    theme: "grid",
    styles: TIERED_MONTHLY_PREPAY_TABLE_STYLES,
    headStyles: { fillColor: [242, 106, 49], textColor: 255, halign: "center" },
    margin: { left: 20, right: 20, bottom: pageTwoBottomMargin },
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 4;
  yPosition += 7;
  yPosition += 3;

  for (const rowCount of [twelveMonthRows, eighteenMonthRows, twentyFourMonthRows]) {
    yPosition += 2.5;
    yPosition += 2;

    autoTable(pdf, {
      startY: yPosition,
      head: [["Hours", "Adj. Rate", "Total", "Discount", "Monthly", "Savings"]],
      body: Array.from({ length: rowCount }, () => ["96", "$45.00", "$4320", "10%", "$360", "$480"]),
      theme: "grid",
      styles: TIERED_FINANCING_TABLE_STYLES,
      headStyles: { fillColor: [249, 197, 70], textColor: [0, 0, 0], halign: "center" },
      margin: { left: 20, right: 20, bottom: pageTwoBottomMargin },
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 2;
  }

  return {
    pageCount: pdf.getNumberOfPages(),
    finalY: Number(yPosition.toFixed(2)),
  };
}
