import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { PricingPDFDocument } from "@/lib/pdfUtils";
import { FileText, Download, Eye } from "lucide-react";
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
  if (!isValid) {
    return (
      <div className="flex items-center space-x-4">
        <Button disabled className="bg-tc-orange text-white">
          <Eye className="mr-2 h-4 w-4" />
          Preview PDF
        </Button>
        <Button disabled className="bg-tc-blue text-white">
          <Download className="mr-2 h-4 w-4" />
          Generate PDF
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-tc-orange hover:bg-tc-orange/90 text-white">
            <Eye className="mr-2 h-4 w-4" />
            Preview PDF
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>PDF Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <PDFViewer style={{ width: '100%', height: '100%' }}>
              <PricingPDFDocument formData={formData} />
            </PDFViewer>
          </div>
        </DialogContent>
      </Dialog>

      <PDFDownloadLink 
        document={<PricingPDFDocument formData={formData} />} 
        fileName="tutoring-club-pricing-sheet.pdf"
      >
        {({ loading }) => (
          <Button 
            className="bg-tc-blue hover:bg-tc-blue/90 text-white font-medium"
            disabled={loading}
          >
            <Download className="mr-2 h-4 w-4" />
            {loading ? 'Generating...' : 'Generate PDF'}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  );
}
