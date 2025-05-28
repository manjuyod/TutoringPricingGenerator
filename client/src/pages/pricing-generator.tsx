import { useState } from "react";
import { GraduationCap } from "lucide-react";
import PricingForm from "@/components/PricingForm";
import LivePreview from "@/components/LivePreview";
import PDFGenerator from "@/components/PDFGenerator";
import { SubjectHours } from "@/lib/pricingCalculations";

export default function PricingGenerator() {
  const [formData, setFormData] = useState<{
    hourlyRate: number;
    weeklyHours: string;
    subjects: SubjectHours;
    packages: number[];
    prepayDiscounts: Record<string, number>;
    interestDiscounts: Record<string, number>;
  } | null>(null);
  
  const [isFormValid, setIsFormValid] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-tc-blue rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tc-blue">Tutoring Club</h1>
                  <p className="text-sm text-gray-600">Pricing Sheet Generator</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {formData && (
                <PDFGenerator formData={formData} isValid={isFormValid} />
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <PricingForm 
              onFormDataChange={setFormData}
              onValidityChange={setIsFormValid}
            />
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            {formData ? (
              <LivePreview 
                subjects={formData.subjects}
                weeklyHoursRange={formData.weeklyHours}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
                <p className="text-sm text-gray-600">Fill out the form to see a live preview of your pricing sheet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
