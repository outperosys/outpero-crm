/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import {
  COLORS, FONTS, SPACING, TYPE,
  PDF_VISUAL_STYLES, type PdfVisualStyleKey,
} from "./tokens"
import type { ProposalWithSections } from "@/actions/proposals"

export interface PdfBusinessContext {
  agencyName?: string
  contactEmail?: string
  website?: string
}

// ─── StyleSheet (fixed, non-dynamic styles) ───────────────────────────────────

const s = StyleSheet.create({
  // ── Pages ──
  coverPage: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.pagePaddingH,
    paddingTop: SPACING.pagePaddingV,
    paddingBottom: 40,
    fontFamily: FONTS.regular,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  contentPage: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.pagePaddingH,
    paddingTop: 52,
    paddingBottom: 60,
    fontFamily: FONTS.regular,
  },

  // ── Cover ──
  coverLogoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  coverAgency: { fontSize: 9, fontFamily: FONTS.bold, color: COLORS.muted, letterSpacing: 1.5 },
  coverCenter: { flex: 1, justifyContent: "center", paddingVertical: 56 },
  coverEyebrow: { fontSize: 9, color: COLORS.muted, letterSpacing: 0.5, marginBottom: 10 },
  coverCompany: { fontSize: TYPE.coverCompany, fontFamily: FONTS.bold, color: COLORS.black, marginBottom: 8, lineHeight: 1.2 },
  coverTitle: { fontSize: TYPE.coverTitle, color: COLORS.body, lineHeight: 1.4 },
  coverDivider: { width: 32, height: 2, backgroundColor: COLORS.black, marginTop: 20, marginBottom: 20 },
  coverMeta: { fontSize: 9.5, color: COLORS.muted, marginBottom: 5 },
  coverNote: { fontSize: 9, color: COLORS.muted, marginTop: 18, lineHeight: 1.6, fontFamily: FONTS.oblique },
  coverBottom: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 14 },
  coverBottomText: { fontSize: TYPE.footer, color: COLORS.faint, letterSpacing: 0.3 },

  // ── Section structure ──
  sectionBlock: { marginBottom: SPACING.sectionGap },
  headingRow: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.headingGap },
  headingLine: { flex: 1, height: 0.75, backgroundColor: COLORS.border, marginLeft: 10 },

  // ── Body text ──
  para: { marginBottom: SPACING.paraGap },

  // ── Bullets ──
  bulletRow: { flexDirection: "row", marginBottom: SPACING.bulletGap },
  bulletDot: { fontSize: TYPE.body, color: COLORS.faint, width: 14, marginTop: 1.5 },
  bulletText: { flex: 1, fontSize: TYPE.body, color: COLORS.body, lineHeight: 1.7 },

  // ── Table ──
  table: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 3 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: COLORS.subtle, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tableRowLast: { flexDirection: "row" },
  thItem: { flex: 2, fontSize: TYPE.tableHeader, fontFamily: FONTS.bold, color: COLORS.muted, paddingHorizontal: 12, paddingVertical: 8, textTransform: "uppercase", letterSpacing: 0.6 },
  thPrice: { width: 90, fontSize: TYPE.tableHeader, fontFamily: FONTS.bold, color: COLORS.muted, paddingHorizontal: 12, paddingVertical: 8, textTransform: "uppercase", letterSpacing: 0.6, textAlign: "right" },
  thNotes: { flex: 1, fontSize: TYPE.tableHeader, fontFamily: FONTS.bold, color: COLORS.muted, paddingHorizontal: 12, paddingVertical: 8, textTransform: "uppercase", letterSpacing: 0.6 },
  tdItem: { flex: 2, fontSize: TYPE.tableCell, color: COLORS.body, paddingHorizontal: 12, paddingVertical: 9 },
  tdPrice: { width: 90, fontSize: TYPE.tableCell, fontFamily: FONTS.bold, color: COLORS.black, paddingHorizontal: 12, paddingVertical: 9, textAlign: "right" },
  tdNotes: { flex: 1, fontSize: TYPE.tableCell, color: COLORS.muted, paddingHorizontal: 12, paddingVertical: 9 },

  // ── Timeline ──
  timelineItem: { flexDirection: "row", marginBottom: 14 },
  timelineItemLast: { flexDirection: "row" },
  timelineBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.subtle, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center", marginRight: 14, marginTop: 1, flexShrink: 0 },
  timelineBadgeText: { fontSize: 8.5, fontFamily: FONTS.bold, color: COLORS.muted },
  timelineBody: { flex: 1 },
  timelinePhase: { fontSize: TYPE.body, fontFamily: FONTS.bold, color: COLORS.black, marginBottom: 3 },
  timelineDuration: { fontSize: TYPE.small, color: COLORS.muted, marginBottom: 3 },
  timelineDesc: { fontSize: TYPE.small, color: COLORS.body, lineHeight: 1.55 },

  // ── Footer ──
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
  footerLeft: { fontSize: TYPE.footer, color: COLORS.faint, letterSpacing: 0.3 },
  footerRight: { fontSize: TYPE.footer, color: COLORS.faint },
})

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parsePricing(content: string) {
  return content.split("\n").filter((l) => l.trim()).map((line) => {
    const parts = line.split("|").map((x) => x.trim())
    return { item: parts[0] ?? "", price: parts[1] ?? "", notes: parts[2] ?? "" }
  })
}

