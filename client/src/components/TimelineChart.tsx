
import React from 'react';
import { TimelineOption } from '@/lib/pricingCalculations';

interface TimelineChartProps {
  totalHours: number;
  weeklyHoursRange: string;
}

export default function TimelineChart({ totalHours, weeklyHoursRange }: TimelineChartProps) {
  if (totalHours === 0) return null;

  const hoursOptions = weeklyHoursRange === "2-8" ? [2, 4, 6, 8] : [4, 8, 12, 16];
  const currentDate = new Date();
  
  // Calculate timeline bounds
  const minWeeks = Math.ceil(totalHours / Math.max(...hoursOptions));
  const maxWeeks = Math.ceil(totalHours / Math.min(...hoursOptions));
  
  // Calculate end date for timeline
  const endDate = new Date(currentDate);
  endDate.setDate(endDate.getDate() + (maxWeeks * 7));
  
  // Generate month labels for timeline
  const generateMonthLabels = () => {
    const labels = [];
    const current = new Date(currentDate);
    current.setDate(1); // Start at first of month
    
    while (current <= endDate) {
      labels.push({
        date: new Date(current),
        label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      });
      current.setMonth(current.getMonth() + 1);
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
      months: Math.ceil(weeks / 4.33) // Convert weeks to months
    };
  });

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recommended Timeline Options</h3>
      
      {/* Timeline bars */}
      <div className="mb-8 space-y-3">
        {barData.map((bar, index) => (
          <div key={bar.hoursPerWeek} className="relative">
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium text-gray-700 w-20">
                {bar.hoursPerWeek}h/week
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {bar.weeks} weeks ({bar.months} months)
              </span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg relative overflow-hidden">
              <div 
                className={`h-full rounded-lg flex items-center justify-end pr-2 text-white text-xs font-medium ${
                  index === 0 ? 'bg-blue-600' :
                  index === 1 ? 'bg-blue-500' :
                  index === 2 ? 'bg-blue-400' :
                  'bg-blue-300'
                }`}
                style={{ width: `${bar.widthPercent}%` }}
              >
                {bar.weeks}w
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Timeline scale */}
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full mb-2"></div>
        <div className="flex justify-between text-xs text-gray-600">
          {monthLabels.map((month, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-px h-3 bg-gray-400 mb-1"></div>
              <span className="transform -rotate-45 origin-top whitespace-nowrap">
                {month.label}
              </span>
            </div>
          ))}
        </div>
        <div className="text-center mt-4 text-xs text-gray-500 italic">
          Choose the timeline that best fits your schedule and goals
        </div>
      </div>
    </div>
  );
}
