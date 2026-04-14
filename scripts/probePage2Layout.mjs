/* global console */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const LETTER_PAGE_MM = { width: 215.9, height: 279.4 };
const PAGE_TWO_BOTTOM_LIMIT_MM = 270;
const BOTTOM_MARGIN = LETTER_PAGE_MM.height - PAGE_TWO_BOTTOM_LIMIT_MM;

const monthlyRows = [
  ["2", "$400", "$50.00"],
  ["4", "$800", "$50.00"],
  ["6", "$1200", "$50.00"],
  ["8", "$1600", "$50.00"],
];

const prepayRows = [
  ["96", "$42.50", "$4080", "15%", "$720"],
  ["128", "$40.00", "$5120", "20%", "$1280"],
  ["160", "$37.50", "$6000", "25%", "$2000"],
  ["192", "$35.00", "$6720", "30%", "$2880"],
];

const financingRows = {
  twelveMonth: [
    ["96", "$45.00", "$4320", "10%", "$360", "$480"],
    ["128", "$42.50", "$5440", "15%", "$453", "$960"],
    ["160", "$40.00", "$6400", "20%", "$533", "$1600"],
    ["192", "$37.50", "$7200", "25%", "$600", "$2400"],
  ],
  eighteenMonth: [
    ["96", "$47.50", "$4560", "5%", "$253", "$240"],
    ["128", "$45.00", "$5760", "10%", "$320", "$640"],
    ["160", "$42.50", "$6800", "15%", "$378", "$1200"],
    ["192", "$40.00", "$7680", "20%", "$427", "$1920"],
  ],
  twentyFourMonth: [
    ["128", "$47.50", "$6080", "5%", "$253", "$320"],
    ["160", "$45.00", "$7200", "10%", "$300", "$800"],
    ["192", "$42.50", "$8160", "15%", "$340", "$1440"],
  ],
};

const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "letter" });
let y = 33;

y += 8;
y += 3;
autoTable(pdf, {
  startY: y,
  head: [["Hours/Week", "Monthly Cost", "Hourly Rate"]],
  body: monthlyRows,
  theme: "grid",
  styles: { fontSize: 9, cellPadding: 2, halign: "center" },
  headStyles: { fillColor: [0, 99, 168], textColor: 255, halign: "center" },
  margin: { left: 20, right: 20, bottom: BOTTOM_MARGIN },
});
y = pdf.lastAutoTable.finalY + 4;

y += 8;
y += 3;
autoTable(pdf, {
  startY: y,
  head: [["Hours", "Adj. Rate", "Total Cost", "Discount", "Savings"]],
  body: prepayRows,
  theme: "grid",
  styles: { fontSize: 9, cellPadding: 2, halign: "center" },
  headStyles: { fillColor: [242, 106, 49], textColor: 255, halign: "center" },
  margin: { left: 20, right: 20, bottom: BOTTOM_MARGIN },
});
y = pdf.lastAutoTable.finalY + 4;

y += 7;
y += 3;

for (const rows of Object.values(financingRows)) {
  y += 2.5;
  autoTable(pdf, {
    startY: y,
    head: [["Hours", "Adj. Rate", "Total", "Discount", "Monthly", "Savings"]],
    body: rows,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2, halign: "center" },
    headStyles: { fillColor: [249, 197, 70], textColor: [0, 0, 0], halign: "center" },
    margin: { left: 20, right: 20, bottom: BOTTOM_MARGIN },
  });
  y = pdf.lastAutoTable.finalY + 2;
}

console.log(`letter-three-tables: ${pdf.getNumberOfPages()} page(s), finalY=${Number(y.toFixed(2))}mm`);
console.log(`bottom-limit=${PAGE_TWO_BOTTOM_LIMIT_MM}mm`);
