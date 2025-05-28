import { Button } from "@/components/ui/button";
import { pdf } from '@react-pdf/renderer';
import { PricingPDFDocument } from '@/lib/pdfUtils';
import { FileText, Download } from "lucide-react";
import { SubjectHours } from "@/lib/pricingCalculations";

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
  const handleGeneratePDF = async () => {
    if (isValid && formData) {
      try {
        const blob = await pdf(<PricingPDFDocument formData={formData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tutoring-club-pricing-sheet.pdf';
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating PDF:', error);
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
        className="bg-tc-blue hover:bg-tc-blue/90 text-white font-medium"
      >
        <Download className="mr-2 h-4 w-4" />
        Generate PDF
      </Button>
    </div>
  );
}
