import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info, Book, Package, Percent } from "lucide-react";
import { pricingFormSchema, defaultPrepayDiscounts, defaultInterestDiscounts, type PricingFormData } from "@shared/schema";
import { useEffect, useState } from "react";

interface PricingFormProps {
  onFormDataChange: (data: {
    hourlyRate: number;
    weeklyHours: string;
    subjects: {
      "Beginning Reading/Phonics": number;
      "Reading": number;
      "Writing": number;
      "Math": number;
      "TutorUp": number;
      "Test Prep": number;
    };
    packages: number[];
    prepayDiscounts: Record<string, number>;
    interestDiscounts: Record<string, number>;
  }) => void;
  onValidityChange: (isValid: boolean) => void;
}

export default function PricingForm({ onFormDataChange, onValidityChange }: PricingFormProps) {
  const [selectedPackageRange, setSelectedPackageRange] = useState<string>("");

  const form = useForm<PricingFormData>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      hourlyRate: 0,
      weeklyHours: undefined,
      beginningReading: 0,
      reading: 0,
      writing: 0,
      math: 0,
      tutorUp: 0,
      testPrep: 0,
      packageRange: undefined,
      prepayDiscounts: {},
      interestDiscounts: {},
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    const isValid = form.formState.isValid && 
      watchedValues.hourlyRate > 0 && 
      watchedValues.weeklyHours && 
      watchedValues.packageRange;
    
    onValidityChange(isValid);

    if (isValid) {
      const packages = watchedValues.packageRange!.split(',').map(Number);
      onFormDataChange({
        hourlyRate: watchedValues.hourlyRate,
        weeklyHours: watchedValues.weeklyHours!,
        subjects: {
          "Beginning Reading/Phonics": watchedValues.beginningReading,
          "Reading": watchedValues.reading,
          "Writing": watchedValues.writing,
          "Math": watchedValues.math,
          "TutorUp": watchedValues.tutorUp,
          "Test Prep": watchedValues.testPrep,
        },
        packages,
        prepayDiscounts: watchedValues.prepayDiscounts,
        interestDiscounts: watchedValues.interestDiscounts,
      });
    }
  }, [watchedValues, form.formState.isValid, onFormDataChange, onValidityChange]);

  useEffect(() => {
    if (watchedValues.packageRange && watchedValues.packageRange !== selectedPackageRange) {
      setSelectedPackageRange(watchedValues.packageRange);
      const packages = watchedValues.packageRange.split(',');
      
      // Set default discount values
      const newPrepayDiscounts: Record<string, number> = {};
      const newInterestDiscounts: Record<string, number> = {};
      
      packages.forEach(pkg => {
        newPrepayDiscounts[pkg] = defaultPrepayDiscounts[pkg as keyof typeof defaultPrepayDiscounts] || 0;
        newInterestDiscounts[pkg] = defaultInterestDiscounts[pkg as keyof typeof defaultInterestDiscounts] || 0;
      });
      
      form.setValue('prepayDiscounts', newPrepayDiscounts);
      form.setValue('interestDiscounts', newInterestDiscounts);
    }
  }, [watchedValues.packageRange, selectedPackageRange, form]);

  // Generate hour options (16-400 in increments of 16)
  const hourOptions = [];
  for (let i = 16; i <= 400; i += 16) {
    hourOptions.push(i);
  }

  const packages = selectedPackageRange ? selectedPackageRange.split(',') : [];

  return (
    <div className="space-y-6">
      <Form {...form}>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Info className="mr-2 h-5 w-5 tc-blue" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Tutoring Rate ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="$50"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0)}
                      className="focus:ring-2 focus:ring-tc-blue focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weeklyHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommended Hours Per Week</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="focus:ring-2 focus:ring-tc-blue focus:border-transparent">
                        <SelectValue placeholder="Select Range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="2-8">2-8 hours per week</SelectItem>
                      <SelectItem value="4-16">4-16 hours per week</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Subject Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Book className="mr-2 h-5 w-5 tc-orange" />
              Subject Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'beginningReading', label: 'Beginning Reading/Phonics (hours)' },
              { name: 'reading', label: 'Reading (hours)' },
              { name: 'writing', label: 'Writing (hours)' },
              { name: 'math', label: 'Math (hours)' },
              { name: 'tutorUp', label: 'TutorUp (hours)' },
              { name: 'testPrep', label: 'Test Prep (hours)' },
            ].map(({ name, label }) => (
              <FormField
                key={name}
                control={form.control}
                name={name as keyof PricingFormData}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="focus:ring-2 focus:ring-tc-blue focus:border-transparent">
                          <SelectValue placeholder="No sessions" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">No sessions</SelectItem>
                        {hourOptions.map(hours => (
                          <SelectItem key={hours} value={hours.toString()}>
                            {hours} hours
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>

        {/* Package Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Package className="mr-2 h-5 w-5 tc-blue" />
              Package Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="packageRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium mb-3 block">Choose Package Range:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-2"
                    >
                      {[
                        { value: "64,96,128,192", label: "Package A: 64, 96, 128, 192 hours" },
                        { value: "96,128,160,192", label: "Package B: 96, 128, 160, 192 hours" },
                        { value: "96,128,192,256", label: "Package C: 96, 128, 192, 256 hours" },
                        { value: "128,256,320,400", label: "Package D: 128, 256, 320, 400 hours" },
                      ].map(({ value, label }) => (
                        <div key={value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={value} id={value} className="text-tc-blue" />
                          <label htmlFor={value} className="cursor-pointer flex-1">
                            {label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Discount Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Percent className="mr-2 h-5 w-5 tc-orange" />
              Discount Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prepay Discounts */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Prepay Discounts (%)</h4>
                  <div className="space-y-3">
                    {packages.map(pkg => (
                      <FormField
                        key={`prepay-${pkg}`}
                        control={form.control}
                        name={`prepayDiscounts.${pkg}` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{pkg} hours - Prepay Discount (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={defaultPrepayDiscounts[pkg as keyof typeof defaultPrepayDiscounts]?.toString() || "0"}
                                step="0.1"
                                min="0"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="focus:ring-2 focus:ring-tc-blue focus:border-transparent"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Interest Discounts */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">0% Interest Discounts (12 month) (%)</h4>
                  <div className="space-y-3">
                    {packages.map(pkg => (
                      <FormField
                        key={`interest-${pkg}`}
                        control={form.control}
                        name={`interestDiscounts.${pkg}` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{pkg} hours - Interest Discount (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={defaultInterestDiscounts[pkg as keyof typeof defaultInterestDiscounts]?.toString() || "0"}
                                step="0.1"
                                min="0"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="focus:ring-2 focus:ring-tc-blue focus:border-transparent"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Select a package range above to configure discounts.</p>
            )}
          </CardContent>
        </Card>
      </Form>
    </div>
  );
}
