/* eslint-disable @typescript-eslint/no-explicit-any */
import "@/lib/pdf/fonts"
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { COLORS, FONTS } from "./tokens"
import { AgencyLogo } from "./logo"

export interface PdfBusinessContext {
  agencyName?: string
  contactEmail?: string
  website?: string
  address?: string
  gstNumber?: string
  bankDetails?: string
  logoUrl?: string
  primaryColor?: string
}

function LogoBlock({
  logoUrl,
  agencyName,
}: {
  logoUrl?: string
  agencyName: string
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        style={{ height: 28, maxWidth: 140, objectFit: "contain", marginBottom: 5, alignSelf: "flex-start" }}
      />
    )
  }
  return <AgencyLogo name={agencyName} size={15} color={COLORS.black} />
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  "₹" + (n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtDate = (d: any) =>
  new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })

const TYPE_LABELS: Record<string, string> = {
  FULL_PAYMENT: "Full Payment",
  ADVANCE_PAYMENT: "Advance Payment",
  MILESTONE_PAYMENT: "Milestone Payment",
  FINAL_PAYMENT: "Final Payment",
}

const TERMS_LABELS: Record<string, string> = {
  DUE_ON_RECEIPT: "Due on Receipt",
  DAYS_7: "Net 7 Days",
  DAYS_14: "Net 14 Days",
  DAYS_30: "Net 30 Days",
  CUSTOM: "Custom",
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT:          { bg: "#f1f5f9", color: "#64748b", label: "DRAFT" },
  SENT:           { bg: "#eff6ff", color: "#2563eb", label: "SENT" },
  PARTIALLY_PAID: { bg: "#fffbeb", color: "#d97706", label: "PARTIAL" },
  PAID:           { bg: "#f0fdf4", color: "#16a34a", label: "PAID" },
  OVERDUE:        { bg: "#fef2f2", color: "#dc2626", label: "OVERDUE" },
  CANCELLED:      { bg: "#f9fafb", color: "#94a3b8", label: "CANCELLED" },
}

