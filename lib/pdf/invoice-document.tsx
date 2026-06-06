/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { COLORS, FONTS, SPACING, TYPE } from "./tokens"
import type { Invoice, InvoiceItem } from "@prisma/client"

export interface PdfBusinessContext {
  agencyName?: string
  contactEmail?: string
  website?: string
  address?: string
  gstNumber?: string
  bankDetails?: string
}

type InvoiceWithItems = Invoice & { items: InvoiceItem[] }

const s = StyleSheet.create({
  page: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.pagePaddingH,
    paddingTop: SPACING.pagePaddingV,
    paddingBottom: 60,
    fontFamily: FONTS.regular,
  },
  
  // Header
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 },
  headerLeft: { flex: 1 },
  headerRight: { flex: 1, alignItems: "flex-end" },
  
  agencyName: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.black, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
  agencyInfo: { fontSize: TYPE.small, color: COLORS.muted, lineHeight: 1.5 },
  
  invoiceTitle: { fontSize: 24, fontFamily: FONTS.bold, color: COLORS.body, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  invoiceMetaRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 },
  invoiceMetaLabel: { fontSize: TYPE.small, color: COLORS.muted, width: 80, textAlign: "right", marginRight: 8 },
  invoiceMetaValue: { fontSize: TYPE.small, fontFamily: FONTS.bold, color: COLORS.black, width: 80, textAlign: "right" },
  
  // Client Info
  clientSection: { marginBottom: 30 },
  clientHeading: { fontSize: TYPE.sectionHeading, fontFamily: FONTS.bold, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  clientName: { fontSize: TYPE.body, fontFamily: FONTS.bold, color: COLORS.black, marginBottom: 4 },
  clientInfo: { fontSize: TYPE.body, color: COLORS.body, lineHeight: 1.5 },

  // Table
  table: { marginTop: 10, marginBottom: 20 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: COLORS.subtle, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 8 },
  
  thDesc: { flex: 3, fontSize: TYPE.tableHeader, fontFamily: FONTS.bold, color: COLORS.muted, paddingHorizontal: 12, paddingVertical: 8, textTransform: "uppercase", letterSpacing: 0.6 },
  thQty: { width: 50, fontSize: TYPE.tableHeader, fontFamily: FONTS.bold, color: COLORS.muted, paddingHorizontal: 12, paddingVertical: 8, textTransform: "uppercase", letterSpacing: 0.6, textAlign: "right" },
  thPrice: { width: 80, fontSize: TYPE.tableHeader, fontFamily: FONTS.bold, color: COLORS.muted, paddingHorizontal: 12, paddingVertical: 8, textTransform: "uppercase", letterSpacing: 0.6, textAlign: "right" },
  thTotal: { width: 90, fontSize: TYPE.tableHeader, fontFamily: FONTS.bold, color: COLORS.muted, paddingHorizontal: 12, paddingVertical: 8, textTransform: "uppercase", letterSpacing: 0.6, textAlign: "right" },
  
  tdDesc: { flex: 3, fontSize: TYPE.tableCell, color: COLORS.body, paddingHorizontal: 12, lineHeight: 1.5 },
  tdQty: { width: 50, fontSize: TYPE.tableCell, color: COLORS.body, paddingHorizontal: 12, textAlign: "right" },
  tdPrice: { width: 80, fontSize: TYPE.tableCell, color: COLORS.body, paddingHorizontal: 12, textAlign: "right" },
  tdTotal: { width: 90, fontSize: TYPE.tableCell, fontFamily: FONTS.bold, color: COLORS.black, paddingHorizontal: 12, textAlign: "right" },

  // Totals Area
  totalsArea: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  totalsLeft: { flex: 1, paddingRight: 40 },
  totalsRight: { width: 220 },
  
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  totalLabel: { fontSize: TYPE.body, color: COLORS.muted },
  totalValue: { fontSize: TYPE.body, color: COLORS.body, textAlign: "right" },
  
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 4 },
  grandTotalLabel: { fontSize: TYPE.body, fontFamily: FONTS.bold, color: COLORS.black },
  grandTotalValue: { fontSize: TYPE.body, fontFamily: FONTS.bold, color: COLORS.black, textAlign: "right" },

  // Notes & Bank Details
  notesBox: { marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  notesHeading: { fontSize: TYPE.sectionHeading, fontFamily: FONTS.bold, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  notesText: { fontSize: TYPE.small, color: COLORS.body, lineHeight: 1.6 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: SPACING.pagePaddingH,
    right: SPACING.pagePaddingH,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.75,
    borderTopColor: COLORS.border,
    paddingTop: 9,
  },
  footerText: { fontSize: TYPE.footer, color: COLORS.faint, letterSpacing: 0.3 },
})

