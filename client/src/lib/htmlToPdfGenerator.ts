import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SubjectHours, calculateTotalHours, getSelectedSubjects, calculateTimeline, calculateMonthlyPaymentOptions, calculatePrepayOptions, calculateFinancingOptions, FinancingOption } from './pricingCalculations';
import { LOGO_B64 } from './generatedAssets';

interface PdfFormData {
  version: string;
  hourlyRate: number;
  weeklyHours: string;
  subjects: SubjectHours;
  packages: number[];
  prepayDiscounts: Record<string, number>;
  interestDiscounts: Record<string, number>;
}

// Define the MonthlyPaymentOption interface for clarity in generatePaymentPlanPage2
interface MonthlyPaymentOption {
  hoursPerWeek: number;
  monthlyCost: number;
  hourlyRate: number;
}

export async function generateAdvancedPricingPDF(formData: PdfFormData): Promise<void> {
  try {
    const { version, hourlyRate, weeklyHours, subjects, packages, prepayDiscounts, interestDiscounts } = formData;

    // Validate input data
    if (!version || !hourlyRate || !weeklyHours || !subjects) {
      throw new Error('Missing required form data');
    }

    // Calculate all the data we need
    const totalHours = calculateTotalHours(subjects);
    const selectedSubjects = getSelectedSubjects(subjects);
    const timeline = calculateTimeline(totalHours, weeklyHours);
    const monthlyOptions = calculateMonthlyPaymentOptions(hourlyRate, weeklyHours);

    if (totalHours === 0) {
      throw new Error('No subjects selected or total hours is zero');
    }

    if (!monthlyOptions || monthlyOptions.length === 0) {
      throw new Error('Failed to calculate monthly payment options');
    }

    const pdf = new jsPDF('p', 'mm', 'a4');

  // Page 1: Academic Game Plan (same for both versions)
  await generatePage1(pdf, selectedSubjects, totalHours, timeline);

  // Page 2: Payment Options (different based on version)
  pdf.addPage();
  if (version === "payment-plan") {
    await generatePaymentPlanPage2(pdf, monthlyOptions, totalHours, hourlyRate, prepayDiscounts, interestDiscounts);
  } else {
    const prepayOptions = calculatePrepayOptions(totalHours, hourlyRate, packages, prepayDiscounts);
    const financingOptions = calculateFinancingOptions(totalHours, hourlyRate, packages, interestDiscounts);
    await generatePage2(pdf, monthlyOptions, prepayOptions, financingOptions, totalHours);
  }

  // Save the PDF
  const filename = version === "payment-plan" ?
    'tutoring-club-payment-plan-pricing.pdf' :
    'tutoring-club-tiered-pricing.pdf';
  pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generatePage1(pdf: jsPDF, selectedSubjects: any[], totalHours: number, timeline: any[]) {
  // Create HTML content for page 1
  const htmlContent = `
    <div style="width: 794px; padding: 40px; font-family: 'Segoe UI', Arial, sans-serif; background: white; color: #000;">
      <!-- Header Section with Logo -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; padding: 20px 0; border-bottom: 3px solid #0063a8;">
        <div>
          <h1 style="font-size: 36px; font-weight: bold; color: #0063a8; margin: 0 0 8px 0;">Academic Game Plan</h1>
          <h2 style="font-size: 20px; color: #f26a31; margin: 0; font-weight: 600;">Personalized Learning Strategy</h2>
        </div>
        <div>
          <img src="${LOGO_B64}" alt="Tutoring Club Logo" style="height: 60px; width: auto;" crossOrigin="anonymous">
        </div>
      </div>

      <!-- Description -->
      <div style="margin-bottom: 30px; background: #f8fafc; border-left: 4px solid #0063a8; padding: 20px; border-radius: 8px;">
        <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0; font-style: italic;">
          At Tutoring Club, we believe every student has the potential to thrive—with the right support.
          Based on your academic goals and our in-depth assessment, we've put together a customized roadmap
          designed to close learning gaps, build confidence, and get results.
        </p>
      </div>

      <!-- Recommended Sessions with Total Hours -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 20px; font-weight: bold; color: #0063a8; margin: 0 0 21px 0; border-bottom: 3px solid #0063a8; padding-bottom: 8px;">Recommended Sessions by Subject</h3>
        <div style="display: flex; gap: 24px;">
          <!-- Subjects List -->
          <div style="flex: 1; padding: 20px;">
            ${selectedSubjects.map(({ name, hours }, index) => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; margin-bottom: ${index === selectedSubjects.length - 1 ? '0' : '8px'}; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #1f2937; font-size: 16px; font-weight: 500;">${name}</span>
                <span style="color: #0063a8; font-weight: bold; font-size: 20px;">${hours} hours</span>
              </div>
            `).join('')}
          </div>

          <!-- Total Hours -->
          <div style="flex: 0 0 240px; border: 3px solid #0063a8; border-radius: 12px; padding: 20px; text-align: center; display: flex; flex-direction: column; justify-content: center;">
            <div>
              <div style="font-size: 14px; margin-bottom: 6px; font-weight: 600; color: #0063a8;">Total Recommended Hours</div>
              <div style="font-size: 36px; font-weight: bold; margin-bottom: 4px; color: #f26a31;">${totalHours}</div>
              <div style="font-size: 16px; font-weight: 600; color: #f26a31;">hours</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline Line Chart -->
      <div>
        <h3 style="font-size: 20px; font-weight: bold; color: #0063a8; margin: 0 0 17px 0; border-bottom: 3px solid #0063a8; padding-bottom: 8px;">Recommended Timeline Options</h3>
        <div style="background: white; border-radius: 12px; padding: 16px; border: 2px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center;">
          <canvas id="timelineChart" width="700" height="280" style="width: 100%; max-width: 700px; height: 280px; display: block; margin: 0 auto;"></canvas>
          <div style="text-align: center; padding-top: 8px; border-top: 1px solid #e5e7eb; margin-top: 8px; width: 100%;">
            <span style="font-size: 10px; color: #6b7280; font-style: italic;">Choose the timeline that best fits your schedule and goals</span>
          </div>
        </div>
      </div>
    </div>
  `;

  await renderHtmlToPdf(pdf, htmlContent, timeline);
}

async function generatePage2(pdf: jsPDF, monthlyOptions: MonthlyPaymentOption[], prepayOptions: any[], financingOptions: {
  twelveMonth: FinancingOption[];
  eighteenMonth: FinancingOption[];
  twentyFourMonth: FinancingOption[];
}, totalHours: number) {
  // Add title with brand styling and Total Recommended Hours box inline
  pdf.setFontSize(30);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 99, 168); // Navy color
  pdf.text('Tuition Payment Options', 20, 20);

  // Total Recommended Hours box - positioned inline with title
  pdf.setLineWidth(0.5); // Thinner border like first page
  pdf.setDrawColor(0, 99, 168);
  drawRoundedRect(pdf, 155, 8, 40, 20, 3); // Rounded rectangle, no fill, narrower width

  pdf.setFontSize(7);
  pdf.setTextColor(0, 99, 168);
  pdf.text('Our Recommendation:', 175, 14, { align: 'center' });

  // Use totalHours from Academic Game Plan page
  pdf.setFontSize(14);
  pdf.setTextColor(242, 106, 49);
  pdf.text(`${totalHours} hours`, 175, 23, { align: 'center' });

  // Add subtitle
  pdf.setFontSize(10);
  pdf.setTextColor(242, 106, 49); // Orange color
  pdf.text('Flexible payment solutions designed for your budget', 20, 28);

  let yPosition = 40;

  // Section 1: Monthly Tuition Option (Blue theme)
  pdf.setFillColor(230, 244, 255); // Light blue background using brand blue
  pdf.rect(15, yPosition - 2, 180, 16, 'F');

  pdf.setFontSize(13);
  pdf.setTextColor(0, 99, 168); // Brand blue
  pdf.text('Monthly Tuition Option', 20, yPosition + 3);
  yPosition += 8;

  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Pay as you go monthly. Testing fee: $75. Materials fee: $100.', 20, yPosition);
  yPosition += 4;

  autoTable(pdf, {
    startY: yPosition,
    head: [['Hours/Week', 'Monthly Cost', 'Hourly Rate']],
    body: monthlyOptions.map(({ hoursPerWeek, monthlyCost, hourlyRate }) => [
      hoursPerWeek.toString(),
      `$${Math.round(monthlyCost)}`,
      `$${hourlyRate.toFixed(2)}`
    ]),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: [0, 99, 168], textColor: 255, halign: 'center' },
    margin: { left: 20, right: 20 }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 8;

  // Section 2: Prepay Tuition Option (Orange theme)
  pdf.setFillColor(255, 247, 235); // Light orange background using brand orange
  pdf.rect(15, yPosition - 2, 180, 16, 'F');

  pdf.setFontSize(13);
  pdf.setTextColor(242, 106, 49); // Brand orange
  pdf.text('Prepay Tuition Option', 20, yPosition + 3);
  yPosition += 8;

  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('No testing or materials fees. Flexible scheduling.', 20, yPosition);
  yPosition += 4;

  autoTable(pdf, {
    startY: yPosition,
    head: [['Hours', 'Adj. Rate', 'Total Cost', 'Discount', 'Savings']],
    body: prepayOptions.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, savings }) => [
      hours.toString(),
      `$${adjustedHourlyRate.toFixed(2)}`,
      `$${Math.round(totalCost)}`,
      `${discountPercent}%`,
      `$${Math.round(savings)}`
    ]),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: [242, 106, 49], textColor: 255, halign: 'center' }, // Brand orange header
    margin: { left: 20, right: 20 }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 8;

  // Section 3: 0% Interest Tuition Option (Yellow theme only)
  pdf.setFillColor(254, 252, 232); // Light yellow background using brand yellow
  pdf.rect(15, yPosition - 2, 180, 20, 'F');

  pdf.setFontSize(13);
  pdf.setTextColor(249, 197, 70); // Brand yellow
  pdf.text('0% Interest Tuition Option', 20, yPosition + 3);
  yPosition += 8;

  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('No testing/materials fees. Flexible scheduling. No payments 4-6 weeks. No down payment or out of pocket expense. On approved credit.', 20, yPosition);
  yPosition += 5;

  // 12 Month Plan
  pdf.setFontSize(9);
  pdf.setTextColor(249, 197, 70); // Brand yellow
  pdf.text('12 Month Plan', 20, yPosition);
  yPosition += 4;

  autoTable(pdf, {
    startY: yPosition,
    head: [['Hours', 'Adj. Rate', 'Total', 'Discount', 'Monthly', 'Savings']],
    body: financingOptions.twelveMonth.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }) => [
      hours.toString(),
      `$${adjustedHourlyRate.toFixed(2)}`,
      `$${Math.round(totalCost)}`,
      `${discountPercent}%`,
      `$${Math.round(monthlyCost)}`,
      `$${Math.round(savings)}`
    ]),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: [249, 197, 70], textColor: [0, 0, 0], halign: 'center' }, // Brand yellow header
    margin: { left: 20, right: 20 }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 6;

  // 18 Month Plan
  pdf.setFontSize(9);
  pdf.setTextColor(249, 197, 70); // Brand yellow
  pdf.text('18 Month Plan', 20, yPosition);
  yPosition += 4;

  autoTable(pdf, {
    startY: yPosition,
    head: [['Hours', 'Adj. Rate', 'Total', 'Discount', 'Monthly', 'Savings']],
    body: financingOptions.eighteenMonth.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }) => [
      hours.toString(),
      `$${adjustedHourlyRate.toFixed(2)}`,
      `$${Math.round(totalCost)}`,
      `${discountPercent}%`,
      `$${Math.round(monthlyCost)}`,
      `$${Math.round(savings)}`
    ]),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: [249, 197, 70], textColor: [0, 0, 0], halign: 'center' }, // Brand yellow header with black text for readability
    margin: { left: 20, right: 20 }
  });
}

async function generatePaymentPlanPage2(
  pdf: jsPDF,
  monthlyOptions: MonthlyPaymentOption[],
  totalHours: number,
  hourlyRate: number,
  prepayDiscounts: Record<string, number> = {},
  interestDiscounts: Record<string, number> = {}
): Promise<void> {
  // Add title with brand styling and Total Recommended Hours box inline
  pdf.setFontSize(30);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 99, 168); // Navy color
  pdf.text('Tuition Payment Options', 20, 20);

  // Total Recommended Hours box - positioned inline with title
  pdf.setLineWidth(0.5); // Thinner border like first page
  pdf.setDrawColor(0, 99, 168);
  drawRoundedRect(pdf, 155, 8, 40, 20, 3); // Rounded rectangle, no fill, narrower width

  pdf.setFontSize(7);
  pdf.setTextColor(0, 99, 168);
  pdf.text('Our Recommendation:', 175, 14, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setTextColor(242, 106, 49);
  pdf.text(`${totalHours} hours`, 175, 23, { align: 'center' });

  // Add subtitle
  pdf.setFontSize(10);
  pdf.setTextColor(242, 106, 49); // Orange color
  pdf.text('Simplified payment solutions for your convenience', 20, 28);

  let yPosition = 40;

  // Section 1: Monthly Tuition Option (Blue theme)
  pdf.setFillColor(230, 244, 255); // Light blue background using brand blue
  pdf.rect(15, yPosition - 2, 180, 16, 'F');

  pdf.setFontSize(13);
  pdf.setTextColor(0, 99, 168); // Brand blue
  pdf.text('Monthly Tuition Option', 20, yPosition + 3);
  yPosition += 8;

  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Pay as you go monthly. Testing fee: $75. Materials fee: $100.', 20, yPosition);
  yPosition += 4;

  autoTable(pdf, {
    startY: yPosition,
    head: [['Hours/Week', 'Monthly Cost', 'Hourly Rate']],
    body: monthlyOptions.map(({ hoursPerWeek, monthlyCost, hourlyRate }) => [
      hoursPerWeek.toString(),
      `$${Math.round(monthlyCost)}`,
      `$${hourlyRate.toFixed(2)}`
    ]),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: [0, 99, 168], textColor: 255, halign: 'center' },
    margin: { left: 20, right: 20 }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 8;

  // Section 2: Payment Plan Option (Yellow theme)
  pdf.setFillColor(254, 252, 232); // Light yellow background using brand yellow
  pdf.rect(15, yPosition - 2, 180, 16, 'F');

  pdf.setFontSize(13);
  pdf.setTextColor(249, 197, 70); // Brand yellow
  pdf.text('Payment Plan Option', 20, yPosition + 3);
  yPosition += 8;

  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('No testing/materials fees. Flexible scheduling. No payments 4-6 weeks. No down payment or out of pocket expense. On approved credit.', 20, yPosition);
  yPosition += 4;

  // Calculate payment plan totals
  const standardTotal = totalHours * hourlyRate;
  const interestDiscount = interestDiscounts.general || 5; // Use custom discount or default to 5%
  const discountedTotal = standardTotal * (1 - interestDiscount / 100);
  const adjustedHourlyRate = discountedTotal / totalHours;
  const savings = standardTotal - discountedTotal;

  // First chart - Prepay-style with fixed discount
  autoTable(pdf, {
    startY: yPosition,
    head: [['Hours', 'Adj. Rate', 'Total Cost', 'Discount', 'Savings']],
    body: [[
      totalHours.toString(),
      `$${adjustedHourlyRate.toFixed(2)}`,
      `$${Math.round(discountedTotal)}`,
      `${interestDiscount}%`,
      `$${Math.round(savings)}`
    ]],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: [249, 197, 70], textColor: [0, 0, 0], halign: 'center' },
    margin: { left: 20, right: 20 }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 6;

  // Second chart - Payment terms
  pdf.setFontSize(10);
  pdf.setTextColor(249, 197, 70);
  pdf.text('Payment Terms', 20, yPosition);
  yPosition += 4;

  // Calculate monthly payments for different terms
  const paymentTerms = [
    { months: 12, interest: '0%', monthly: discountedTotal / 12 },
    { months: 18, interest: '0%', monthly: discountedTotal / 18 },
    { months: 24, interest: '0%', monthly: discountedTotal / 24 },
    { months: 36, interest: '5.99 - 19.99%', monthlyLow: (discountedTotal * 1.0599) / 36, monthlyHigh: (discountedTotal * 1.1999) / 36 }, // 5.99% to 19.99% interest
    { months: 48, interest: '6.99 - 19.99%', monthlyLow: (discountedTotal * 1.0699) / 48, monthlyHigh: (discountedTotal * 1.1999) / 48 }, // 6.99% to 19.99% interest
  ];

  autoTable(pdf, {
    startY: yPosition,
    head: [['Months', 'Interest', 'Monthly']],
    body: paymentTerms.map(({ months, interest, monthly, monthlyLow, monthlyHigh }) => {
      let monthlyDisplay;
      if (monthlyLow !== undefined && monthlyHigh !== undefined) {
        monthlyDisplay = `$${Math.round(monthlyLow)} - $${Math.round(monthlyHigh)}`;
      } else {
        monthlyDisplay = `$${Math.round(monthly)}`;
      }
      return [
        months.toString(),
        interest,
        monthlyDisplay
      ];
    }),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: [249, 197, 70], textColor: [0, 0, 0], halign: 'center' },
    margin: { left: 20, right: 20 }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 8;

  // Section 3: Prepay Tuition Option (Orange theme) - Moved to bottom
  pdf.setFillColor(255, 247, 235); // Light orange background using brand orange
  pdf.rect(15, yPosition - 2, 180, 16, 'F');

  pdf.setFontSize(13);
  pdf.setTextColor(242, 106, 49); // Brand orange
  pdf.text('Prepay Tuition Option', 20, yPosition + 3);
  yPosition += 8;

  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('No testing or materials fees. Flexible scheduling.', 20, yPosition);
  yPosition += 4;

  // Calculate prepay totals with 20% discount
  const prepayStandardTotal = totalHours * hourlyRate;
  const prepayDiscount = prepayDiscounts.general || 20; // Use custom discount or default to 20%
  const prepayDiscountedTotal = prepayStandardTotal * (1 - prepayDiscount / 100);
  const prepayAdjustedHourlyRate = prepayDiscountedTotal / totalHours;
  const prepaySavings = prepayStandardTotal - prepayDiscountedTotal;


  autoTable(pdf, {
    startY: yPosition,
    head: [['Hours', 'Adj. Rate', 'Total Cost', 'Discount', 'Savings']],
    body: [[
      totalHours.toString(),
      `$${prepayAdjustedHourlyRate.toFixed(2)}`,
      `$${Math.round(prepayDiscountedTotal)}`,
      `${prepayDiscount}%`,
      `$${Math.round(prepaySavings)}`
    ]],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: [242, 106, 49], textColor: 255, halign: 'center' },
    margin: { left: 20, right: 20 }
  });
}

async function renderHtmlToPdf(pdf: jsPDF, htmlContent: string, timeline?: any[]): Promise<void> {
  // Create a temporary div to render the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  document.body.appendChild(tempDiv);

  try {
    // If this is page 1 and has timeline data, render the line chart
    if (timeline) {
      const canvas = tempDiv.querySelector('#timelineChart') as HTMLCanvasElement;
      if (canvas) {
        drawHorizontalBarChart(canvas, timeline);
      }
    }

    // Capture the HTML as canvas
    const canvasCapture = await html2canvas(tempDiv, {
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Convert canvas to image and add to PDF
    const imgData = canvasCapture.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = 297; // A4 height in mm

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  } finally {
    // Clean up the temporary div
    document.body.removeChild(tempDiv);
  }
}

function drawLineChart(canvas: HTMLCanvasElement, timeline: any[]): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Chart dimensions - balanced spacing for legend and Y-axis label
  const padding = 60;
  const leftPadding = 120; // Space for Y-axis label
  const rightPadding = 120; // Equal space for legend
  const chartWidth = canvas.width - leftPadding - rightPadding;
  const chartHeight = canvas.height - 2 * padding;

  // Find max months for scaling
  const maxMonths = Math.max(...timeline.map(t => t.months));

  // Draw axes
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Y-axis
  ctx.moveTo(leftPadding, padding);
  ctx.lineTo(leftPadding, padding + chartHeight);
  // X-axis
  ctx.moveTo(leftPadding, padding + chartHeight);
  ctx.lineTo(leftPadding + chartWidth, padding + chartHeight);
  ctx.stroke();

  // Draw axis labels
  ctx.fillStyle = '#374151';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Months', leftPadding + chartWidth / 2, canvas.height - 10);

  ctx.save();
  ctx.translate(30, padding + chartHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Cumulative Skill Mastery (%)', 0, 0);
  ctx.restore();

  // Draw grid lines and labels
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px Arial';

  // X-axis grid (months)
  for (let i = 0; i <= maxMonths; i += Math.ceil(maxMonths / 8)) {
    const x = leftPadding + (i / maxMonths) * chartWidth;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, padding + chartHeight);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillText(i.toString(), x, padding + chartHeight + 20);
  }

  // Y-axis grid (percentage)
  for (let i = 0; i <= 100; i += 20) {
    const y = padding + chartHeight - (i / 100) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(leftPadding, y);
    ctx.lineTo(leftPadding + chartWidth, y);
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.fillText(i + '%', leftPadding - 20, y + 5);
  }

  // Draw learning curves for each timeline option
  const colors = ['#f26a31', '#ff8c5a', '#ffab7d', '#ffcaa0'];

  timeline.forEach(({ hoursPerWeek, months }, index) => {
    ctx.strokeStyle = colors[index] || '#0063a8';
    ctx.lineWidth = 3;
    ctx.beginPath();

    // Start at origin
    ctx.moveTo(leftPadding, padding + chartHeight);

    // Draw learning curve (exponential approach to 100%)
    for (let month = 0; month <= months; month += 0.5) {
      const x = leftPadding + (month / maxMonths) * chartWidth;
      // Learning curve: faster initial learning, slowing as it approaches mastery
      const progress = Math.min(100, (month / months) * 100);
      const y = padding + chartHeight - (progress / 100) * chartHeight;
      ctx.lineTo(x, y);
    }

    ctx.stroke();

    // Add legend on the right side
    const legendX = leftPadding + chartWidth + 20;
    const legendY = padding + 30 + index * 25;
    ctx.fillStyle = colors[index] || '#f26a31';
    ctx.fillRect(legendX, legendY - 8, 15, 10);
    ctx.fillStyle = '#374151';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${hoursPerWeek} hrs/week`, legendX + 20, legendY);
  });
}