// Parse "Key: Value" lines from free-text bank details
function parseBankLines(text: string): Array<{ key: string; value: string }> {
  if (!text?.trim()) return []
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const colon = line.indexOf(":")
      if (colon > 0) {
        return { key: line.slice(0, colon).trim(), value: line.slice(colon + 1).trim() }
      }
      return { key: "", value: line }
    })
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 48,
    paddingTop: 44,
    paddingBottom: 110,
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.body,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  headerLeft: { flex: 1, paddingRight: 20 },
  headerRight: { alignItems: "flex-end" },

  agencyName: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  agencyMeta: { fontSize: 9, color: COLORS.muted, lineHeight: 1.6 },

  invoiceWord: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 10,
    color: COLORS.muted,
    textAlign: "right",
    marginBottom: 6,
    letterSpacing: 0.3,
  },

  // Status badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    marginBottom: 10,
    alignSelf: "flex-end",
  },
  badgeText: {
    fontSize: 7,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },

  metaRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 3 },
  metaLabel: { fontSize: 9, color: COLORS.faint, marginRight: 10, width: 48, textAlign: "right" },
  metaValue: { fontSize: 9, color: COLORS.muted, width: 88, textAlign: "right" },

  // ── Divider ──
  divider: {
    borderBottomWidth: 0.75,
    borderBottomColor: COLORS.border,
    marginBottom: 18,
  },

  // ── Billing + Details row ──
  infoRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  infoLeft: { flex: 1, paddingRight: 24 },
  infoRight: { width: 220 },

  sectionLabel: {
    fontSize: 7.5,
    fontFamily: FONTS.bold,
    color: COLORS.faint,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  clientName: {
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: 3,
  },
  clientLine: { fontSize: 10, color: COLORS.body, lineHeight: 1.55, marginBottom: 1 },
  clientMuted: { fontSize: 9.5, color: COLORS.muted, lineHeight: 1.55, marginBottom: 1 },

  detailRow: { flexDirection: "row", marginBottom: 5 },
  detailLabel: { fontSize: 9, color: COLORS.faint, width: 72 },
  detailValue: { fontSize: 9.5, color: COLORS.body, flex: 1 },
  detailValueBold: { fontSize: 9.5, fontFamily: FONTS.bold, color: COLORS.black, flex: 1 },

  // ── Items table ──
  tableWrapper: { marginBottom: 4 },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 0.75,
    borderBottomColor: COLORS.border,
    paddingBottom: 7,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 8,
  },
  th: {
    fontSize: 7.5,
    fontFamily: FONTS.bold,
    color: COLORS.faint,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tdDescWrapper: { flex: 1, paddingRight: 12 },
  tdDesc: { fontSize: 10, color: COLORS.body, lineHeight: 1.4 },
  tdDescSub: { fontSize: 8.5, color: COLORS.muted, marginTop: 2 },
  tdNum: { width: 38, fontSize: 10, color: COLORS.body, textAlign: "right" },
  tdPrice: { width: 80, fontSize: 10, color: COLORS.body, textAlign: "right" },
  tdTotal: { width: 80, fontSize: 10, fontFamily: FONTS.bold, color: COLORS.black, textAlign: "right" },
  thDesc: { flex: 1, paddingRight: 12 },
  thNum: { width: 38, textAlign: "right" },
  thPrice: { width: 80, textAlign: "right" },
  thTotal: { width: 80, textAlign: "right" },

  // ── Totals ──
  totalsSection: { flexDirection: "row", justifyContent: "flex-end", marginTop: 6, marginBottom: 20 },
  totalsBlock: { width: 250 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  totalLabel: { fontSize: 9.5, color: COLORS.muted },
  totalValue: { fontSize: 9.5, color: COLORS.body, textAlign: "right" },
  totalDash: { fontSize: 9.5, color: COLORS.faint, textAlign: "right" },
  grandDivider: { borderTopWidth: 0.75, borderTopColor: COLORS.border, marginTop: 6, marginBottom: 8 },
  grandRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  grandLabel: { fontSize: 11, fontFamily: FONTS.bold, color: COLORS.black },
  grandValue: { fontSize: 11, fontFamily: FONTS.bold, color: COLORS.black, textAlign: "right" },
  paidRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6, marginBottom: 3 },
  paidLabel: { fontSize: 9.5, color: "#16a34a" },
  paidValue: { fontSize: 9.5, color: "#16a34a", textAlign: "right" },
  balanceRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  balanceLabel: { fontSize: 10, fontFamily: FONTS.bold },
  balanceValue: { fontSize: 10, fontFamily: FONTS.bold, textAlign: "right" },

  // ── Bottom section: Payment Info + Notes ──
  bottomRow: { flexDirection: "row", marginTop: 2, marginBottom: 16 },
  bottomLeft: { flex: 1, paddingRight: 24 },
  bottomRight: { flex: 1 },

  kvRow: { flexDirection: "row", marginBottom: 5 },
  kvLabel: { fontSize: 8.5, color: COLORS.faint, width: 88 },
  kvValue: { fontSize: 9, color: COLORS.body, flex: 1 },

  notesText: { fontSize: 9.5, color: COLORS.body, lineHeight: 1.6 },

  // ── Footer (fixed at bottom — contains terms + line) ──
  footer: {
    position: "absolute",
    bottom: 20,
    left: 48,
    right: 48,
    flexDirection: "column",
  },
  termsBlock: {
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    marginBottom: 8,
  },
  termsLabel: { fontSize: 7, fontFamily: FONTS.bold, color: COLORS.faint, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4, textAlign: "center" },
  termsText: { fontSize: 7.5, color: COLORS.faint, lineHeight: 1.6, textAlign: "center" },
  footerLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: 7,
  },
  footerLeft: { fontSize: 7.5, color: COLORS.faint, letterSpacing: 0.2 },
  footerRight: { fontSize: 7.5, color: COLORS.faint, letterSpacing: 0.2 },
})

// ─── Invoice PDF Document ─────────────────────────────────────────────────────

