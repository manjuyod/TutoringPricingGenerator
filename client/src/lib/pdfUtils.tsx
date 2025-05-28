import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { SubjectHours, calculateTotalHours, getSelectedSubjects, calculateTimeline, calculateMonthlyPaymentOptions, calculatePrepayOptions, calculateFinancingOptions } from './pricingCalculations';
import logoPath from '@assets/TC Horizontal.png';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2', fontWeight: 700 },
  ]
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 11,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 40,
    marginRight: 16,
  },
  titleSection: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0063a8',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#f26a31',
  },
  description: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#1f2937',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 8,
  },
  subjectList: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  subjectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    color: '#374151',
  },
  totalHours: {
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  totalHoursText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
  },
  totalHoursValue: {
    color: '#0063a8',
  },
  timelineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  timelineCard: {
    backgroundColor: '#ffffff',
    border: '1 solid #e5e7eb',
    borderRadius: 8,
    padding: 12,
    width: '23%',
    alignItems: 'center',
  },
  timelineHours: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0063a8',
  },
  timelineLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginVertical: 2,
  },
  timelineMonths: {
    fontSize: 10,
    fontWeight: 500,
    color: '#374151',
  },
  table: {
    backgroundColor: '#ffffff',
    border: '1 solid #e5e7eb',
    borderRadius: 8,
    marginBottom: 16,
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 12,
    fontSize: 10,
    fontWeight: 600,
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #f3f4f6',
  },
  tableCell: {
    flex: 1,
    padding: 12,
    fontSize: 10,
    color: '#374151',
  },
  paymentDescription: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 1.5,
  },
  pageBreak: {
    marginTop: 40,
  },
});

interface PDFDocumentProps {
  formData: {
    hourlyRate: number;
    weeklyHours: string;
    subjects: SubjectHours;
    packages: number[];
    prepayDiscounts: Record<string, number>;
    interestDiscounts: Record<string, number>;
  };
}