function drawHorizontalBarChart(canvas: HTMLCanvasElement, timeline: any[]): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Chart dimensions
  const padding = 60;
  const leftPadding = 120; // Space for Y-axis labels
  const rightPadding = 40;
  const bottomPadding = 60; // Space for X-axis labels
  const chartWidth = canvas.width - leftPadding - rightPadding;
  const chartHeight = canvas.height - padding - bottomPadding;

  // Calculate bar dimensions
  const barHeight = chartHeight / timeline.length * 0.7;
  const barSpacing = chartHeight / timeline.length * 0.3;
  const maxMonths = Math.max(...timeline.map(t => t.months));

  // Draw title
  ctx.fillStyle = '#374151';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Estimated Time to Achieve Academic Goals', canvas.width / 2, 30);

  // Colors for different bars - all orange variants from light to dark
  const colors = ['#ffcaa0', '#ffab7d', '#ff8c5a', '#f26a31'];

  // Draw axes
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;

  // Y-axis (left side)
  ctx.beginPath();
  ctx.moveTo(leftPadding, padding);
  ctx.lineTo(leftPadding, padding + chartHeight);
  ctx.stroke();

  // X-axis (bottom)
  ctx.beginPath();
  ctx.moveTo(leftPadding, padding + chartHeight);
  ctx.lineTo(leftPadding + chartWidth, padding + chartHeight);
  ctx.stroke();

  // Draw grid lines and X-axis labels (months)
  ctx.strokeStyle = '#f3f4f4f6';
  ctx.lineWidth = 0.5;

  ctx.fillStyle = '#6b7280';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';

  const monthStepSize = Math.ceil(maxMonths / 6);
  for (let i = 0; i <= maxMonths; i += monthStepSize) {
    const x = leftPadding + (i / maxMonths) * chartWidth;

    // Draw grid line
    if (i > 0) {
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }

    // Draw label
    ctx.fillText(i.toString(), x, padding + chartHeight + 20);
  }

  // Draw horizontal bars
  timeline.forEach(({ hoursPerWeek, months }, index) => {
    const barY = padding + (index * (barHeight + barSpacing)) + barSpacing / 2;
    const barWidth = (months / maxMonths) * chartWidth;

    // Draw bar
    ctx.fillStyle = colors[index] || '#f26a31';
    ctx.fillRect(leftPadding, barY, barWidth, barHeight);

    // Add border to bar
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(leftPadding, barY, barWidth, barHeight);

    // Add value label inside the bar
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    const textX = leftPadding + Math.max(barWidth / 2, 25);
    ctx.fillText(`${months} months`, textX, barY + barHeight / 2 + 5);

    // Add hours per week label on the left
    ctx.fillStyle = '#374151';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${hoursPerWeek}h/week`, leftPadding - 10, barY + barHeight / 2 + 5);
  });

  // Add axis labels
  ctx.fillStyle = '#374151';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Months', leftPadding + chartWidth / 2, canvas.height - 15);

  ctx.save();
  ctx.translate(25, padding + chartHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Hours per Week', 0, 0);
  ctx.restore();
}

// Helper function to draw rounded rectangle
function drawRoundedRect(pdf: jsPDF, x: number, y: number, width: number, height: number, radius: number) {
  pdf.roundedRect(x, y, width, height, radius, radius, 'S');
}
