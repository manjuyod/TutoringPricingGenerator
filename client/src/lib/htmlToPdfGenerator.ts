import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SubjectHours, calculateTotalHours, getSelectedSubjects, calculateTimeline, calculateMonthlyPaymentOptions, calculatePrepayOptions, calculateFinancingOptions } from './pricingCalculations';

interface PdfFormData {
  hourlyRate: number;
  weeklyHours: string;
  subjects: SubjectHours;
  packages: number[];
  prepayDiscounts: Record<string, number>;
  interestDiscounts: Record<string, number>;
}

export async function generateAdvancedPricingPDF(formData: PdfFormData): Promise<void> {
  const { hourlyRate, weeklyHours, subjects, packages, prepayDiscounts, interestDiscounts } = formData;

  // Calculate all the data we need
  const totalHours = calculateTotalHours(subjects);
  const selectedSubjects = getSelectedSubjects(subjects);
  const timeline = calculateTimeline(totalHours, weeklyHours);
  const monthlyOptions = calculateMonthlyPaymentOptions(hourlyRate, weeklyHours);
  const prepayOptions = calculatePrepayOptions(totalHours, hourlyRate, packages, prepayDiscounts);
  const financingOptions = calculateFinancingOptions(totalHours, hourlyRate, packages, interestDiscounts);

  const pdf = new jsPDF('p', 'mm', 'a4');

  // Page 1: Academic Game Plan
  await generatePage1(pdf, selectedSubjects, totalHours, timeline);

  // Page 2: Payment Options
  pdf.addPage();
  await generatePage2(pdf, monthlyOptions, prepayOptions, financingOptions);

  // Save the PDF
  pdf.save('tutoring-club-academic-gameplan.pdf');
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

async function generatePage2(pdf: jsPDF, monthlyOptions: any[], prepayOptions: any[], financingOptions: any) {
  // Add title with brand styling
    pdf.setFontSize(30);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 99, 168); // Navy color
    pdf.text('Tuition Payment Options', 20, 20);

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

  yPosition = (pdf as any).lastAutoTable.finalY + 14;

  // Section 2: Prepay Tuition Option (Orange theme)
  pdf.setFillColor(255, 247, 235); // Light orange background using brand orange
  pdf.rect(15, yPosition - 2, 180, 16, 'F');

  pdf.setFontSize(13);
  pdf.setTextColor(242, 106, 49); // Brand orange
  pdf.text('Prepay Tuition Option', 20, yPosition + 3);
  yPosition += 8;

  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('No testing or registration fees. Flexible scheduling.', 20, yPosition);
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

  yPosition = (pdf as any).lastAutoTable.finalY + 14;

  // Section 3: 0% Interest Tuition Option (Yellow theme only)
  pdf.setFillColor(254, 252, 232); // Light yellow background using brand yellow
  pdf.rect(15, yPosition - 2, 180, 20, 'F');

  pdf.setFontSize(13);
  pdf.setTextColor(249, 197, 70); // Brand yellow
  pdf.text('0% Interest Tuition Option', 20, yPosition + 3);
  yPosition += 8;

  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('No testing/registration fees. Flexible scheduling. No payments 4-6 weeks. No down payment or out of pocket expense. On approved credit.', 20, yPosition);
  yPosition += 6;

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

  yPosition = (pdf as any).lastAutoTable.finalY + 10;

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
        drawLineChart(canvas, timeline);
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