export function PricingPDFDocument({ formData }: PDFDocumentProps) {
  const { hourlyRate, weeklyHours, subjects, packages, prepayDiscounts, interestDiscounts } = formData;
  
  const totalHours = calculateTotalHours(subjects);
  const selectedSubjects = getSelectedSubjects(subjects);
  const timeline = calculateTimeline(totalHours, weeklyHours);
  const monthlyOptions = calculateMonthlyPaymentOptions(hourlyRate, weeklyHours);
  const prepayOptions = calculatePrepayOptions(totalHours, hourlyRate, packages, prepayDiscounts);
  const financingOptions = calculateFinancingOptions(totalHours, hourlyRate, packages, interestDiscounts);

  return (
    <Document>
      {/* Page 1: Academic Game Plan */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={logoPath} />
          <View style={styles.titleSection}>
            <Text style={styles.title}>Academic Game Plan</Text>
            <Text style={styles.subtitle}>Tutoring Club</Text>
          </View>
        </View>

        <Text style={styles.description}>
          At Tutoring Club, we believe every student has the potential to thrive—with the right support. 
          Based on your academic goals and our in-depth assessment, we've put together a customized roadmap 
          designed to close learning gaps, build confidence, and get results.
        </Text>

        <Text style={styles.sectionTitle}>Recommended Sessions by Subject</Text>
        <View style={styles.subjectList}>
          {selectedSubjects.map(({ name, hours }) => (
            <View key={name} style={styles.subjectItem}>
              <Text>{name}</Text>
              <Text style={{ fontWeight: 500 }}>{hours} hours</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalHours}>
          <View style={styles.totalHoursText}>
            <Text>Total Recommended Hours:</Text>
            <Text style={styles.totalHoursValue}>{totalHours} hours</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recommended Timeline</Text>
        <View style={styles.timelineContainer}>
          {timeline.map(({ hoursPerWeek, months }) => (
            <View key={hoursPerWeek} style={styles.timelineCard}>
              <Text style={styles.timelineHours}>{hoursPerWeek}</Text>
              <Text style={styles.timelineLabel}>hours/week</Text>
              <Text style={styles.timelineMonths}>{months} months</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* Page 2: Tuition Payment Options */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={logoPath} />
          <Text style={styles.title}>Tuition Payment Options</Text>
        </View>

        {/* Monthly Tuition Option */}
        <Text style={styles.subsectionTitle}>Monthly Tuition Option</Text>
        <Text style={styles.paymentDescription}>
          Pay as you go on a monthly basis at our standard hourly rate. Testing fee: $75. Registration fee: $100.
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Hours/Week</Text>
            <Text style={styles.tableHeaderCell}>Monthly Cost</Text>
            <Text style={styles.tableHeaderCell}>Hourly Rate</Text>
          </View>
          {monthlyOptions.map(({ hoursPerWeek, monthlyCost, hourlyRate: rate }) => (
            <View key={hoursPerWeek} style={styles.tableRow}>
              <Text style={styles.tableCell}>{hoursPerWeek}</Text>
              <Text style={styles.tableCell}>${monthlyCost.toFixed(2)}</Text>
              <Text style={styles.tableCell}>${rate.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Prepay Tuition Option */}
        <Text style={styles.subsectionTitle}>Prepay Tuition Option</Text>
        <Text style={styles.paymentDescription}>
          No testing or registration fees. Flexible scheduling.
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Hours</Text>
            <Text style={styles.tableHeaderCell}>Adj. Rate</Text>
            <Text style={styles.tableHeaderCell}>Total Cost</Text>
            <Text style={styles.tableHeaderCell}>Discount</Text>
            <Text style={styles.tableHeaderCell}>Savings</Text>
          </View>
          {prepayOptions.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, savings }) => (
            <View key={hours} style={styles.tableRow}>
              <Text style={styles.tableCell}>{hours}</Text>
              <Text style={styles.tableCell}>${adjustedHourlyRate.toFixed(2)}</Text>
              <Text style={styles.tableCell}>${totalCost.toFixed(2)}</Text>
              <Text style={styles.tableCell}>{discountPercent}%</Text>
              <Text style={styles.tableCell}>${savings.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* 0% Interest Tuition Options */}
        <Text style={styles.subsectionTitle}>0% Interest Tuition Option</Text>
        <Text style={styles.paymentDescription}>
          No testing or registration fees. Flexible scheduling. No payments for 4-6 weeks. 
          No out-of-pocket expenses or down payments. Early prepayment allowed. On approved credit.
        </Text>

        {/* 12 Month Plan */}
        <Text style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>12 Month Plan</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Hours</Text>
            <Text style={styles.tableHeaderCell}>Adj. Rate</Text>
            <Text style={styles.tableHeaderCell}>Total</Text>
            <Text style={styles.tableHeaderCell}>Discount</Text>
            <Text style={styles.tableHeaderCell}>Monthly</Text>
            <Text style={styles.tableHeaderCell}>Savings</Text>
          </View>
          {financingOptions.twelveMonth.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }) => (
            <View key={hours} style={styles.tableRow}>
              <Text style={styles.tableCell}>{hours}</Text>
              <Text style={styles.tableCell}>${adjustedHourlyRate.toFixed(2)}</Text>
              <Text style={styles.tableCell}>${totalCost.toFixed(2)}</Text>
              <Text style={styles.tableCell}>{discountPercent}%</Text>
              <Text style={styles.tableCell}>${monthlyCost.toFixed(2)}</Text>
              <Text style={styles.tableCell}>${savings.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* 18 Month Plan */}
        <Text style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, marginTop: 12 }}>18 Month Plan</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Hours</Text>
            <Text style={styles.tableHeaderCell}>Adj. Rate</Text>
            <Text style={styles.tableHeaderCell}>Total</Text>
            <Text style={styles.tableHeaderCell}>Discount</Text>
            <Text style={styles.tableHeaderCell}>Monthly</Text>
            <Text style={styles.tableHeaderCell}>Savings</Text>
          </View>
          {financingOptions.eighteenMonth.slice(0, 2).map(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }) => (
            <View key={hours} style={styles.tableRow}>
              <Text style={styles.tableCell}>{hours}</Text>
              <Text style={styles.tableCell}>${adjustedHourlyRate.toFixed(2)}</Text>
              <Text style={styles.tableCell}>${totalCost.toFixed(2)}</Text>
              <Text style={styles.tableCell}>{discountPercent}%</Text>
              <Text style={styles.tableCell}>${monthlyCost.toFixed(2)}</Text>
              <Text style={styles.tableCell}>${savings.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* 24 Month Plan */}
        <Text style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, marginTop: 12 }}>24 Month Plan</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Hours</Text>
            <Text style={styles.tableHeaderCell}>Adj. Rate</Text>
            <Text style={styles.tableHeaderCell}>Total</Text>
            <Text style={styles.tableHeaderCell}>Discount</Text>
            <Text style={styles.tableHeaderCell}>Monthly</Text>
            <Text style={styles.tableHeaderCell}>Savings</Text>
          </View>
          {financingOptions.twentyFourMonth.slice(0, 2).map(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }) => (
            <View key={hours} style={styles.tableRow}>
              <Text style={styles.tableCell}>{hours}</Text>
              <Text style={styles.tableCell}>${adjustedHourlyRate.toFixed(2)}</Text>
              <Text style={styles.tableCell}>${totalCost.toFixed(2)}</Text>
              <Text style={styles.tableCell}>{discountPercent}%</Text>
              <Text style={styles.tableCell}>${monthlyCost.toFixed(2)}</Text>
              <Text style={styles.tableCell}>${savings.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