export function InvoicePdfDocument({
  invoice,
  business,
  totalPaid = 0,
}: {
  invoice: any
  business?: PdfBusinessContext
  totalPaid?: number
}) {
  const agencyName = business?.agencyName ?? "Outpero"
  const balanceDue = Math.max(0, invoice.grandTotal - totalPaid)
  const statusCfg = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.DRAFT

  const bankLines = parseBankLines(invoice.bankDetails || business?.bankDetails || "")
  const hasPaymentInfo = bankLines.length > 0
  const hasNotes = !!invoice.notes?.trim()
  const hasBottomSection = hasPaymentInfo || hasNotes

  const agencyInfoParts = [business?.address, business?.contactEmail, business?.website].filter(Boolean)

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`} author={agencyName}>
      <Page size="A4" style={s.page}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <LogoBlock logoUrl={business?.logoUrl} agencyName={agencyName} />
            {agencyInfoParts.map((part, i) => (
              <Text key={i} style={s.agencyMeta}>{part}</Text>
            ))}
            {business?.gstNumber && (
              <Text style={s.agencyMeta}>GST: {business.gstNumber}</Text>
            )}
          </View>

          <View style={s.headerRight}>
            <Text style={[s.invoiceWord, business?.primaryColor ? { color: business.primaryColor } : {}]}>Invoice</Text>
            <Text style={s.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <View style={[s.badge, { backgroundColor: statusCfg.bg }]}>
              <Text style={[s.badgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Issued</Text>
              <Text style={s.metaValue}>{fmtDate(invoice.issueDate)}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Due</Text>
              <Text style={s.metaValue}>{fmtDate(invoice.dueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── BILLING + INVOICE DETAILS ── */}
        <View style={s.infoRow}>
          <View style={s.infoLeft}>
            <Text style={s.sectionLabel}>Billed To</Text>
            <Text style={s.clientName}>{invoice.clientName}</Text>
            {invoice.companyName && <Text style={s.clientLine}>{invoice.companyName}</Text>}
            {invoice.email && <Text style={s.clientMuted}>{invoice.email}</Text>}
            {invoice.phone && <Text style={s.clientMuted}>{invoice.phone}</Text>}
            {invoice.billingAddress && <Text style={s.clientMuted}>{invoice.billingAddress}</Text>}
            {invoice.gstEnabled && invoice.gstNumber && (
              <Text style={s.clientMuted}>GST: {invoice.gstNumber}</Text>
            )}
          </View>

          <View style={s.infoRight}>
            <Text style={s.sectionLabel}>Invoice Details</Text>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Type</Text>
              <Text style={s.detailValueBold}>{TYPE_LABELS[invoice.type] ?? invoice.type}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Terms</Text>
              <Text style={s.detailValue}>{TERMS_LABELS[invoice.paymentTerms] ?? invoice.paymentTerms}</Text>
            </View>
            {invoice.proposal?.title && (
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Proposal</Text>
                <Text style={s.detailValue}>{invoice.proposal.title}</Text>
              </View>
            )}
            {invoice.lead?.name && (
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Lead</Text>
                <Text style={s.detailValue}>{invoice.lead.name}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.divider} />

        {/* ── LINE ITEMS ── */}
        <View style={s.tableWrapper}>
          <View style={s.tableHeaderRow}>
            <View style={[s.thDesc, { flex: 1 }]}>
              <Text style={s.th}>Service / Description</Text>
            </View>
            <View style={s.thNum}>
              <Text style={[s.th, { textAlign: "right" }]}>Qty</Text>
            </View>
            <View style={s.thPrice}>
              <Text style={[s.th, { textAlign: "right" }]}>Rate</Text>
            </View>
            <View style={s.thTotal}>
              <Text style={[s.th, { textAlign: "right" }]}>Amount</Text>
            </View>
          </View>

          {invoice.items.map((item: any, idx: number) => {
            const lines = (item.description || "").split("\n")
            const mainLine = lines[0] || ""
            const subLine = lines.slice(1).join(" ").trim()
            return (
              <View key={item.id ?? idx} style={s.tableRow}>
                <View style={s.tdDescWrapper}>
                  <Text style={s.tdDesc}>{mainLine}</Text>
                  {subLine ? <Text style={s.tdDescSub}>{subLine}</Text> : null}
                </View>
                <Text style={s.tdNum}>{item.quantity}</Text>
                <Text style={s.tdPrice}>{fmt(item.unitPrice)}</Text>
                <Text style={s.tdTotal}>{fmt(item.total)}</Text>
              </View>
            )
          })}
        </View>

        {/* ── TOTALS ── */}
        <View style={s.totalsSection}>
          <View style={s.totalsBlock}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal</Text>
              <Text style={s.totalValue}>{fmt(invoice.subtotal)}</Text>
            </View>
            {invoice.discountAmount > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Discount</Text>
                <Text style={[s.totalValue, { color: "#16a34a" }]}>− {fmt(invoice.discountAmount)}</Text>
              </View>
            )}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>
                GST{invoice.gstEnabled && invoice.gstPercentage ? ` (${invoice.gstPercentage}%)` : ""}
              </Text>
              <Text style={invoice.gstAmount > 0 ? s.totalValue : s.totalDash}>
                {invoice.gstAmount > 0 ? fmt(invoice.gstAmount) : "—"}
              </Text>
            </View>

            <View style={s.grandDivider} />

            <View style={s.grandRow}>
              <Text style={s.grandLabel}>Grand Total</Text>
              <Text style={s.grandValue}>{fmt(invoice.grandTotal)}</Text>
            </View>

            {totalPaid > 0 && (
              <>
                <View style={s.paidRow}>
                  <Text style={s.paidLabel}>Amount Paid</Text>
                  <Text style={s.paidValue}>{fmt(totalPaid)}</Text>
                </View>
                <View style={s.balanceRow}>
                  <Text style={[s.balanceLabel, { color: balanceDue > 0 ? "#dc2626" : "#16a34a" }]}>
                    Balance Due
                  </Text>
                  <Text style={[s.balanceValue, { color: balanceDue > 0 ? "#dc2626" : "#16a34a" }]}>
                    {fmt(balanceDue)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* ── PAYMENT INFO + NOTES ── */}
        {hasBottomSection && (
          <>
            <View style={s.divider} />
            <View style={s.bottomRow}>
              {hasPaymentInfo && (
                <View style={s.bottomLeft}>
                  <Text style={s.sectionLabel}>Payment Information</Text>
                  {bankLines.map((line, i) => (
                    <View key={i} style={s.kvRow}>
                      {line.key ? (
                        <>
                          <Text style={s.kvLabel}>{line.key}</Text>
                          <Text style={s.kvValue}>{line.value}</Text>
                        </>
                      ) : (
                        <Text style={[s.kvValue, { color: COLORS.muted }]}>{line.value}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
              {hasNotes && (
                <View style={hasPaymentInfo ? s.bottomRight : s.bottomLeft}>
                  <Text style={s.sectionLabel}>Notes</Text>
                  <Text style={s.notesText}>{invoice.notes}</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* ── FOOTER (fixed) — terms above footer line ── */}
        <View style={s.footer} fixed>
          {invoice.terms?.trim() && (
            <View style={s.termsBlock}>
              <Text style={s.termsLabel}>Terms &amp; Conditions</Text>
              <Text style={s.termsText}>{invoice.terms}</Text>
            </View>
          )}
          <View style={s.footerLine}>
            <Text style={s.footerLeft}>
              {[business?.website, business?.contactEmail].filter(Boolean).join("  •  ")}
            </Text>
            <Text style={s.footerRight}>Thank you for your business.</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}

// ─── Receipt PDF Document ─────────────────────────────────────────────────────

const rs = StyleSheet.create({
  page: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 48,
    paddingTop: 44,
    paddingBottom: 56,
    fontFamily: FONTS.regular,
    fontSize: 9,
    color: COLORS.body,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  headerLeft: { flex: 1, paddingRight: 20 },
  headerRight: { alignItems: "flex-end" },
  agencyName: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  agencyMeta: { fontSize: 8, color: COLORS.muted, lineHeight: 1.6 },
  receiptWord: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
    textAlign: "right",
  },
  receiptNumber: {
    fontSize: 9.5,
    color: COLORS.muted,
    textAlign: "right",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 3 },
  metaLabel: { fontSize: 8, color: COLORS.faint, marginRight: 10, width: 56, textAlign: "right" },
  metaValue: { fontSize: 8, color: COLORS.muted, width: 82, textAlign: "right" },
  divider: { borderBottomWidth: 0.75, borderBottomColor: COLORS.border, marginBottom: 18 },
  sectionLabel: {
    fontSize: 7,
    fontFamily: FONTS.bold,
    color: COLORS.faint,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  clientName: {
    fontSize: 10.5,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: 3,
  },
  clientLine: { fontSize: 9, color: COLORS.body, lineHeight: 1.55 },
  infoRow: { flexDirection: "row", marginBottom: 20 },
  infoLeft: { flex: 1, paddingRight: 24 },
  infoRight: { width: 210 },
  kvRow: { flexDirection: "row", marginBottom: 5 },
  kvLabel: { fontSize: 7.5, color: COLORS.faint, width: 90 },
  kvValue: { fontSize: 8.5, color: COLORS.body, flex: 1 },
  kvValueBold: { fontSize: 8.5, fontFamily: FONTS.bold, color: COLORS.black, flex: 1 },
  amountBox: {
    borderTopWidth: 0.75,
    borderTopColor: COLORS.border,
    paddingTop: 14,
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  amountBlock: { width: 240 },
  amountRow: { flexDirection: "row", justifyContent: "space-between" },
  amountLabel: { fontSize: 10, fontFamily: FONTS.bold, color: COLORS.black },
  amountValue: { fontSize: 14, fontFamily: FONTS.bold, color: "#16a34a", textAlign: "right" },
  notesSection: { marginBottom: 16 },
  notesText: { fontSize: 8.5, color: COLORS.body, lineHeight: 1.6 },
  confirmBox: {
    backgroundColor: "#f0fdf4",
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  confirmText: { fontSize: 9, color: "#15803d", lineHeight: 1.55, textAlign: "center" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: COLORS.faint, letterSpacing: 0.2 },
})

export function ReceiptPdfDocument({
  receipt,
  business,
}: {
  receipt: any
  business?: PdfBusinessContext
}) {
  const agencyName = business?.agencyName ?? "Outpero"
  const paymentDate = fmtDate(receipt.paymentDate)
  const receiptDate = fmtDate(receipt.receiptDate)
  const agencyInfoParts = [business?.address, business?.contactEmail, business?.website].filter(Boolean)

  return (
    <Document title={`Receipt ${receipt.receiptNumber}`} author={agencyName}>
      <Page size="A4" style={rs.page}>

        {/* ── HEADER ── */}
        <View style={rs.header}>
          <View style={rs.headerLeft}>
            <LogoBlock logoUrl={business?.logoUrl} agencyName={agencyName} />
            {agencyInfoParts.map((part, i) => (
              <Text key={i} style={rs.agencyMeta}>{part}</Text>
            ))}
          </View>
          <View style={rs.headerRight}>
            <Text style={[rs.receiptWord, business?.primaryColor ? { color: business.primaryColor } : {}]}>Receipt</Text>
            <Text style={rs.receiptNumber}>{receipt.receiptNumber}</Text>
            <View style={rs.metaRow}>
              <Text style={rs.metaLabel}>Receipt Date</Text>
              <Text style={rs.metaValue}>{receiptDate}</Text>
            </View>
          </View>
        </View>

        <View style={rs.divider} />

        {/* ── CLIENT + PAYMENT META ── */}
        <View style={rs.infoRow}>
          <View style={rs.infoLeft}>
            <Text style={rs.sectionLabel}>Received From</Text>
            <Text style={rs.clientName}>{receipt.clientName}</Text>
            {receipt.companyName && <Text style={rs.clientLine}>{receipt.companyName}</Text>}
          </View>
          <View style={rs.infoRight}>
            <Text style={rs.sectionLabel}>Payment Details</Text>
            <View style={rs.kvRow}>
              <Text style={rs.kvLabel}>Payment Date</Text>
              <Text style={rs.kvValue}>{paymentDate}</Text>
            </View>
            {receipt.paymentMethod && (
              <View style={rs.kvRow}>
                <Text style={rs.kvLabel}>Method</Text>
                <Text style={rs.kvValue}>{receipt.paymentMethod}</Text>
              </View>
            )}
            {receipt.transactionReference && (
              <View style={rs.kvRow}>
                <Text style={rs.kvLabel}>Transaction Ref</Text>
                <Text style={rs.kvValue}>{receipt.transactionReference}</Text>
              </View>
            )}
            {receipt.utrNumber && (
              <View style={rs.kvRow}>
                <Text style={rs.kvLabel}>UTR Number</Text>
                <Text style={rs.kvValue}>{receipt.utrNumber}</Text>
              </View>
            )}
            {receipt.invoice?.invoiceNumber && (
              <View style={rs.kvRow}>
                <Text style={rs.kvLabel}>Invoice Ref</Text>
                <Text style={rs.kvValue}>{receipt.invoice.invoiceNumber}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={rs.divider} />

        {/* ── SERVICES ── */}
        <View style={{ marginBottom: 16 }}>
          <Text style={rs.sectionLabel}>Services</Text>
          <Text style={{ fontSize: 9, color: COLORS.body, lineHeight: 1.55 }}>{receipt.services}</Text>
        </View>

        {/* ── AMOUNT ── */}
        <View style={rs.amountBox}>
          <View style={rs.amountBlock}>
            <View style={rs.amountRow}>
              <Text style={rs.amountLabel}>Amount Received</Text>
              <Text style={rs.amountValue}>{fmt(receipt.amountReceived)}</Text>
            </View>
          </View>
        </View>

        {/* ── CONFIRMATION ── */}
        <View style={rs.confirmBox}>
          <Text style={rs.confirmText}>
            Payment successfully received.{"\n"}Thank you for your business.
          </Text>
        </View>

        {/* ── NOTES ── */}
        {receipt.notes?.trim() && (
          <View style={rs.notesSection}>
            <Text style={rs.sectionLabel}>Notes</Text>
            <Text style={rs.notesText}>{receipt.notes}</Text>
          </View>
        )}

        {/* ── FOOTER ── */}
        <View style={rs.footer} fixed>
          <Text style={rs.footerText}>
            {[business?.website, business?.contactEmail].filter(Boolean).join("  •  ")}
          </Text>
          <Text style={rs.footerText}>{agencyName}</Text>
        </View>

      </Page>
    </Document>
  )
}
