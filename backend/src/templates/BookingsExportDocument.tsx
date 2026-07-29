export interface ExportBookingRow {
  bookingCode: string;
  customerName: string;
  phone: string;
  eventType: string;
  eventDate: Date;
  guestCount: number;
  grandTotal: number;
  status: string;
}

export async function BookingsExportDocument({
  bookings,
  businessName,
}: {
  bookings: ExportBookingRow[];
  businessName: string;
}) {
  // @react-pdf/renderer is ESM-only; dynamic import keeps this file loadable from CommonJS.
  const { Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');

  const styles = StyleSheet.create({
    page: { padding: 28, fontSize: 8, fontFamily: 'Helvetica' },
    title: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 12, color: '#17120f' },
    headerRow: {
      flexDirection: 'row',
      backgroundColor: '#17120f',
      color: '#f6efe0',
      paddingVertical: 5,
      paddingHorizontal: 4,
    },
    row: {
      flexDirection: 'row',
      borderBottom: '0.5pt solid #e7d9be',
      paddingVertical: 5,
      paddingHorizontal: 4,
    },
    cell: { flex: 1 },
  });

  return (
    <Document title={`${businessName} — Bookings Export`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>{businessName} — Bookings Export</Text>
        <View style={styles.headerRow}>
          <Text style={styles.cell}>Booking ID</Text>
          <Text style={styles.cell}>Customer</Text>
          <Text style={styles.cell}>Phone</Text>
          <Text style={styles.cell}>Event</Text>
          <Text style={styles.cell}>Date</Text>
          <Text style={styles.cell}>Guests</Text>
          <Text style={styles.cell}>Total</Text>
          <Text style={styles.cell}>Status</Text>
        </View>
        {bookings.map((b) => (
          <View style={styles.row} key={b.bookingCode}>
            <Text style={styles.cell}>{b.bookingCode}</Text>
            <Text style={styles.cell}>{b.customerName}</Text>
            <Text style={styles.cell}>{b.phone}</Text>
            <Text style={styles.cell}>{b.eventType}</Text>
            <Text style={styles.cell}>{new Date(b.eventDate).toLocaleDateString('en-IN')}</Text>
            <Text style={styles.cell}>{b.guestCount}</Text>
            <Text style={styles.cell}>Rs. {b.grandTotal.toLocaleString('en-IN')}</Text>
            <Text style={styles.cell}>{b.status}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
