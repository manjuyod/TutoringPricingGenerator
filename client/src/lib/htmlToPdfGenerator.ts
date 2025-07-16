import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SubjectHours, calculateTotalHours, getSelectedSubjects, calculateTimeline, calculateMonthlyPaymentOptions, calculatePrepayOptions, calculateFinancingOptions } from './pricingCalculations';
import { LOGO_B64 } from './generatedAssets';

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
  await generatePage1(pdf, selectedSubjects, totalHours, timeline, weeklyHours);

  // Page 2: Payment Options
  pdf.addPage();
  await generatePage2(pdf, monthlyOptions, prepayOptions, financingOptions);

  // Save the PDF
  pdf.save('tutoring-club-academic-gameplan.pdf');
}

async function generatePage1(pdf: jsPDF, selectedSubjects: any[], totalHours: number, timeline: any[], weeklyHoursRange: string) {
  // Create HTML content for page 1
  const htmlContent = `
    <div style="width: 800px; padding: 30px; font-family: Arial, sans-serif; background: white; color: #000000; box-sizing: border-box; font-size: 14px;">
      <div style="border-bottom: 3px solid #0063a8; margin-bottom: 20px; padding-bottom: 15px;">
        <h1 style="font-size: 28px; font-weight: bold; color: #0063a8; margin: 0 0 5px 0;">Academic Game Plan</h1>
        <h2 style="font-size: 16px; color: #f26a31; margin: 0; font-weight: 600;">Personalized Learning Strategy</h2>
      </div>

      <div style="margin-bottom: 25px; background: #f8fafc; border-left: 4px solid #0063a8; padding: 15px; border-radius: 6px;">
        <p style="font-size: 13px; line-height: 1.5; color: #1f2937; margin: 0; font-style: italic;">
          At Tutoring Club, we believe every student has the potential to thrive—with the right support. 
          Based on your academic goals and our in-depth assessment, we've put together a customized roadmap 
          designed to close learning gaps, build confidence, and get results.
        </p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 18px; font-weight: bold; color: #0063a8; margin: 0 0 15px 0; border-bottom: 2px solid #0063a8; padding-bottom: 5px;">Recommended Sessions by Subject</h3>
        <div style="display: block;">
          <div style="margin-bottom: 20px;">
            ${selectedSubjects.map(({ name, hours }, index) => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; margin-bottom: 5px; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${name}</span>
                <span style="color: #0063a8; font-weight: bold; font-size: 14px;">${hours} hours</span>
              </div>
            `).join('')}
          </div>

          <div style="border: 3px solid #0063a8; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; background: #f0f7ff;">
            <div style="font-size: 12px; margin-bottom: 5px; font-weight: 600; color: #0063a8;">Total Recommended Hours</div>
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px; color: #f26a31;">${totalHours}</div>
            <div style="font-size: 14px; font-weight: 600; color: #f26a31;">hours</div>
          </div>
        </div>
      </div>

      <div>
        <h3 style="font-size: 18px; font-weight: bold; color: #0063a8; margin: 0 0 15px 0; border-bottom: 2px solid #0063a8; padding-bottom: 5px;">Recommended Timeline Options</h3>
        <div style="background: white; border-radius: 10px; padding: 15px; border: 2px solid #e2e8f0;">
          <div id="timelineChart" width="700" height="280" style="width: 100%; max-width: 700px; height: 280px; display: block; margin: 0 auto;"></div>
          <div style="text-align: center; padding-top: 10px; border-top: 1px solid #e5e7eb; margin-top: 10px; width: 100%;">
            <span style="font-size: 11px; color: #6b7280; font-style: italic;">Choose the timeline that best fits your schedule and goals</span>
          </div>
        </div>
      </div>
    </div>
  `;

  await renderHtmlToPdf(pdf, htmlContent, timeline, totalHours, weeklyHoursRange);
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

async function renderHtmlToPdf(pdf: jsPDF, htmlContent: string, timeline: any[], totalHours: number, weeklyHoursRange: string) {
  // First, create the chart as a separate image
  const chartImageDataUrl = await createTimelineChartImage(totalHours, weeklyHoursRange);
  
  // Create the main content without the chart
  const contentWithoutChart = htmlContent.replace(
    '<div id="timelineChart" width="700" height="280" style="width: 100%; max-width: 700px; height: 280px; display: block; margin: 0 auto;"></div>',
    `<img src="${chartImageDataUrl}" style="width: 600px; height: 200px; display: block; margin: 0 auto;" />`
  );

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = contentWithoutChart;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-10000px';
  tempDiv.style.top = '0';
  tempDiv.style.width = '800px';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  tempDiv.style.color = '#000000';
  tempDiv.style.overflow = 'visible';
  document.body.appendChild(tempDiv);

  try {
    await pdf.html(tempDiv, {
      callback: () => {
        document.body.removeChild(tempDiv);
      },
      margin: [10, 10, 10, 10],
      x: 0,
      y: 0,
      width: 190,
      windowWidth: 800,
      html2canvas: {
        scale: 1,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      }
    });
  } catch (error) {
    document.body.removeChild(tempDiv);
    throw error;
  }
}

async function createTimelineChartImage(totalHours: number, weeklyHoursRange: string): Promise<string> {
  const hoursOptions = weeklyHoursRange === "2-8" ? [2, 4, 6, 8] : [4, 8, 12, 16];
  const currentDate = new Date();

  // Calculate timeline bounds
  const minWeeks = Math.ceil(totalHours / Math.max(...hoursOptions));
  const maxWeeks = Math.ceil(totalHours / Math.min(...hoursOptions));

  // Calculate end date for timeline
  const endDate = new Date(currentDate);
  endDate.setDate(endDate.getDate() + (maxWeeks * 7));

  // Generate month labels for timeline (max 6 months)
  const generateMonthLabels = () => {
    const labels = [];
    const current = new Date(currentDate);
    current.setDate(1); // Start at first of month

    const totalMonths = Math.ceil(maxWeeks / 4.33);
    const maxLabels = 6;
    
    if (totalMonths <= maxLabels) {
      // Show all months if 6 or fewer
      while (current <= endDate) {
        labels.push(current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        current.setMonth(current.getMonth() + 1);
      }
    } else {
      // Show every nth month to fit in 6 labels
      const step = Math.ceil(totalMonths / maxLabels);
      let monthCount = 0;
      
      while (current <= endDate && labels.length < maxLabels) {
        if (monthCount % step === 0) {
          labels.push(current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        }
        current.setMonth(current.getMonth() + 1);
        monthCount++;
      }
    }
    
    return labels;
  };

  const monthLabels = generateMonthLabels();
  const totalTimelineWeeks = maxWeeks;

  // Calculate bar data
  const barData = hoursOptions.map(hoursPerWeek => {
    const weeks = Math.ceil(totalHours / hoursPerWeek);
    const widthPercent = (weeks / totalTimelineWeeks) * 100;
    return {
      hoursPerWeek,
      weeks,
      widthPercent,
      months: Math.ceil(weeks / 4.33)
    };
  });

  // Create timeline HTML for isolated rendering
  const timelineHtml = `
    <div style="width: 700px; height: 280px; background: white; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="margin-bottom: 20px;">
        ${barData.map((bar, index) => `
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 600; color: #374151; width: 80px; font-size: 14px;">${bar.hoursPerWeek}h/week</span>
              <span style="font-size: 12px; color: #6b7280; margin-left: 8px;">${bar.weeks} weeks (${bar.months} months)</span>
            </div>
            <div style="height: 32px; background-color: #f3f4f6; border-radius: 8px; position: relative; overflow: hidden;">
              <div style="height: 100%; background-color: ${index === 0 ? '#2563eb' : index === 1 ? '#3b82f6' : index === 2 ? '#60a5fa' : '#93c5fd'}; width: ${bar.widthPercent}%; border-radius: 8px; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; color: white; font-size: 12px; font-weight: 600;">
                ${bar.weeks}w
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="position: relative; margin-top: 20px;">
        <div style="height: 8px; background-color: #e5e7eb; border-radius: 4px; margin-bottom: 8px;"></div>
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280;">
          ${monthLabels.map(label => `<span>${label}</span>`).join('')}
        </div>
      </div>
    </div>
  `;

  // Create isolated chart element
  const chartDiv = document.createElement('div');
  chartDiv.innerHTML = timelineHtml;
  chartDiv.style.position = 'absolute';
  chartDiv.style.left = '-10000px';
  chartDiv.style.top = '0';
  chartDiv.style.width = '700px';
  chartDiv.style.height = '280px';
  document.body.appendChild(chartDiv);

  try {
    const canvas = await html2canvas(chartDiv.firstElementChild as HTMLElement, {
      width: 700,
      height: 280,
      scale: 2,
      backgroundColor: 'white',
      useCORS: true,
    });
    
    const imageDataUrl = canvas.toDataURL('image/png');
    document.body.removeChild(chartDiv);
    return imageDataUrl;
  } catch (error) {
    document.body.removeChild(chartDiv);
    throw error;
  }
}