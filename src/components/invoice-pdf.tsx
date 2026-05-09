"use client";

import { Document, Page, Text, View, StyleSheet, Font, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Unit } from '@prisma/client';

// Register Noto Sans Devanagari font for Hindi support
Font.register({
  family: 'Noto Sans Devanagari',
  src: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-devanagari@latest/utf8-400.woff'
});

Font.register({
  family: 'Noto Sans Devanagari Bold',
  src: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-devanagari@latest/utf8-700.woff'
});

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Noto Sans Devanagari', fontSize: 10 },
  headerContainer: { flexDirection: 'row', backgroundColor: '#15803d', padding: 20, borderRadius: 5, color: '#ffffff', marginBottom: 20 },
  shopInfo: { flex: 1 },
  shopName: { fontFamily: 'Noto Sans Devanagari Bold', fontSize: 24, color: '#facc15', marginBottom: 5 },
  shopAddress: { fontSize: 10, color: '#ecfdf5' },
  shopPhone: { fontSize: 10, color: '#ecfdf5', marginTop: 2 },
  invoiceBox: { alignItems: 'flex-end', justifyContent: 'center' },
  invoiceTitle: { fontFamily: 'Noto Sans Devanagari Bold', fontSize: 18, color: '#ffffff', letterSpacing: 1 },
  invoiceNo: { fontSize: 10, marginTop: 5, color: '#ecfdf5' },
  customerBox: { backgroundColor: '#f0fdf4', padding: 15, borderRadius: 5, marginBottom: 20, borderLeft: '3px solid #16a34a' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 80, color: '#166534', fontFamily: 'Noto Sans Devanagari Bold' },
  value: { flex: 1, color: '#1f2937' },
  table: { marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#15803d', color: '#ffffff', padding: 8, fontFamily: 'Noto Sans Devanagari Bold', borderRadius: 3 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', padding: 8 },
  colSr: { width: '8%', textAlign: 'center' },
  colName: { width: '40%' },
  colQty: { width: '15%', textAlign: 'center' },
  colRate: { width: '15%', textAlign: 'right' },
  colAmt: { width: '22%', textAlign: 'right' },
  totalBox: { marginTop: 20, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', width: 220, paddingVertical: 4, paddingHorizontal: 10 },
  totalLabel: { flex: 1, fontFamily: 'Noto Sans Devanagari Bold', color: '#374151' },
  totalValue: { width: 80, textAlign: 'right', color: '#111827' },
  grandTotalRow: { backgroundColor: '#f0fdf4', borderTopWidth: 2, borderTopColor: '#16a34a', marginTop: 5, paddingVertical: 8 },
  grandTotalLabel: { flex: 1, fontFamily: 'Noto Sans Devanagari Bold', fontSize: 12, color: '#166534' },
  grandTotalValue: { width: 80, textAlign: 'right', fontFamily: 'Noto Sans Devanagari Bold', fontSize: 12, color: '#15803d' },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', color: '#6b7280', fontSize: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 },
  thanks: { fontFamily: 'Noto Sans Devanagari Bold', color: '#15803d', fontSize: 12, marginBottom: 4 }
});

interface InvoicePDFProps {
  invoice: any;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
}

export const InvoiceDocument = ({ invoice, shopName, shopAddress, shopPhone }: InvoicePDFProps) => {
  const dateStr = new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>{shopName}</Text>
            <Text style={styles.shopAddress}>{shopAddress}</Text>
            <Text style={styles.shopPhone}>संपर्क: {shopPhone}</Text>
          </View>
          <View style={styles.invoiceBox}>
            <Text style={styles.invoiceTitle}>INVOICE / बिल</Text>
            <Text style={styles.invoiceNo}>Bill No: {invoice.invoiceNo}</Text>
            <Text style={styles.invoiceNo}>Date: {dateStr}</Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.customerBox}>
          <View style={styles.row}>
            <Text style={styles.label}>ग्राहकचे नाव:</Text>
            <Text style={styles.value}>{invoice.customerName}</Text>
          </View>
          {invoice.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>मोबाईल नं:</Text>
              <Text style={styles.value}>{invoice.phone}</Text>
            </View>
          )}
          {invoice.address && (
            <View style={styles.row}>
              <Text style={styles.label}>पत्ता:</Text>
              <Text style={styles.value}>{invoice.address}</Text>
            </View>
          )}
          {invoice.gstin && (
            <View style={styles.row}>
              <Text style={styles.label}>GSTIN:</Text>
              <Text style={styles.value}>{invoice.gstin}</Text>
            </View>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colSr}>अ.क्र</Text>
            <Text style={styles.colName}>तपशील (Particulars)</Text>
            <Text style={styles.colQty}>प्रमाण</Text>
            <Text style={styles.colRate}>दर (₹)</Text>
            <Text style={styles.colAmt}>रक्कम (₹)</Text>
          </View>
          {invoice.items.map((item: any, i: number) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colSr}>{i + 1}</Text>
              <View style={styles.colName}>
                <Text>{item.nameHindi}</Text>
              </View>
              <Text style={styles.colQty}>{item.proof || item.quantity} {item.unit}</Text>
              <Text style={styles.colRate}>{item.rate.toFixed(2)}</Text>
              <Text style={styles.colAmt}>{item.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{invoice.subtotal.toFixed(2)}</Text>
          </View>
          {invoice.gstRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST ({invoice.gstRate}%)</Text>
              <Text style={styles.totalValue}>{invoice.gstAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₹ {invoice.grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.thanks}>धन्यवाद ! पुन्हा भेट द्या !</Text>
          <Text>Thank You • Visit Again</Text>
        </View>
      </Page>
    </Document>
  );
};