function parseTimeline(content: string) {
  return content.split("\n").filter((l) => l.trim()).map((line) => {
    const parts = line.split("|").map((x) => x.trim())
    return { phase: parts[0] ?? "", duration: parts[1] ?? "", description: parts[2] ?? "" }
  })
}

// ─── Style-aware section wrapper ──────────────────────────────────────────────

function Section({
  title,
  visualStyle,
  children,
}: {
  title: string
  visualStyle: PdfVisualStyleKey
  children: React.ReactNode
}) {
  const t = PDF_VISUAL_STYLES[visualStyle] ?? PDF_VISUAL_STYLES.CLEAN
  return (
    <View style={[s.sectionBlock, t.container as any]}>
      <View style={s.headingRow}>
        <Text style={t.headingText as any}>{title}</Text>
        {t.showHeadingLine && <View style={s.headingLine} />}
      </View>
      {children}
    </View>
  )
}

// ─── Content renderers ────────────────────────────────────────────────────────

function BodyText({ content, style }: { content: string; style: any }) {
  const paragraphs = content.split("\n").filter((l) => l.trim())
  if (!paragraphs.length) return null
  return (
    <>
      {paragraphs.map((para, i) => (
        <Text key={i} style={[style, i < paragraphs.length - 1 ? s.para : {}]}>
          {para}
        </Text>
      ))}
    </>
  )
}

function BulletList({ content, style }: { content: string; style: any }) {
  const lines = content.split("\n").filter((l) => l.trim()).map((l) => l.replace(/^[-•·]\s*/, ""))
  return (
    <>
      {lines.map((line, i) => (
        <View key={i} style={s.bulletRow}>
          <Text style={[s.bulletDot, style]}>–</Text>
          <Text style={[s.bulletText, style]}>{line}</Text>
        </View>
      ))}
    </>
  )
}

function PricingTable({ content }: { content: string }) {
  const rows = parsePricing(content).filter((r) => r.item)
  if (!rows.length) return null
  return (
    <View style={s.table}>
      <View style={s.tableHeaderRow}>
        <Text style={s.thItem}>Item</Text>
        <Text style={s.thPrice}>Price</Text>
        <Text style={s.thNotes}>Notes</Text>
      </View>
      {rows.map((row, i) => (
        <View key={i} style={i === rows.length - 1 ? s.tableRowLast : s.tableRow}>
          <Text style={s.tdItem}>{row.item}</Text>
          <Text style={s.tdPrice}>{row.price}</Text>
          <Text style={s.tdNotes}>{row.notes}</Text>
        </View>
      ))}
    </View>
  )
}

