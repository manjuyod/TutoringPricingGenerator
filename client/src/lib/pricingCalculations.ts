import { defaultPrepayDiscounts, defaultInterestDiscounts } from "@shared/schema";

export interface SubjectHours {
  "Beginning Reading/Phonics": number;
  "Reading": number;
  "Writing": number;
  "Math": number;
  "TutorUp": number;
  "Test Prep": number;
}

export interface TimelineOption {
  hoursPerWeek: number;
  months: number;
}

export interface MonthlyPaymentOption {
  hoursPerWeek: number;
  monthlyCost: number;
  hourlyRate: number;
}

export interface PrepayOption {
  hours: number;
  adjustedHourlyRate: number;
  totalCost: number;
  discountPercent: number;
  savings: number;
}

export interface FinancingOption {
  hours: number;
  adjustedHourlyRate: number;
  totalCost: number;
  discountPercent: number;
  monthlyCost: number;
  savings: number;
}

export function calculateTotalHours(subjects: SubjectHours): number {
  return Object.values(subjects).reduce((sum, hours) => sum + hours, 0);
}

export function getSelectedSubjects(subjects: SubjectHours): Array<{ name: string; hours: number }> {
  return Object.entries(subjects)
    .filter(([_, hours]) => hours > 0)
    .map(([name, hours]) => ({ name, hours }));
}

export function calculateTimeline(totalHours: number, weeklyHoursRange: string): TimelineOption[] {
  if (totalHours === 0) return [];
  
  const hoursOptions = weeklyHoursRange === "2-8" ? [2, 4, 6, 8] : [4, 8, 12, 16];
  
  return hoursOptions.map(hoursPerWeek => ({
    hoursPerWeek,
    months: Math.ceil(totalHours / (hoursPerWeek * 4))
  }));
}

export function calculateMonthlyPaymentOptions(
  hourlyRate: number,
  weeklyHoursRange: string
): MonthlyPaymentOption[] {
  const hoursOptions = weeklyHoursRange === "2-8" ? [2, 4, 6, 8] : [4, 8, 12, 16];
  
  return hoursOptions.map(hoursPerWeek => ({
    hoursPerWeek,
    monthlyCost: hoursPerWeek * 4 * hourlyRate,
    hourlyRate
  }));
}

export function calculatePrepayOptions(
  totalHours: number,
  hourlyRate: number,
  packages: number[],
  customDiscounts?: Record<string, number>
): PrepayOption[] {
  const discounts = customDiscounts || defaultPrepayDiscounts;
  
  return packages.map(hours => {
    const discountPercent = discounts[hours.toString()] || 0;
    const adjustedHourlyRate = hourlyRate * (1 - discountPercent / 100);
    const totalCost = hours * adjustedHourlyRate;
    const savings = (hours * hourlyRate) * (discountPercent / 100);
    
    return {
      hours,
      adjustedHourlyRate,
      totalCost,
      discountPercent,
      savings
    };
  });
}

export function calculateFinancingOptions(
  totalHours: number,
  hourlyRate: number,
  packages: number[],
  customDiscounts?: Record<string, number>
): { 
  twelveMonth: FinancingOption[];
  eighteenMonth: FinancingOption[];
  twentyFourMonth: FinancingOption[];
} {
  const baseDiscounts = customDiscounts || defaultInterestDiscounts;
  
  const calculateForTerm = (months: number, discountAdjustment: number = 0) => {
    return packages.map(hours => {
      const discountPercent = Math.max(0, (baseDiscounts[hours.toString()] || 0) + discountAdjustment);
      const adjustedHourlyRate = hourlyRate * (1 - discountPercent / 100);
      const totalCost = hours * adjustedHourlyRate;
      const monthlyCost = totalCost / months;
      const savings = (hours * hourlyRate) * (discountPercent / 100);
      
      return {
        hours,
        adjustedHourlyRate,
        totalCost,
        discountPercent,
        monthlyCost,
        savings
      };
    });
  };
  
  return {
    twelveMonth: calculateForTerm(12, 0),
    eighteenMonth: calculateForTerm(18, -5),
    twentyFourMonth: calculateForTerm(24, -5)
  };
}
