const colors = {
  inkBlack: '#17120f',
  gold: '#c9a227',
  rose: '#e0447f',
  cream: '#f6efe0',
  border: '#e7d9be',
  textMuted: '#6b5d52',
};

export interface QuotationBookingData {
  bookingCode: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  eventDate: Date;
  eventTime: string;
  eventType: string;
  guestCount: number;
  package: { name: string } | null;
  groupedItems: {
    categoryName: string;
    items: string[];
  }[];
}

export interface QuotationBusinessData {
  name: string;
  phone: string;
  address: string;
}

const TERMS = [
  'This is a summary of your selections and is subject to final confirmation by our team.',
  'Availability may vary based on seasonal factors and final guest count.',
  'A booking is confirmed only after written confirmation from the business.',
];

export async function QuotationDocument({
  booking,
  business,
}: {
  booking: QuotationBookingData;
  business: QuotationBusinessData;
}) {
  // @react-pdf/renderer is ESM-only; dynamic import keeps this file loadable from CommonJS.
  const { Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');

  const styles = StyleSheet.create({
    page: { padding: 32, fontSize: 10, color: '#221a15', fontFamily: 'Helvetica' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.inkBlack,
      color: colors.cream,
      padding: 20,
      borderRadius: 6,
      marginBottom: 20,
    },
    logoBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      border: `1.5pt solid ${colors.gold}`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoBadgeText: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: colors.gold },
    businessName: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: colors.gold },
    quotationTitle: { fontSize: 12, color: colors.rose, marginTop: 6, fontFamily: 'Helvetica-Bold' },
    section: { marginBottom: 16 },
    sectionTitle: {
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
      color: colors.inkBlack,
      marginBottom: 6,
      borderBottom: `1pt solid ${colors.gold}`,
      paddingBottom: 4,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    label: { color: colors.textMuted },
    value: { fontFamily: 'Helvetica-Bold' },
    table: { borderTop: `1pt solid ${colors.border}` },
    tableRow: {
      paddingVertical: 5,
      borderBottom: `1pt solid ${colors.border}`,
    },
    terms: { fontSize: 8, color: colors.textMuted, lineHeight: 1.5 },
    footer: { marginTop: 24, textAlign: 'center', color: colors.textMuted, fontSize: 8 },
  });

  return (
    <Document title={`${business.name} - Booking Summary ${booking.bookingCode}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>{business.name.trim().charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.businessName}>{business.name}</Text>
            <Text style={styles.quotationTitle}>Booking Summary — {booking.bookingCode}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{booking.customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{booking.phone}</Text>
          </View>
          {booking.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{booking.email}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{booking.address}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Event Type</Text>
            <Text style={styles.value}>{booking.eventType}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date &amp; Time</Text>
            <Text style={styles.value}>
              {new Date(booking.eventDate).toLocaleDateString('en-IN')} at {booking.eventTime}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Guest Count</Text>
            <Text style={styles.value}>{booking.guestCount}</Text>
          </View>
        </View>

        {booking.package && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Package</Text>
            <View style={styles.tableRow}>
              <Text>{booking.package.name}</Text>
            </View>
          </View>
        )}

        {booking.groupedItems.map((group) => (
          <View style={styles.section} key={group.categoryName}>
            <Text style={styles.sectionTitle}>{group.categoryName}</Text>
            <View style={styles.table}>
              {group.items.map((name, i) => (
                <View style={styles.tableRow} key={i}>
                  <Text>{name}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms &amp; Conditions</Text>
          {TERMS.map((term, i) => (
            <Text key={i} style={styles.terms}>
              {i + 1}. {term}
            </Text>
          ))}
        </View>

        <Text style={styles.footer}>
          {business.name} · +91 {business.phone} · {business.address}
        </Text>
      </Page>
    </Document>
  );
}
