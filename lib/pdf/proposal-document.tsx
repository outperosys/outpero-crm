import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import { COLORS, FONTS, SPACING, TYPE } from "./tokens"
import type { ProposalWithSections } from "@/actions/proposals"

// ─── Business context (future Settings integration) ───────────────────────────

export interface PdfBusinessContext {
  agencyName?: string
  contactEmail?: string
  website?: string
}

// ─── StyleSheet ───────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Pages
  coverPage: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.pagePaddingH,
    paddingVertical: SPACING.pagePaddingV,
    fontFamily: FONTS.regular,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  contentPage: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.pagePaddingH,
    paddingTop: SPACING.pagePaddingV,
    paddingBottom: SPACING.pagePaddingV + 20,
    fontFamily: FONTS.regular,
  },

  // Cover
  coverTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  coverAgency: { fontSize: TYPE.small, fontFamily: FONTS.bold, color: COLORS.muted, letterSpacing: 1 },
  coverCenter: { flex: 1, justifyContent: "center", paddingVertical: 60 },
  coverCompany: { fontSize: TYPE.coverCompany, fontFamily: FONTS.bold, color: COLORS.black, marginBottom: 10 },
  coverTitle: { fontSize: TYPE.coverTitle, color: COLORS.body, marginBottom: 6 },
  coverDivider: { width: 36, height: 2, backgroundColor: COLORS.black, marginVertical: 18 },
  coverMeta: { fontSize: TYPE.coverMeta, color: COLORS.muted, marginBottom: 4 },
  coverNote: { fontSize: TYPE.small, color: COLORS.muted, marginTop: 16, lineHeight: 1.5 },
  coverBottom: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  coverBottomText: { fontSize: TYPE.footer, color: COLORS.muted },

  // Section heading
  sectionBlock: { marginBottom: SPACING.sectionGap },
  sectionHeadingRow: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.headingGap },
  sectionHeading: {
    fontSize: TYPE.sectionHeading,
    fontFamily: FONTS.bold,
    color: COLORS.muted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionHeadingLine: { flex: 1, height: 1, backgroundColor: COLORS.border, marginLeft: 10 },

  // Body text
  bodyText: { fontSize: TYPE.body, color: COLORS.body, lineHeight: 1.65 },
  bodyParagraph: { marginBottom: SPACING.lineGap },

  // Bullet list
  bulletRow: { flexDirection: "row", marginBottom: 5 },
  bulletDot: { fontSize: TYPE.body, color: COLORS.muted, width: 14, marginTop: 0.5 },
  bulletText: { flex: 1, fontSize: TYPE.body, color: COLORS.body, lineHeight: 1.55 },

  // Numbered list
  numberedRow: { flexDirection: "row", marginBottom: 5 },
  numberedIndex: { fontSize: TYPE.body, color: COLORS.muted, width: 18, marginTop: 0.5 },
  numberedText: { flex: 1, fontSize: TYPE.body, color: COLORS.body, lineHeight: 1.55 },

  // Table
  table: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 3 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: COLORS.subtle, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tableRowLast: { flexDirection: "row" },
  tableHeaderCell: { fontSize: TYPE.tableHeader, fontFamily: FONTS.bold, color: COLORS.muted, paddingHorizontal: 10, paddingVertical: 7, textTransform: "uppercase", letterSpacing: 0.5 },
  tableCell: { fontSize: TYPE.tableCell, color: COLORS.body, paddingHorizontal: 10, paddingVertical: 8 },
  tableCellMuted: { fontSize: TYPE.tableCell, color: COLORS.muted, paddingHorizontal: 10, paddingVertical: 8 },
  tableCellBold: { fontSize: TYPE.tableCell, fontFamily: FONTS.bold, color: COLORS.black, paddingHorizontal: 10, paddingVertical: 8 },
  tableColFlex: { flex: 1 },
  tableColPrice: { width: 90 },
  tableColNotes: { flex: 1 },
  tableColDuration: { width: 90 },

  // Timeline
  timelineRow: { flexDirection: "row", marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  timelineRowLast: { flexDirection: "row", marginBottom: 0 },
  timelineIndex: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.subtle, alignItems: "center", justifyContent: "center", marginRight: 12, marginTop: 1 },
  timelineIndexText: { fontSize: 8, fontFamily: FONTS.bold, color: COLORS.muted },
  timelineContent: { flex: 1 },
  timelinePhase: { fontSize: TYPE.body, fontFamily: FONTS.bold, color: COLORS.black, marginBottom: 2 },
  timelineDuration: { fontSize: TYPE.small, color: COLORS.muted, marginBottom: 2 },
  timelineDesc: { fontSize: TYPE.small, color: COLORS.body },

  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: SPACING.pagePaddingH,
    right: SPACING.pagePaddingH,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  footerText: { fontSize: TYPE.footer, color: COLORS.muted },
  footerPage: { fontSize: TYPE.footer, color: COLORS.muted },
})