function TimelineList({ content }: { content: string }) {
  const rows = parseTimeline(content).filter((r) => r.phase)
  if (!rows.length) return null
  return (
    <>
      {rows.map((row, i) => (
        <View key={i} style={i === rows.length - 1 ? s.timelineItemLast : s.timelineItem}>
          <View style={s.timelineBadge}>
            <Text style={s.timelineBadgeText}>{i + 1}</Text>
          </View>
          <View style={s.timelineBody}>
            <Text style={s.timelinePhase}>{row.phase}</Text>
            {row.duration ? <Text style={s.timelineDuration}>{row.duration}</Text> : null}
            {row.description ? <Text style={s.timelineDesc}>{row.description}</Text> : null}
          </View>
        </View>
      ))}
    </>
  )
}

// ─── Section dispatcher ───────────────────────────────────────────────────────

function SectionRenderer({
  type,
  title,
  content,
  visualStyle,
}: {
  type: string
  title: string
  content: string
  visualStyle: PdfVisualStyleKey
}) {
  if (!content.trim() || type === "COVER") return null
  const t = PDF_VISUAL_STYLES[visualStyle] ?? PDF_VISUAL_STYLES.CLEAN

  return (
    <Section title={title} visualStyle={visualStyle}>
      {type === "PRICING" ? (
        <PricingTable content={content} />
      ) : type === "TIMELINE" ? (
        <TimelineList content={content} />
      ) : type === "SCOPE_OF_WORK" || type === "NEXT_STEPS" ? (
        <BulletList content={content} style={t.contentText} />
      ) : (
        <BodyText content={content} style={t.contentText} />
      )}
    </Section>
  )
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
  const coverNote = proposal.sections.find((s) => s.type === "COVER")?.content?.trim()

  return (
    <Page size="A4" style={s.coverPage}>
      {/* Agency identifier */}
      <View style={s.coverLogoRow}>
        <Text style={s.coverAgency}>{agencyName.toUpperCase()}</Text>
      </View>

      {/* Document identity */}
      <View style={s.coverCenter}>
        <Text style={s.coverEyebrow}>Prepared for</Text>
        <Text style={s.coverCompany}>{companyName}</Text>
        <Text style={s.coverTitle}>{proposal.title}</Text>
        <View style={s.coverDivider} />
        <Text style={s.coverMeta}>By {agencyName}</Text>
        <Text style={s.coverMeta}>{date}</Text>
        {coverNote ? <Text style={s.coverNote}>{coverNote}</Text> : null}
      </View>

      {/* Footer strip */}
      <View style={s.coverBottom}>
        <Text style={s.coverBottomText}>
          {[agencyName, business?.contactEmail, business?.website]
            .filter(Boolean)
            .join("   ·   ")}
        </Text>
      </View>
    </Page>
  )
}

// ─── Main document ────────────────────────────────────────────────────────────

export function ProposalPdfDocument({
  proposal,
  business,
}: {
  proposal: ProposalWithSections
  business?: PdfBusinessContext
}) {
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
      {hasCover && <CoverPage proposal={proposal} business={business} />}

      {contentSections.length > 0 && (
        <Page size="A4" style={s.contentPage}>
          {contentSections.map((section) => (
            <SectionRenderer
              key={section.id}
              type={section.type}
              title={section.title}
              content={section.content}
              visualStyle={((section as any).visualStyle ?? "CLEAN") as PdfVisualStyleKey}
            />
          ))}

          <View style={s.footer} fixed>
            <Text style={s.footerLeft}>{agencyName}  ·  Confidential</Text>
            <Text
              style={s.footerRight}
              render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages}`
              }
            />
          </View>
        </Page>
      )}
    </Document>
  )
}
