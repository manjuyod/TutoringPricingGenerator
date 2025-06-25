
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
          <img src="data:image/png;base64,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" alt="Tutoring Club Logo" style="height: 60px; width: auto;">
        </div>
      </div>

      <!-- Description -->
      <div style="margin-bottom: 40px; background: #f8fafc; border-left: 4px solid #f26a31; padding: 24px; border-radius: 8px;">
        <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0; font-style: italic;">
          At Tutoring Club, we believe every student has the potential to thrive—with the right support. 
          Based on your academic goals and our in-depth assessment, we've put together a customized roadmap 
          designed to close learning gaps, build confidence, and get results.
        </p>
      </div>

      <!-- Recommended Sessions with Total Hours -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 24px; font-weight: bold; color: #0e406a; margin: 0 0 20px 0; border-bottom: 3px solid #f26a31; padding-bottom: 8px;">Recommended Sessions by Subject</h3>
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
            <div style="color: #0063a8;">
              <div style="font-size: 14px; margin-bottom: 6px; font-weight: 600;">Total Recommended Hours</div>
              <div style="font-size: 36px; font-weight: bold; margin-bottom: 4px;">${totalHours}</div>
              <div style="font-size: 16px; font-weight: 600;">hours</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline Bar Chart -->
      <div>
        <h3 style="font-size: 20px; font-weight: bold; color: #0e406a; margin: 0 0 16px 0; border-bottom: 3px solid #f26a31; padding-bottom: 6px;">Recommended Timeline Options</h3>
        <div style="background: white; border-radius: 12px; padding: 20px; border: 2px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 13px; color: #6b7280;">Hours per Week</span>
              <span style="font-size: 13px; color: #6b7280;">Completion Time</span>
            </div>
            ${timeline.map(({ hoursPerWeek, months }, index) => {
              const maxMonths = Math.max(...timeline.map(t => t.months));
              const barWidth = (months / maxMonths) * 100;
              return `
                <div style="margin-bottom: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-weight: bold; color: #1f2937; font-size: 14px;">${hoursPerWeek} hrs/week</span>
                    <span style="font-weight: bold; color: #0063a8; font-size: 14px;">${months} months</span>
                  </div>
                  <div style="background: #f1f5f9; border-radius: 16px; height: 20px; position: relative; overflow: hidden;">
                    <div style="background: #0063a8; height: 100%; width: ${barWidth}%; border-radius: 16px;">
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div style="text-align: center; padding-top: 12px; border-top: 1px solid #e5e7eb;">
            <span style="font-size: 11px; color: #6b7280; font-style: italic;">Choose the timeline that best fits your schedule and goals</span>
          </div>
        </div>
      </div>
    </div>
  `;

  await renderHtmlToPdf(pdf, htmlContent);
}

async function generatePage2(pdf: jsPDF, monthlyOptions: any[], prepayOptions: any[], financingOptions: any) {
  // Add title with brand styling
  pdf.setFontSize(20);
  pdf.setTextColor(14, 64, 106); // Navy color
  pdf.text('Tuition Payment Options', 20, 20);
  
  // Add subtitle
  pdf.setFontSize(10);
  pdf.setTextColor(242, 106, 49); // Orange color
  pdf.text('Flexible payment solutions designed for your budget', 20, 28);

  let yPosition = 40;

  // Section 1: Monthly Tuition Option (Blue theme)
  pdf.setFillColor(230, 244, 255); // Light blue background using brand blue
  pdf.rect(15, yPosition - 2, 180, 18, 'F');
  
  pdf.setFontSize(11);
  pdf.setTextColor(0, 99, 168); // Brand blue
  pdf.text('Monthly Tuition Option', 20, yPosition + 3);
  yPosition += 6;

  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Pay as you go monthly. Testing fee: $75. Registration fee: $100.', 20, yPosition);
  yPosition += 4;

  autoTable(pdf, {
    startY: yPosition,
    head: [['Hours/Week', 'Monthly Cost', 'Hourly Rate']],
    body: monthlyOptions.map(({ hoursPerWeek, monthlyCost, hourlyRate }) => [
      hoursPerWeek.toString(),
      `$${monthlyCost.toFixed(2)}`,
      `$${hourlyRate.toFixed(2)}`
    ]),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 99, 168], textColor: 255 },
    margin: { left: 20, right: 20 }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 18;

  // Section 2: Prepay Tuition Option (Orange theme)
  pdf.setFillColor(255, 247, 235); // Light orange background using brand orange
  pdf.rect(15, yPosition - 2, 180, 18, 'F');
  
  pdf.setFontSize(11);
  pdf.setTextColor(242, 106, 49); // Brand orange
  pdf.text('Prepay Tuition Option', 20, yPosition + 3);
  yPosition += 6;

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
      `$${totalCost.toFixed(2)}`,
      `${discountPercent}%`,
      `$${savings.toFixed(2)}`
    ]),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [242, 106, 49], textColor: 255 }, // Brand orange header
    margin: { left: 20, right: 20 }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 18;

  // Section 3: 0% Interest Tuition Option (Yellow theme only)
  pdf.setFillColor(254, 252, 232); // Light yellow background using brand yellow
  pdf.rect(15, yPosition - 2, 180, 22, 'F');
  
  pdf.setFontSize(11);
  pdf.setTextColor(249, 197, 70); // Brand yellow
  pdf.text('0% Interest Tuition Option', 20, yPosition + 3);
  yPosition += 6;

  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('No testing/registration fees. Flexible scheduling. No payments 4-6 weeks. On approved credit.', 20, yPosition);
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
      `$${totalCost.toFixed(2)}`,
      `${discountPercent}%`,
      `$${monthlyCost.toFixed(2)}`,
      `$${savings.toFixed(2)}`
    ]),
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [249, 197, 70], textColor: [0, 0, 0] }, // Brand yellow header
    margin: { left: 20, right: 20 }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 12;

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
      `$${totalCost.toFixed(2)}`,
      `${discountPercent}%`,
      `$${monthlyCost.toFixed(2)}`,
      `$${savings.toFixed(2)}`
    ]),
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [249, 197, 70], textColor: [0, 0, 0] }, // Brand yellow header with black text for readability
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