// ─── Content parsers (mirrors workspace editor) ───────────────────────────────

function parsePricing(content: string) {
  return content
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const [item = "", price = "", notes = ""] = line.split("|").map((s) => s.trim())
      return { item, price, notes }
    })
}

function parseTimeline(content: string) {
  return content
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const [phase = "", duration = "", description = ""] = line.split("|").map((s) => s.trim())
      return { phase, duration, description }
    })
}

// ─── Section heading shared component ────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={s.sectionHeadingRow}>
      <Text style={s.sectionHeading}>{title}</Text>
      <View style={s.sectionHeadingLine} />
    </View>
  )
}

// ─── Text section (most section types) ───────────────────────────────────────

function TextSection({ title, content }: { title: string; content: string }) {
  const paragraphs = content.split("\n").filter((l) => l.trim())
  if (!paragraphs.length) return null
  return (
    <View style={s.sectionBlock}>
      <SectionHeading title={title} />
      {paragraphs.map((para, i) => (
        <Text key={i} style={[s.bodyText, i < paragraphs.length - 1 ? s.bodyParagraph : {}]}>
          {para}
        </Text>
      ))}
    </View>
  )
}

// ─── Bullet section (SCOPE_OF_WORK, NEXT_STEPS) ───────────────────────────────

function BulletSection({ title, content }: { title: string; content: string }) {
  const lines = content.split("\n").filter((l) => l.trim())
  if (!lines.length) return null
  return (
    <View style={s.sectionBlock}>
      <SectionHeading title={title} />
      {lines.map((line, i) => (
        <View key={i} style={s.bulletRow}>
          <Text style={s.bulletDot}>·</Text>
          <Text style={s.bulletText}>{line.replace(/^-\s*/, "")}</Text>
        </View>
      ))}
    </View>
  )
}

// ─── Pricing section ──────────────────────────────────────────────────────────