export function InvoicePdfDocument({
  invoice,
  business,
}: {
  invoice: InvoiceWithItems
  business?: PdfBusinessContext
}) {
  const agencyName = business?.agencyName ?? "Outpero"
  const issueDate = new Date(invoice.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  const dueDate = new Date(invoice.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  return (
    <Document
      title={`Invoice ${invoice.invoiceNumber}`}
      author={agencyName}
      subject="Invoice"
      creator={agencyName}
    >
      <Page size="A4" style={s.page}>
        
        {/* Header */}
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Text style={s.agencyName}>{agencyName}</Text>
            {business?.address && <Text style={s.agencyInfo}>{business.address}</Text>}
            {business?.contactEmail && <Text style={s.agencyInfo}>{business.contactEmail}</Text>}
            {business?.website && <Text style={s.agencyInfo}>{business.website}</Text>}
            {business?.gstNumber && <Text style={s.agencyInfo}>GST: {business.gstNumber}</Text>}
          </View>
          <View style={s.headerRight}>
            <Text style={s.invoiceTitle}>INVOICE</Text>
            
            <View style={s.invoiceMetaRow}>
              <Text style={s.invoiceMetaLabel}>Invoice No:</Text>
              <Text style={s.invoiceMetaValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={s.invoiceMetaRow}>
              <Text style={s.invoiceMetaLabel}>Issue Date:</Text>
              <Text style={s.invoiceMetaValue}>{issueDate}</Text>
            </View>
            <View style={s.invoiceMetaRow}>
              <Text style={s.invoiceMetaLabel}>Due Date:</Text>
              <Text style={s.invoiceMetaValue}>{dueDate}</Text>
            </View>
          </View>
        </View>

        {/* Client Info */}
        <View style={s.clientSection}>
          <Text style={s.clientHeading}>Billed To</Text>
          <Text style={s.clientName}>{invoice.clientName}</Text>
          {invoice.companyName && <Text style={s.clientInfo}>{invoice.companyName}</Text>}
          {invoice.billingAddress && <Text style={s.clientInfo}>{invoice.billingAddress}</Text>}
          {invoice.gstEnabled && invoice.gstNumber && <Text style={s.clientInfo}>GST: {invoice.gstNumber}</Text>}
        </View>

        {/* Line Items */}
        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            <Text style={s.thDesc}>Description</Text>
            <Text style={s.thQty}>Qty</Text>
            <Text style={s.thPrice}>Price</Text>
            <Text style={s.thTotal}>Total</Text>
          </View>
          
          {invoice.items.map((item, i) => (
            <View key={item.id} style={s.tableRow}>
              <Text style={s.tdDesc}>{item.description}</Text>
              <Text style={s.tdQty}>{item.quantity}</Text>
              <Text style={s.tdPrice}>${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              <Text style={s.tdTotal}>${item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          ))}
        </View>

        {/* Totals & Payment Info */}
        <View style={s.totalsArea}>
          <View style={s.totalsLeft}>
            {business?.bankDetails && (
              <View>
                <Text style={s.notesHeading}>Payment Info</Text>
                <Text style={s.notesText}>{business.bankDetails}</Text>
              </View>
            )}
          </View>
          <View style={s.totalsRight}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal:</Text>
              <Text style={s.totalValue}>${invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
            {invoice.gstEnabled && invoice.gstAmount > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>GST ({invoice.gstPercentage}%):</Text>
                <Text style={s.totalValue}>${invoice.gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
            )}
            <View style={s.grandTotalRow}>
              <Text style={s.grandTotalLabel}>Grand Total:</Text>
              <Text style={s.grandTotalValue}>${invoice.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={s.notesBox}>
            <Text style={s.notesHeading}>Notes</Text>
            <Text style={s.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{agencyName}  ·  Thank you for your business</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  )
}
