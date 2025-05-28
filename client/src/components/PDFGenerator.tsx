import { Button } from "@/components/ui/button";
import { generateAdvancedPricingPDF } from "@/lib/htmlToPdfGenerator";
import { FileText, Download } from "lucide-react";
import { SubjectHours } from "@/lib/pricingCalculations";
import { useState } from "react";

interface PDFGeneratorProps {
  formData: {
    hourlyRate: number;
    weeklyHours: string;
    subjects: SubjectHours;
    packages: number[];
    prepayDiscounts: Record<string, number>;
    interestDiscounts: Record<string, number>;
  };
  isValid: boolean;
}

export default function PDFGenerator({ formData, isValid }: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    if (isValid && formData && !isGenerating) {
      setIsGenerating(true);
      try {
        await generateAdvancedPricingPDF(formData);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  if (!isValid) {
    return (
      <div className="flex items-center space-x-4">
        <Button disabled className="bg-tc-blue text-white">
          <Download className="mr-2 h-4 w-4" />
          Generate PDF
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Button 
        onClick={handleGeneratePDF}
        disabled={isGenerating}
        className="bg-tc-blue hover:bg-tc-blue/90 text-white font-medium"
      >
        <Download className="mr-2 h-4 w-4" />
        {isGenerating ? 'Generating...' : 'Generate PDF'}
      </Button>
    </div>
  );
}