function PricingSection({ title, content }: { title: string; content: string }) {
  const rows = parsePricing(content)
  if (!rows.length) return null
  return (
    <View style={s.sectionBlock}>
      <SectionHeading title={title} />
      <View style={s.table}>
        {/* Header */}
        <View style={s.tableHeaderRow}>
          <Text style={[s.tableHeaderCell, s.tableColFlex]}>Item</Text>
          <Text style={[s.tableHeaderCell, s.tableColPrice]}>Price</Text>
          <Text style={[s.tableHeaderCell, s.tableColNotes]}>Notes</Text>
        </View>
        {/* Rows */}
        {rows.map((row, i) => {
          const isLast = i === rows.length - 1
          return (
            <View key={i} style={isLast ? s.tableRowLast : s.tableRow}>
              <Text style={[s.tableCell, s.tableColFlex]}>{row.item}</Text>
              <Text style={[s.tableCellBold, s.tableColPrice]}>{row.price}</Text>
              <Text style={[s.tableCellMuted, s.tableColNotes]}>{row.notes}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

// ─── Timeline section ─────────────────────────────────────────────────────────

function TimelineSection({ title, content }: { title: string; content: string }) {
  const rows = parseTimeline(content)
  if (!rows.length) return null
  return (
    <View style={s.sectionBlock}>
      <SectionHeading title={title} />
      {rows.map((row, i) => {
        const isLast = i === rows.length - 1
        return (
          <View key={i} style={isLast ? s.timelineRowLast : s.timelineRow}>
            <View style={s.timelineIndex}>
              <Text style={s.timelineIndexText}>{i + 1}</Text>
            </View>
            <View style={s.timelineContent}>
              <Text style={s.timelinePhase}>{row.phase}</Text>
              {row.duration ? <Text style={s.timelineDuration}>{row.duration}</Text> : null}
              {row.description ? <Text style={s.timelineDesc}>{row.description}</Text> : null}
            </View>
          </View>
        )
      })}
    </View>
  )
}

// ─── Section dispatcher ───────────────────────────────────────────────────────

function PdfSectionRenderer({ type, title, content }: { type: string; title: string; content: string }) {
  switch (type) {
    case "SCOPE_OF_WORK":
    case "NEXT_STEPS":
      return <BulletSection title={title} content={content} />
    case "PRICING":
      return <PricingSection title={title} content={content} />
    case "TIMELINE":
      return <TimelineSection title={title} content={content} />
    // COVER is handled separately as its own page
    case "COVER":
      return null
    default:
      return <TextSection title={title} content={content} />
  }
}

// ─── Cover page ───────────────────────────────────────────────────────────────

function CoverPage({
  proposal,
  business,
}: {
  proposal: ProposalWithSections
  business?: PdfBusinessContext
}) {
  const agencyName = business?.agencyName ?? "Outpero"
  const companyName = proposal.lead.companyName ?? proposal.lead.name
  const date = new Date(proposal.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  })

  // Optional cover section note
  const coverSection = proposal.sections.find((s) => s.type === "COVER")
  const coverNote = coverSection?.content?.trim()

  return (
    <Page size="A4" style={s.coverPage}>
      {/* Top: agency tag */}
      <View style={s.coverTop}>
        <Text style={s.coverAgency}>{agencyName.toUpperCase()}</Text>
      </View>

      {/* Center: proposal identity */}
      <View style={s.coverCenter}>
        <Text style={s.coverCompany}>{companyName}</Text>
        <Text style={s.coverTitle}>{proposal.title}</Text>
        <View style={s.coverDivider} />
        <Text style={s.coverMeta}>Prepared by {agencyName}</Text>
        <Text style={s.coverMeta}>{date}</Text>
        {coverNote ? <Text style={s.coverNote}>{coverNote}</Text> : null}
      </View>

      {/* Bottom: contact strip */}
      <View style={s.coverBottom}>
        <Text style={s.coverBottomText}>
          {[agencyName, business?.contactEmail, business?.website]
            .filter(Boolean)
            .join("  ·  ")}
        </Text>
      </View>
    </Page>
  )
}

// ─── Main document ────────────────────────────────────────────────────────────

interface ProposalPdfDocumentProps {
  proposal: ProposalWithSections
  business?: PdfBusinessContext
}

export function ProposalPdfDocument({ proposal, business }: ProposalPdfDocumentProps) {
  const agencyName = business?.agencyName ?? "Outpero"
  const hasCover = proposal.sections.some((s) => s.type === "COVER" && s.isVisible)
  const contentSections = proposal.sections
    .filter((s) => s.isVisible && s.type !== "COVER" && s.content.trim())
    .sort((a, b) => a.order - b.order)

  return (
    <Document
      title={proposal.title}
      author={agencyName}
      subject="Business Proposal"
      creator={agencyName}
    >
      {/* Cover page */}
      {hasCover && <CoverPage proposal={proposal} business={business} />}

      {/* Content page */}
      {contentSections.length > 0 && (
        <Page size="A4" style={s.contentPage}>
          {contentSections.map((section) => (
            <PdfSectionRenderer
              key={section.id}
              type={section.type}
              title={section.title}
              content={section.content}
            />
          ))}

          {/* Footer — renders on every page of this Page */}
          <View style={s.footer} fixed>
            <Text style={s.footerText}>{agencyName} · Confidential</Text>
            <Text
              style={s.footerPage}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            />
          </View>
        </Page>
      )}
    </Document>
  )
}
