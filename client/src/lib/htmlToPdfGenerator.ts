
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
      <!-- Header Section -->
      <div style="margin-bottom: 30px;">
        <h1 style="font-size: 32px; font-weight: bold; color: #0063a8; margin: 0 0 8px 0;">Academic Game Plan</h1>
        <h2 style="font-size: 18px; color: #f26a31; margin: 0 0 20px 0;">Tutoring Club</h2>
      </div>

      <!-- Description -->
      <div style="margin-bottom: 30px;">
        <p style="font-size: 14px; line-height: 1.6; color: #1f2937; margin: 0;">
          At Tutoring Club, we believe every student has the potential to thrive—with the right support. 
          Based on your academic goals and our in-depth assessment, we've put together a customized roadmap 
          designed to close learning gaps, build confidence, and get results.
        </p>
      </div>

      <!-- Recommended Sessions -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 20px; font-weight: bold; color: #111827; margin: 0 0 16px 0;">Recommended Sessions by Subject</h3>
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px;">
          ${selectedSubjects.map(({ name, hours }) => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #374151; font-size: 14px;">${name}</span>
              <span style="color: #0063a8; font-weight: bold; font-size: 14px;">${hours} hours</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Total Hours -->
      <div style="background: #e8f4fd; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: bold; color: #374151;">Total Recommended Hours:</span>
          <span style="font-size: 20px; font-weight: bold; color: #0063a8;">${totalHours} hours</span>
        </div>
      </div>

      <!-- Timeline -->
      <div>
        <h3 style="font-size: 20px; font-weight: bold; color: #111827; margin: 0 0 16px 0;">Recommended Timeline</h3>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          ${timeline.map(({ hoursPerWeek, months }) => `
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; min-width: 120px;">
              <div style="font-size: 24px; font-weight: bold; color: #0063a8;">${hoursPerWeek}</div>
              <div style="font-size: 12px; color: #6b7280; margin: 4px 0;">hours/week</div>
              <div style="font-size: 14px; font-weight: bold; color: #374151;">${months} months</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  await renderHtmlToPdf(pdf, htmlContent);
}

async function generatePage2(pdf: jsPDF, monthlyOptions: any[], prepayOptions: any[], financingOptions: any) {
  // Add title
  pdf.setFontSize(24);
  pdf.setTextColor(0, 99, 168);
  pdf.text('Tuition Payment Options', 20, 30);

  let yPosition = 50;

  // Monthly Tuition Option
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Monthly Tuition Option', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(11);
  pdf.text('Pay as you go on a monthly basis at our standard hourly rate.', 20, yPosition);
  yPosition += 5;
  pdf.text('Testing fee: $75. Registration fee: $100.', 20, yPosition);
  yPosition += 15;

  // Monthly options table
  autoTable(pdf, {
    startY: yPosition,
    head: [['Hours/Week', 'Monthly Cost', 'Hourly Rate']],
    body: monthlyOptions.map(({ hoursPerWeek, monthlyCost, hourlyRate }) => [
      hoursPerWeek.toString(),
      `$${monthlyCost.toFixed(2)}`,
      `$${hourlyRate.toFixed(2)}`
    ]),
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [0, 99, 168], textColor: 255 },
    margin: { left: 20, right: 20 }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 20;

  // Prepay Tuition Option
  pdf.setFontSize(16);
  pdf.text('Prepay Tuition Option', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(11);
  pdf.text('No testing or registration fees. Flexible scheduling.', 20, yPosition);
  yPosition += 15;

  // Prepay options table
  autoTable(pdf, {
    startY: yPosition,
    head: [['Hours', 'Adj. Rate', 'Total Cost', 'Discount', 'Savings']],
    body: prepayOptions.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, savings }) => [
      hours.toString(),
      `$${adjustedHourlyRate.toFixed(2)}`,
      `$${totalCost.toFixed(2)}`,
      `${discountPercent}%`,
      `$${savings.toFixed(2)}`
    ]),
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [0, 99, 168], textColor: 255 },
    margin: { left: 20, right: 20 }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 20;

  // 0% Interest Tuition Option
  pdf.setFontSize(16);
  pdf.text('0% Interest Tuition Option', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(11);
  const interestText = 'No testing or registration fees. Flexible scheduling. No payments for 4-6 weeks.';
  const splitText = pdf.splitTextToSize(interestText, 170);
  pdf.text(splitText, 20, yPosition);
  yPosition += splitText.length * 5 + 10;

  pdf.text('No out-of-pocket expenses or down payments. Early prepayment allowed. On approved credit.', 20, yPosition);
  yPosition += 15;

  // 12 Month Plan
  pdf.setFontSize(14);
  pdf.text('12 Month Plan', 20, yPosition);
  yPosition += 10;

  autoTable(pdf, {
    startY: yPosition,
    head: [['Hours', 'Adj. Rate', 'Total', 'Discount', 'Monthly', 'Savings']],
    body: financingOptions.twelveMonth.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }) => [
      hours.toString(),
      `$${adjustedHourlyRate.toFixed(2)}`,
      `$${totalCost.toFixed(2)}`,
      `${discountPercent}%`,
      `$${monthlyCost.toFixed(2)}`,
      `$${savings.toFixed(2)}`
    ]),
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [0, 99, 168], textColor: 255 },
    margin: { left: 20, right: 20 }
  });
}

async function renderHtmlToPdf(pdf: jsPDF, htmlContent: string): Promise<void> {
  // Create a temporary div to render the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  document.body.appendChild(tempDiv);

  try {
    // Capture the HTML as canvas
    const canvas = await html2canvas(tempDiv, {
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Convert canvas to image and add to PDF
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = 297; // A4 height in mm
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  } finally {
    // Clean up the temporary div
    document.body.removeChild(tempDiv);
  }
}
