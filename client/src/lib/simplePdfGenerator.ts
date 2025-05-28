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
  let yPosition = 20;
  
  // Helper function to add text with line breaks
  const addText = (text: string, x: number, y: number, options?: any) => {
    pdf.text(text, x, y, options);
    return y + (options?.lineHeight || 7);
  };

  // Helper function to check page break
  const checkPageBreak = (currentY: number, neededSpace: number = 30) => {
    if (currentY + neededSpace > pageHeight - 20) {
      pdf.addPage();
      return 20;
    }
    return currentY;
  };

  // Page 1: Academic Game Plan
  // Header
  pdf.setFontSize(24);
  pdf.setTextColor(0, 99, 168); // TC Blue
  yPosition = addText('Academic Game Plan', 20, yPosition, { lineHeight: 10 });
  
  pdf.setFontSize(14);
  pdf.setTextColor(242, 106, 49); // TC Orange
  yPosition = addText('Tutoring Club', 20, yPosition, { lineHeight: 10 });
  
  yPosition += 10;
  
  // Description
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  const description = 'At Tutoring Club, we believe every student has the potential to thrive—with the right support. Based on your academic goals and our in-depth assessment, we\'ve put together a customized roadmap designed to close learning gaps, build confidence, and get results.';
  const splitDescription = pdf.splitTextToSize(description, pageWidth - 40);
  yPosition = addText(splitDescription, 20, yPosition, { lineHeight: 6 });
  
  yPosition += 15;
  
  // Calculate data
  const totalHours = calculateTotalHours(subjects);
  const selectedSubjects = getSelectedSubjects(subjects);
  const timeline = calculateTimeline(totalHours, weeklyHours);
  
  // Recommended Sessions by Subject
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  yPosition = addText('Recommended Sessions by Subject', 20, yPosition, { lineHeight: 10 });
  
  pdf.setFontSize(11);
  selectedSubjects.forEach(({ name, hours }) => {
    yPosition = checkPageBreak(yPosition);
    yPosition = addText(`${name}: ${hours} hours`, 25, yPosition);
  });
  
  yPosition += 10;
  
  // Total Hours
  pdf.setFontSize(14);
  pdf.setTextColor(0, 99, 168);
  yPosition = addText(`Total Recommended Hours: ${totalHours} hours`, 20, yPosition, { lineHeight: 10 });
  
  yPosition += 15;
  
  // Timeline
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  yPosition = addText('Recommended Timeline', 20, yPosition, { lineHeight: 10 });
  
  pdf.setFontSize(11);
  timeline.forEach(({ hoursPerWeek, months }) => {
    yPosition = checkPageBreak(yPosition);
    yPosition = addText(`${hoursPerWeek} hours/week: ${months} months`, 25, yPosition);
  });

  // Page 2: Payment Options
  pdf.addPage();
  yPosition = 20;
  
  // Header
  pdf.setFontSize(24);
  pdf.setTextColor(0, 99, 168);
  yPosition = addText('Tuition Payment Options', 20, yPosition, { lineHeight: 10 });
  
  yPosition += 15;
  
  // Monthly Option
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  yPosition = addText('Monthly Tuition Option', 20, yPosition, { lineHeight: 8 });
  
  pdf.setFontSize(11);
  yPosition = addText('Pay as you go on a monthly basis at our standard hourly rate. Testing fee: $75. Registration fee: $100.', 20, yPosition, { lineHeight: 6 });
  yPosition += 5;
  
  const monthlyOptions = calculateMonthlyPaymentOptions(hourlyRate, weeklyHours);
  yPosition = addText('Hours/Week    Monthly Cost    Hourly Rate', 20, yPosition);
  monthlyOptions.forEach(({ hoursPerWeek, monthlyCost, hourlyRate: rate }) => {
    yPosition = addText(`${hoursPerWeek}            $${monthlyCost.toFixed(2)}         $${rate.toFixed(2)}`, 20, yPosition);
  });
  
  yPosition += 10;
  
  // Prepay Option
  yPosition = checkPageBreak(yPosition, 50);
  pdf.setFontSize(14);
  yPosition = addText('Prepay Tuition Option', 20, yPosition, { lineHeight: 8 });
  
  pdf.setFontSize(11);
  yPosition = addText('No testing or registration fees. Flexible scheduling.', 20, yPosition, { lineHeight: 6 });
  yPosition += 5;
  
  const prepayOptions = calculatePrepayOptions(totalHours, hourlyRate, packages, prepayDiscounts);
  yPosition = addText('Hours    Adj. Rate    Total Cost    Discount    Savings', 20, yPosition);
  prepayOptions.forEach(({ hours, adjustedHourlyRate, totalCost, discountPercent, savings }) => {
    yPosition = checkPageBreak(yPosition);
    yPosition = addText(`${hours}      $${adjustedHourlyRate.toFixed(2)}       $${totalCost.toFixed(2)}      ${discountPercent}%       $${savings.toFixed(2)}`, 20, yPosition);
  });
  
  yPosition += 10;
  
  // 0% Interest Option
  yPosition = checkPageBreak(yPosition, 60);
  pdf.setFontSize(14);
  yPosition = addText('0% Interest Tuition Option', 20, yPosition, { lineHeight: 8 });
  
  pdf.setFontSize(11);
  const interestDescription = 'No testing or registration fees. Flexible scheduling. No payments for 4-6 weeks. No out-of-pocket expenses or down payments. Early prepayment allowed. On approved credit.';
  const splitInterestDesc = pdf.splitTextToSize(interestDescription, pageWidth - 40);
  yPosition = addText(splitInterestDesc, 20, yPosition, { lineHeight: 5 });
  yPosition += 5;
  
  const financingOptions = calculateFinancingOptions(totalHours, hourlyRate, packages, interestDiscounts);
  
  // 12 Month Plan
  pdf.setFontSize(12);
  yPosition = addText('12 Month Plan', 20, yPosition, { lineHeight: 8 });
  pdf.setFontSize(10);
  yPosition = addText('Hours  Adj.Rate  Total   Discount  Monthly  Savings', 20, yPosition);
  financingOptions.twelveMonth.forEach(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }) => {
    yPosition = checkPageBreak(yPosition);
    yPosition = addText(`${hours}    $${adjustedHourlyRate.toFixed(2)}    $${totalCost.toFixed(2)}  ${discountPercent}%     $${monthlyCost.toFixed(2)}   $${savings.toFixed(2)}`, 20, yPosition, { lineHeight: 5 });
  });
  
  yPosition += 8;
  
  // 18 Month Plan (limited items to fit)
  yPosition = checkPageBreak(yPosition, 30);
  pdf.setFontSize(12);
  yPosition = addText('18 Month Plan', 20, yPosition, { lineHeight: 8 });
  pdf.setFontSize(10);
  yPosition = addText('Hours  Adj.Rate  Total   Discount  Monthly  Savings', 20, yPosition);
  financingOptions.eighteenMonth.forEach(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }) => {
    yPosition = checkPageBreak(yPosition);
    yPosition = addText(`${hours}    $${adjustedHourlyRate.toFixed(2)}    $${totalCost.toFixed(2)}  ${discountPercent}%     $${monthlyCost.toFixed(2)}   $${savings.toFixed(2)}`, 20, yPosition, { lineHeight: 5 });
  });
  
  yPosition += 8;
  
  // 24 Month Plan (limited items to fit)
  yPosition = checkPageBreak(yPosition, 30);
  pdf.setFontSize(12);
  yPosition = addText('24 Month Plan', 20, yPosition, { lineHeight: 8 });
  pdf.setFontSize(10);
  yPosition = addText('Hours  Adj.Rate  Total   Discount  Monthly  Savings', 20, yPosition);
  financingOptions.twentyFourMonth.forEach(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }) => {
    yPosition = checkPageBreak(yPosition);
    yPosition = addText(`${hours}    $${adjustedHourlyRate.toFixed(2)}    $${totalCost.toFixed(2)}  ${discountPercent}%     $${monthlyCost.toFixed(2)}   $${savings.toFixed(2)}`, 20, yPosition, { lineHeight: 5 });
  });
  
  // Save the PDF
  pdf.save('tutoring-club-pricing-sheet.pdf');
}