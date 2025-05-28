
import jsPDF from 'jspdf';
import { SubjectHours, calculateTotalHours, getSelectedSubjects, calculateTimeline, calculateMonthlyPaymentOptions, calculatePrepayOptions, calculateFinancingOptions } from './pricingCalculations';

interface PdfFormData {
  hourlyRate: number;
  weeklyHours: string;
  subjects: SubjectHours;
  packages: number[];
  prepayDiscounts: Record<string, number>;
  interestDiscounts: Record<string, number>;
}

export function generatePricingPDF(formData: PdfFormData): void {
  const { hourlyRate, weeklyHours, subjects, packages, prepayDiscounts, interestDiscounts } = formData;
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 25;
  
  // Color palette
  const colors = {
    primary: [0, 99, 168],      // TC Blue
    secondary: [242, 106, 49],   // TC Orange
    text: [31, 41, 55],         // Dark gray
    lightGray: [156, 163, 175], // Light gray
    success: [5, 150, 105],     // Green
    danger: [220, 38, 38],      // Red
    background: [248, 250, 252] // Very light gray
  };

  // Helper function to add colored rectangle background
  const addBackground = (x: number, y: number, width: number, height: number, color: number[]) => {
    pdf.setFillColor(...color);
    pdf.rect(x, y - height + 2, width, height, 'F');
  };

  // Helper function to add text with enhanced styling
  const addText = (text: string, x: number, y: number, options?: any) => {
    if (options?.background) {
      const textWidth = pdf.getTextWidth(text);
      addBackground(x - 2, y, textWidth + 4, options.background.height || 6, options.background.color);
    }
    
    pdf.text(text, x, y, options);
    return y + (options?.lineHeight || 7);
  };

  // Helper function to check page break with better spacing
  const checkPageBreak = (currentY: number, neededSpace: number = 40) => {
    if (currentY + neededSpace > pageHeight - 25) {
      pdf.addPage();
      return 25;
    }
    return currentY;
  };

  // Helper function to draw a table with enhanced styling
  const drawTable = (headers: string[], rows: string[][], startY: number, options?: any) => {
    const colWidth = (pageWidth - 40) / headers.length;
    let currentY = startY;
    
    // Draw header background
    pdf.setFillColor(241, 245, 249);
    pdf.rect(20, currentY - 8, pageWidth - 40, 12, 'F');
    
    // Draw header border
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.5);
    pdf.rect(20, currentY - 8, pageWidth - 40, 12);
    
    // Header text
    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont("helvetica", "bold");
    
    headers.forEach((header, i) => {
      pdf.text(header, 22 + (i * colWidth), currentY - 2);
    });
    
    currentY += 8;
    
    // Draw rows
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    
    rows.forEach((row, rowIndex) => {
      currentY = checkPageBreak(currentY, 10);
      
      // Alternate row background
      if (rowIndex % 2 === 1) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(20, currentY - 6, pageWidth - 40, 10, 'F');
      }
      
      // Row border
      pdf.setDrawColor(241, 245, 249);
      pdf.rect(20, currentY - 6, pageWidth - 40, 10);
      
      row.forEach((cell, i) => {
        // Set color based on content type
        if (cell.includes('$')) {
          pdf.setTextColor(...colors.primary);
          pdf.setFont("helvetica", "bold");
        } else if (cell.includes('%')) {
          pdf.setTextColor(...colors.danger);
          pdf.setFont("helvetica", "bold");
        } else if (i === 0) {
          pdf.setTextColor(...colors.text);
          pdf.setFont("helvetica", "bold");
        } else {
          pdf.setTextColor(...colors.text);
          pdf.setFont("helvetica", "normal");
        }
        
        pdf.text(cell, 22 + (i * colWidth), currentY);
      });
      
      currentY += 10;
    });
    
    return currentY + 5;
  };

  // Page 1: Academic Game Plan
  // Header with enhanced styling
  pdf.setFontSize(32);
  pdf.setTextColor(...colors.primary);
  pdf.setFont("helvetica", "bold");
  yPosition = addText('Academic Game Plan', 20, yPosition, { lineHeight: 12 });
  
  pdf.setFontSize(16);
  pdf.setTextColor(...colors.secondary);
  pdf.setFont("helvetica", "bold");
  yPosition = addText('Tutoring Club', 20, yPosition, { lineHeight: 8 });
  
  // Add decorative line
  pdf.setDrawColor(...colors.primary);
  pdf.setLineWidth(2);
  pdf.line(20, yPosition + 5, pageWidth - 20, yPosition + 5);
  yPosition += 15;
  
  // Enhanced description box
  pdf.setFillColor(...colors.background);
  pdf.rect(20, yPosition - 5, pageWidth - 40, 25, 'F');
  pdf.setDrawColor(...colors.primary);
  pdf.setLineWidth(3);
  pdf.line(20, yPosition - 5, 20, yPosition + 20);
  
  pdf.setFontSize(11);
  pdf.setTextColor(...colors.text);
  pdf.setFont("helvetica", "normal");
  const description = 'At Tutoring Club, we believe every student has the potential to thrive—with the right support. Based on your academic goals and our in-depth assessment, we\'ve put together a customized roadmap designed to close learning gaps, build confidence, and get results.';
  const splitDescription = pdf.splitTextToSize(description, pageWidth - 50);
  yPosition = addText(splitDescription, 25, yPosition + 5, { lineHeight: 5 });
  yPosition += 15;
  
  // Calculate data
  const totalHours = calculateTotalHours(subjects);
  const selectedSubjects = getSelectedSubjects(subjects);
  const timeline = calculateTimeline(totalHours, weeklyHours);
  
  // Enhanced subject section
  pdf.setFontSize(18);
  pdf.setTextColor(...colors.text);
  pdf.setFont("helvetica", "bold");
  yPosition = addText('RECOMMENDED SESSIONS BY SUBJECT', 20, yPosition, { lineHeight: 12 });
  
  // Subject box with enhanced styling
  pdf.setFillColor(248, 250, 252);
  pdf.rect(20, yPosition, pageWidth - 40, selectedSubjects.length * 8 + 10, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.rect(20, yPosition, pageWidth - 40, selectedSubjects.length * 8 + 10);
  
  yPosition += 8;
  pdf.setFontSize(11);
  selectedSubjects.forEach(({ name, hours }, index) => {
    pdf.setTextColor(...colors.text);
    pdf.setFont("helvetica", "normal");
    pdf.text(name, 25, yPosition);
    
    // Hours badge
    const hoursText = `${hours} hours`;
    const badgeWidth = pdf.getTextWidth(hoursText) + 8;
    pdf.setFillColor(224, 242, 254);
    pdf.rect(pageWidth - 30 - badgeWidth, yPosition - 5, badgeWidth, 8, 'F');
    pdf.setTextColor(...colors.primary);
    pdf.setFont("helvetica", "bold");
    pdf.text(hoursText, pageWidth - 26 - badgeWidth, yPosition);
    
    yPosition += 8;
  });
  
  yPosition += 10;
  
  // Enhanced Total Hours section
  pdf.setFillColor(...colors.primary);
  pdf.rect(20, yPosition - 5, pageWidth - 40, 18, 'F');
  
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.text('Total Recommended Hours:', 25, yPosition + 5);
  
  pdf.setFontSize(24);
  pdf.text(`${totalHours} hours`, pageWidth - 80, yPosition + 5);
  
  yPosition += 25;
  
  // Enhanced Timeline section
  pdf.setFontSize(18);
  pdf.setTextColor(...colors.text);
  pdf.setFont("helvetica", "bold");
  yPosition = addText('RECOMMENDED TIMELINE', 20, yPosition, { lineHeight: 12 });
  
  // Timeline cards
  const cardWidth = (pageWidth - 60) / timeline.length;
  timeline.forEach(({ hoursPerWeek, months }, index) => {
    const cardX = 20 + (index * (cardWidth + 10));
    
    // Card background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(cardX, yPosition, cardWidth, 30, 'F');
    pdf.setDrawColor(224, 242, 254);
    pdf.setLineWidth(2);
    pdf.rect(cardX, yPosition, cardWidth, 30);
    
    // Hours number
    pdf.setFontSize(20);
    pdf.setTextColor(...colors.primary);
    pdf.setFont("helvetica", "bold");
    const hoursText = hoursPerWeek.toString();
    const hoursWidth = pdf.getTextWidth(hoursText);
    pdf.text(hoursText, cardX + (cardWidth - hoursWidth) / 2, yPosition + 12);
    
    // Label
    pdf.setFontSize(8);
    pdf.setTextColor(...colors.lightGray);
    pdf.setFont("helvetica", "normal");
    const labelText = 'HOURS/WEEK';
    const labelWidth = pdf.getTextWidth(labelText);
    pdf.text(labelText, cardX + (cardWidth - labelWidth) / 2, yPosition + 18);
    
    // Months
    pdf.setFontSize(11);
    pdf.setTextColor(...colors.text);
    pdf.setFont("helvetica", "bold");
    const monthsText = `${months} months`;
    const monthsWidth = pdf.getTextWidth(monthsText);
    pdf.text(monthsText, cardX + (cardWidth - monthsWidth) / 2, yPosition + 25);
  });

  // Page 2: Payment Options
  pdf.addPage();
  yPosition = 25;
  
  // Header
  pdf.setFontSize(32);
  pdf.setTextColor(...colors.primary);
  pdf.setFont("helvetica", "bold");
  yPosition = addText('Tuition Payment Options', 20, yPosition, { lineHeight: 12 });
  
  pdf.setFontSize(16);
  pdf.setTextColor(...colors.secondary);
  pdf.setFont("helvetica", "bold");
  yPosition = addText('Tutoring Club', 20, yPosition, { lineHeight: 10 });
  
  // Add decorative line
  pdf.setDrawColor(...colors.primary);
  pdf.setLineWidth(2);
  pdf.line(20, yPosition + 5, pageWidth - 20, yPosition + 5);
  yPosition += 20;
  
  // Monthly Option
  pdf.setFontSize(16);
  pdf.setTextColor(...colors.primary);
  pdf.setFont("helvetica", "bold");
  yPosition = addText('Monthly Tuition Option', 20, yPosition, { lineHeight: 10 });
  
  pdf.setFontSize(11);
  pdf.setTextColor(...colors.text);
  pdf.setFont("helvetica", "italic");
  yPosition = addText('Pay as you go on a monthly basis at our standard hourly rate. Testing fee: $75. Registration fee: $100.', 20, yPosition, { lineHeight: 8 });
  yPosition += 5;
  
  const monthlyOptions = calculateMonthlyPaymentOptions(hourlyRate, weeklyHours);
  const monthlyHeaders = ['Hours/Week', 'Monthly Cost', 'Hourly Rate'];
  const monthlyRows = monthlyOptions.map(({ hoursPerWeek, monthlyCost, hourlyRate: rate }) => [
    hoursPerWeek.toString(),
    `$${monthlyCost.toFixed(2)}`,
    `$${rate.toFixed(2)}`
  ]);
  
  yPosition = drawTable(monthlyHeaders, monthlyRows, yPosition);
  yPosition += 10;
  
  // Prepay Option
  yPosition = checkPageBreak(yPosition, 60);
  pdf.setFontSize(16);
  pdf.setTextColor(...colors.primary);
  pdf.setFont("helvetica", "bold");
  yPosition = addText('Prepay Tuition Option', 20, yPosition, { lineHeight: 10 });
  
  pdf.setFontSize(11);
  pdf.setTextColor(...colors.text);
  pdf.setFont("helvetica", "italic");
  yPosition = addText('No testing or registration fees. Flexible scheduling.', 20, yPosition, { lineHeight: 8 });
  yPosition += 5;
  
  const prepayOptions = calculatePrepayOptions(totalHours, hourlyRate, packages, prepayDiscounts);
  const prepayHeaders = ['Hours', 'Adj. Rate', 'Total Cost', 'Discount', 'Savings'];
  const prepayRows = prepayOptions.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, savings }) => [
    hours.toString(),
    `$${adjustedHourlyRate.toFixed(2)}`,
    `$${totalCost.toFixed(2)}`,
    `${discountPercent}%`,
    `$${savings.toFixed(2)}`
  ]);
  
  yPosition = drawTable(prepayHeaders, prepayRows, yPosition);
  yPosition += 10;
  
  // 0% Interest Option
  yPosition = checkPageBreak(yPosition, 80);
  pdf.setFontSize(16);
  pdf.setTextColor(...colors.primary);
  pdf.setFont("helvetica", "bold");
  yPosition = addText('0% Interest Tuition Option', 20, yPosition, { lineHeight: 10 });
  
  pdf.setFontSize(11);
  pdf.setTextColor(...colors.text);
  pdf.setFont("helvetica", "italic");
  const interestDescription = 'No testing or registration fees. Flexible scheduling. No payments for 4-6 weeks. No out-of-pocket expenses or down payments. Early prepayment allowed. On approved credit.';
  const splitInterestDesc = pdf.splitTextToSize(interestDescription, pageWidth - 40);
  yPosition = addText(splitInterestDesc, 20, yPosition, { lineHeight: 5 });
  yPosition += 10;
  
  const financingOptions = calculateFinancingOptions(totalHours, hourlyRate, packages, interestDiscounts);
  const financeHeaders = ['Hours', 'Adj.Rate', 'Total', 'Discount', 'Monthly', 'Savings'];
  
  // 12 Month Plan
  pdf.setFontSize(14);
  pdf.setTextColor(...colors.primary);
  pdf.setFont("helvetica", "bold");
  
  // Plan title background
  pdf.setFillColor(224, 242, 254);
  pdf.rect(20, yPosition - 3, pageWidth - 40, 10, 'F');
  pdf.text('12 Month Plan', 25, yPosition + 3);
  yPosition += 12;
  
  const twelveMonthRows = financingOptions.twelveMonth.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }) => [
    hours.toString(),
    `$${adjustedHourlyRate.toFixed(2)}`,
    `$${totalCost.toFixed(2)}`,
    `${discountPercent}%`,
    `$${monthlyCost.toFixed(2)}`,
    `$${savings.toFixed(2)}`
  ]);
  
  yPosition = drawTable(financeHeaders, twelveMonthRows, yPosition);
  yPosition += 8;
  
  // 18 Month Plan
  yPosition = checkPageBreak(yPosition, 40);
  pdf.setFillColor(224, 242, 254);
  pdf.rect(20, yPosition - 3, pageWidth - 40, 10, 'F');
  pdf.setFontSize(14);
  pdf.setTextColor(...colors.primary);
  pdf.setFont("helvetica", "bold");
  pdf.text('18 Month Plan', 25, yPosition + 3);
  yPosition += 12;
  
  const eighteenMonthRows = financingOptions.eighteenMonth.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }) => [
    hours.toString(),
    `$${adjustedHourlyRate.toFixed(2)}`,
    `$${totalCost.toFixed(2)}`,
    `${discountPercent}%`,
    `$${monthlyCost.toFixed(2)}`,
    `$${savings.toFixed(2)}`
  ]);
  
  yPosition = drawTable(financeHeaders, eighteenMonthRows, yPosition);
  yPosition += 8;
  
  // 24 Month Plan
  yPosition = checkPageBreak(yPosition, 40);
  pdf.setFillColor(224, 242, 254);
  pdf.rect(20, yPosition - 3, pageWidth - 40, 10, 'F');
  pdf.setFontSize(14);
  pdf.setTextColor(...colors.primary);
  pdf.setFont("helvetica", "bold");
  pdf.text('24 Month Plan', 25, yPosition + 3);
  yPosition += 12;
  
  const twentyFourMonthRows = financingOptions.twentyFourMonth.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }) => [
    hours.toString(),
    `$${adjustedHourlyRate.toFixed(2)}`,
    `$${totalCost.toFixed(2)}`,
    `${discountPercent}%`,
    `$${monthlyCost.toFixed(2)}`,
    `$${savings.toFixed(2)}`
  ]);
  
  yPosition = drawTable(financeHeaders, twentyFourMonthRows, yPosition);
  
  // Add page numbers
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(...colors.lightGray);
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
  }
  
  // Save the PDF
  pdf.save('tutoring-club-pricing-sheet.pdf');
}
