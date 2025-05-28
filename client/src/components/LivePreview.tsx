import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { SubjectHours, calculateTotalHours, getSelectedSubjects, calculateTimeline } from "@/lib/pricingCalculations";

interface LivePreviewProps {
  subjects: SubjectHours;
  weeklyHoursRange: string;
}

export default function LivePreview({ subjects, weeklyHoursRange }: LivePreviewProps) {
  const totalHours = calculateTotalHours(subjects);
  const selectedSubjects = getSelectedSubjects(subjects);
  const timeline = calculateTimeline(totalHours, weeklyHoursRange);

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Eye className="mr-2 h-5 w-5 tc-blue" />
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-tc-blue-light rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Total Recommended Hours</h4>
          <p className="text-2xl font-bold tc-blue">{totalHours}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Selected Subjects</h4>
          <div className="text-sm text-gray-600">
            {selectedSubjects.length > 0 ? (
              <ul className="space-y-1">
                {selectedSubjects.map(({ name, hours }) => (
                  <li key={name} className="flex justify-between">
                    <span>{name}:</span>
                    <span className="font-medium">{hours} hours</span>
                  </li>
                ))}
              </ul>
            ) : (
              "No subjects selected"
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Estimated Timeline</h4>
          <div className="text-sm text-gray-600">
            {timeline.length > 0 ? (
              <ul className="space-y-1">
                {timeline.map(({ hoursPerWeek, months }) => (
                  <li key={hoursPerWeek} className="flex justify-between">
                    <span>{hoursPerWeek}h/week:</span>
                    <span className="font-medium">{months} months</span>
                  </li>
                ))}
              </ul>
            ) : (
              "Configure hours to see timeline"
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
