
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
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; padding: 20px; background: linear-gradient(135deg, #0063a8 0%, #0e406a 100%); border-radius: 12px;">
        <div>
          <h1 style="font-size: 36px; font-weight: bold; color: white; margin: 0 0 8px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">Academic Game Plan</h1>
          <h2 style="font-size: 20px; color: #f26a31; margin: 0; font-weight: 600;">Personalized Learning Strategy</h2>
        </div>
        <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzAwNjNhOCI+VHV0b3JpbmcgQ2x1YjwvdGV4dD48L3N2Zz4=" alt="Tutoring Club Logo" style="height: 40px; width: auto;">
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
          <div style="flex: 1; background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-radius: 12px; padding: 20px; border: 2px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            ${selectedSubjects.map(({ name, hours }, index) => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; margin-bottom: ${index === selectedSubjects.length - 1 ? '0' : '8px'}; background: white; border-radius: 8px; border-left: 4px solid #0063a8; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <span style="color: #1f2937; font-size: 15px; font-weight: 500;">${name}</span>
                <span style="background: #0063a8; color: white; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 13px;">${hours} hours</span>
              </div>
            `).join('')}
          </div>
          
          <!-- Total Hours -->
          <div style="flex: 0 0 240px; background: linear-gradient(135deg, #0063a8 0%, #0e406a 100%); border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 6px 12px rgba(0,99,168,0.2); display: flex; flex-direction: column; justify-content: center;">
            <div style="color: white;">
              <div style="font-size: 14px; margin-bottom: 6px; opacity: 0.9;">Total Recommended Hours</div>
              <div style="font-size: 36px; font-weight: bold; margin-bottom: 4px;">${totalHours}</div>
              <div style="font-size: 16px; opacity: 0.9;">hours</div>
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
              const colors = ['#0063a8', '#f26a31', '#0e406a', '#f9c546'];
              const color = colors[index % colors.length];
              return `
                <div style="margin-bottom: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-weight: bold; color: #1f2937; font-size: 14px;">${hoursPerWeek} hrs/week</span>
                    <span style="font-weight: bold; color: ${color}; font-size: 14px;">${months} months</span>
                  </div>
                  <div style="background: #f1f5f9; border-radius: 16px; height: 20px; position: relative; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, ${color} 0%, ${color}CC 100%); height: 100%; width: ${barWidth}%; border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                      <span style="color: white; font-size: 11px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">${months}m</span>
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

  let yPosition = 38;

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

  yPosition = (pdf as any).lastAutoTable.finalY + 6;

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

  yPosition = (pdf as any).lastAutoTable.finalY + 6;

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

  yPosition = (pdf as any).lastAutoTable.finalY + 4;

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
