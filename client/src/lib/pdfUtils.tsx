
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
    fontSize: 10,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 30,
    backgroundColor: '#ffffff',
    color: '#1f2937',
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: '2 solid #e5e7eb',
  },
  logo: {
    width: 140,
    height: 46,
    marginRight: 20,
  },
  titleSection: {
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0063a8',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#f26a31',
    fontWeight: 500,
  },
  description: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 28,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    borderLeft: '4 solid #0063a8',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#0063a8',
    marginBottom: 12,
    marginTop: 20,
  },
  subjectList: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    border: '1 solid #e2e8f0',
  },
  subjectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    color: '#374151',
    borderBottom: '1 solid #e2e8f0',
  },
  subjectName: {
    fontSize: 11,
    fontWeight: 500,
  },
  subjectHours: {
    fontSize: 11,
    fontWeight: 700,
    color: '#0063a8',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  totalHours: {
    backgroundColor: '#0063a8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  totalHoursText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalHoursLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: '#ffffff',
  },
  totalHoursValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#ffffff',
  },
  timelineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  timelineCard: {
    backgroundColor: '#ffffff',
    border: '2 solid #e0f2fe',
    borderRadius: 12,
    padding: 16,
    width: '22%',
    alignItems: 'center',
    boxShadow: '0 1 3 rgba(0, 0, 0, 0.1)',
  },
  timelineHours: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0063a8',
    marginBottom: 4,
  },
  timelineLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineMonths: {
    fontSize: 11,
    fontWeight: 600,
    color: '#374151',
  },
  table: {
    backgroundColor: '#ffffff',
    border: '1 solid #e5e7eb',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    borderBottom: '2 solid #cbd5e1',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 12,
    fontSize: 9,
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #f1f5f9',
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1 solid #f1f5f9',
    backgroundColor: '#fafafa',
  },
  tableCell: {
    flex: 1,
    padding: 12,
    fontSize: 10,
    color: '#374151',
    fontWeight: 500,
  },
  tableCellBold: {
    flex: 1,
    padding: 12,
    fontSize: 10,
    color: '#111827',
    fontWeight: 700,
  },
  tableCellPrice: {
    flex: 1,
    padding: 12,
    fontSize: 10,
    color: '#0063a8',
    fontWeight: 700,
  },
  paymentDescription: {
    fontSize: 11,
    color: '#4b5563',
    marginBottom: 16,
    lineHeight: 1.5,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    fontStyle: 'italic',
  },
  planTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    marginTop: 16,
    color: '#0063a8',
    backgroundColor: '#e0f2fe',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    fontSize: 9,
    color: '#9ca3af',
  },
  highlight: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  savings: {
    color: '#059669',
    fontWeight: 700,
  },
  discount: {
    color: '#dc2626',
    fontWeight: 600,
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
          {selectedSubjects.map(({ name, hours }, index) => (
            <View key={name} style={[
              styles.subjectItem,
              index === selectedSubjects.length - 1 && { borderBottom: 'none' }
            ]}>
              <Text style={styles.subjectName}>{name}</Text>
              <Text style={styles.subjectHours}>{hours} hours</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalHours}>
          <View style={styles.totalHoursText}>
            <Text style={styles.totalHoursLabel}>Total Recommended Hours:</Text>
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

        <Text style={styles.pageNumber}>Page 1 of 2</Text>
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
          {monthlyOptions.map(({ hoursPerWeek, monthlyCost, hourlyRate: rate }, index) => (
            <View key={hoursPerWeek} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellBold}>{hoursPerWeek}</Text>
              <Text style={styles.tableCellPrice}>${monthlyCost.toFixed(2)}</Text>
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
          {prepayOptions.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, savings }, index) => (
            <View key={hours} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellBold}>{hours}</Text>
              <Text style={styles.tableCell}>${adjustedHourlyRate.toFixed(2)}</Text>
              <Text style={styles.tableCellPrice}>${totalCost.toFixed(2)}</Text>
              <Text style={styles.discount}>{discountPercent}%</Text>
              <Text style={styles.savings}>${savings.toFixed(2)}</Text>
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
        <Text style={styles.planTitle}>12 Month Plan</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Hours</Text>
            <Text style={styles.tableHeaderCell}>Adj. Rate</Text>
            <Text style={styles.tableHeaderCell}>Total</Text>
            <Text style={styles.tableHeaderCell}>Discount</Text>
            <Text style={styles.tableHeaderCell}>Monthly</Text>
            <Text style={styles.tableHeaderCell}>Savings</Text>
          </View>
          {financingOptions.twelveMonth.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }, index) => (
            <View key={hours} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellBold}>{hours}</Text>
              <Text style={styles.tableCell}>${adjustedHourlyRate.toFixed(2)}</Text>
              <Text style={styles.tableCellPrice}>${totalCost.toFixed(2)}</Text>
              <Text style={styles.discount}>{discountPercent}%</Text>
              <Text style={styles.tableCellPrice}>${monthlyCost.toFixed(2)}</Text>
              <Text style={styles.savings}>${savings.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* 18 Month Plan */}
        <Text style={styles.planTitle}>18 Month Plan</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Hours</Text>
            <Text style={styles.tableHeaderCell}>Adj. Rate</Text>
            <Text style={styles.tableHeaderCell}>Total</Text>
            <Text style={styles.tableHeaderCell}>Discount</Text>
            <Text style={styles.tableHeaderCell}>Monthly</Text>
            <Text style={styles.tableHeaderCell}>Savings</Text>
          </View>
          {financingOptions.eighteenMonth.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }, index) => (
            <View key={hours} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellBold}>{hours}</Text>
              <Text style={styles.tableCell}>${adjustedHourlyRate.toFixed(2)}</Text>
              <Text style={styles.tableCellPrice}>${totalCost.toFixed(2)}</Text>
              <Text style={styles.discount}>{discountPercent}%</Text>
              <Text style={styles.tableCellPrice}>${monthlyCost.toFixed(2)}</Text>
              <Text style={styles.savings}>${savings.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* 24 Month Plan */}
        <Text style={styles.planTitle}>24 Month Plan</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Hours</Text>
            <Text style={styles.tableHeaderCell}>Adj. Rate</Text>
            <Text style={styles.tableHeaderCell}>Total</Text>
            <Text style={styles.tableHeaderCell}>Discount</Text>
            <Text style={styles.tableHeaderCell}>Monthly</Text>
            <Text style={styles.tableHeaderCell}>Savings</Text>
          </View>
          {financingOptions.twentyFourMonth.map(({ hours, adjustedHourlyRate, totalCost, discountPercent, monthlyCost, savings }, index) => (
            <View key={hours} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellBold}>{hours}</Text>
              <Text style={styles.tableCell}>${adjustedHourlyRate.toFixed(2)}</Text>
              <Text style={styles.tableCellPrice}>${totalCost.toFixed(2)}</Text>
              <Text style={styles.discount}>{discountPercent}%</Text>
              <Text style={styles.tableCellPrice}>${monthlyCost.toFixed(2)}</Text>
              <Text style={styles.savings}>${savings.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.pageNumber}>Page 2 of 2</Text>
      </Page>
    </Document>
  );
}
