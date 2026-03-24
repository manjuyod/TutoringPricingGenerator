/* global console */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

const configs = [
  {
    name: "current-side-by-side",
    type: "columns",
    monthlyFont: 9,
    monthlyPad: 2,
    financeFont: 7,
    financePad: 1.5,
    sectionGap: 5,
    bodyOffset: 4,
    planGap: 3,
  },
  {
    name: "stacked-compact",
    type: "stacked",
    monthlyFont: 9,
    monthlyPad: 2,
    financeFont: 8,
    financePad: 2,
    sectionGap: 5,
    bodyOffset: 3,
    planGap: 3,
  },
  {
    name: "stacked-tight",
    type: "stacked",
    monthlyFont: 8,
    monthlyPad: 1.5,
    financeFont: 7,
    financePad: 1.5,
    sectionGap: 4,
    bodyOffset: 2,
    planGap: 2,
  },
];

function renderBaseSections(pdf, config) {
  let y = 33;

  y += 8;
  y += config.bodyOffset;
  autoTable(pdf, {
    startY: y,
    head: [["Hours/Week", "Monthly Cost", "Hourly Rate"]],
    body: monthlyRows,
    theme: "grid",
    styles: { fontSize: config.monthlyFont, cellPadding: config.monthlyPad, halign: "center" },
    headStyles: { fillColor: [0, 99, 168], textColor: 255, halign: "center" },
    margin: { left: 20, right: 20 },
  });
  y = pdf.lastAutoTable.finalY + config.sectionGap;

  y += 8;
  y += config.bodyOffset;
  autoTable(pdf, {
    startY: y,
    head: [["Hours", "Adj. Rate", "Total Cost", "Discount", "Savings"]],
    body: prepayRows,
    theme: "grid",
    styles: { fontSize: config.monthlyFont, cellPadding: config.monthlyPad, halign: "center" },
    headStyles: { fillColor: [242, 106, 49], textColor: 255, halign: "center" },
    margin: { left: 20, right: 20 },
  });
  y = pdf.lastAutoTable.finalY + config.sectionGap;

  y += 7;
  y += config.bodyOffset;

  return y;
}

function runColumnLayout(config) {
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const y = renderBaseSections(pdf, config);
  const headers = [["Hrs", "Rate", "Total", "Disc", "Mo.", "Save"]];
  const styles = { fontSize: config.financeFont, cellPadding: config.financePad, halign: "center" };
  const headStyles = { fillColor: [249, 197, 70], textColor: [0, 0, 0], halign: "center" };

  autoTable(pdf, {
    startY: y,
    head: headers,
    body: financingRows.twelveMonth,
    theme: "grid",
    styles,
    headStyles,
    margin: { left: 15, right: 137 },
  });
  const finalY12 = pdf.lastAutoTable.finalY;

  autoTable(pdf, {
    startY: y,
    head: headers,
    body: financingRows.eighteenMonth,
    theme: "grid",
    styles,
    headStyles,
    margin: { left: 77, right: 75 },
  });
  const finalY18 = pdf.lastAutoTable.finalY;

  autoTable(pdf, {
    startY: y,
    head: headers,
    body: financingRows.twentyFourMonth,
    theme: "grid",
    styles,
    headStyles,
    margin: { left: 139, right: 15 },
  });
  const finalY24 = pdf.lastAutoTable.finalY;

  return {
    name: config.name,
    pages: pdf.getNumberOfPages(),
    finalY: Number(Math.max(finalY12, finalY18, finalY24).toFixed(2)),
  };
}

function runStackedLayout(config) {
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  let y = renderBaseSections(pdf, config);
  const headers = [["Hours", "Adj. Rate", "Total", "Disc", "Monthly", "Save"]];

  for (const rows of Object.values(financingRows)) {
    y += 3;
    autoTable(pdf, {
      startY: y,
      head: headers,
      body: rows,
      theme: "grid",
      styles: { fontSize: config.financeFont, cellPadding: config.financePad, halign: "center" },
      headStyles: { fillColor: [249, 197, 70], textColor: [0, 0, 0], halign: "center" },
      margin: { left: 20, right: 20 },
    });
    y = pdf.lastAutoTable.finalY + config.planGap;
  }

  return {
    name: config.name,
    pages: pdf.getNumberOfPages(),
    finalY: Number(y.toFixed(2)),
  };
}

for (const config of configs) {
  const result = config.type === "columns" ? runColumnLayout(config) : runStackedLayout(config);
  console.log(`${result.name}: ${result.pages} page(s), finalY=${result.finalY}mm`);
}
