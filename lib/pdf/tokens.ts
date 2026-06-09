// Shared design tokens for all PDF documents.
// All values are in points (pt). No CSS, no Tailwind — PDF-safe only.

export const COLORS = {
  black:   "#0f172a",   // headings, strong text
  body:    "#1e293b",   // primary body text
  muted:   "#64748b",   // labels, captions, secondary
  faint:   "#94a3b8",   // dividers, placeholders
  border:  "#e2e8f0",   // table borders, lines
  subtle:  "#f8fafc",   // table header bg
  white:   "#ffffff",
  // Visual style accents
  highlightBorder: "#0f172a",
  highlightBg:     "#f8fafc",
  modernBg:        "#f1f5f9",
}

export const FONTS = {
  regular: "Montserrat",
  bold:    "Montserrat-Bold",
  medium:  "Montserrat-Medium",
}

export const SPACING = {
  pagePaddingH: 62,   // pt — horizontal page margin (wider = more premium)
  pagePaddingV: 56,   // pt — vertical page margin
  sectionGap:   40,   // pt — space AFTER each section (was 22 — critical)
  headingGap:   12,   // pt — between section heading and content
  paraGap:       9,   // pt — between paragraphs within a section
  bulletGap:     6,   // pt — between bullet items
}

export const TYPE = {
  coverCompany:   30,
  coverTitle:     15,
  coverMeta:      10,
  sectionHeading:  8.5,  // small caps label
  body:           11,    // primary body (was 10)
  small:           9.5,  // secondary text, captions
  tableHeader:     8.5,
  tableCell:      10,
  footer:          7.5,
}

// ─── Per-visual-style PDF tokens ──────────────────────────────────────────────
// DO NOT include marginBottom in container — sectionBlock owns vertical rhythm.

export type PdfVisualStyleKey =
  | "CLEAN"
  | "MODERN"
  | "HIGHLIGHT"
  | "MINIMAL"
  | "HERO"
  | "TWO_COLUMN"

export interface PdfStyleTokens {
  container: object        // wraps the entire section (bg, border, padding)
  headingText: object      // section label text style
  showHeadingLine: boolean // whether to extend a horizontal rule after the label
  contentText: object      // body text style
}

export const PDF_VISUAL_STYLES: Record<PdfVisualStyleKey, PdfStyleTokens> = {

  // ── CLEAN — standard white, small uppercase label + rule ─────────────────────
  CLEAN: {
    container: {},
    headingText: {
      fontSize: TYPE.sectionHeading,
      fontFamily: FONTS.bold,
      color: COLORS.muted,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    showHeadingLine: true,
    contentText: {
      fontSize: TYPE.body,
      color: COLORS.body,
      lineHeight: 1.72,
    },
  },

  // ── MODERN — soft gray card, contained padding ────────────────────────────────
  MODERN: {
    container: {
      backgroundColor: COLORS.modernBg,
      borderRadius: 4,
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 18,
    },
    headingText: {
      fontSize: TYPE.sectionHeading,
      fontFamily: FONTS.bold,
      color: COLORS.black,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    showHeadingLine: true,
    contentText: {
      fontSize: TYPE.body,
      color: COLORS.body,
      lineHeight: 1.72,
    },
  },

  // ── HIGHLIGHT — strong left border, off-white bg ──────────────────────────────
  HIGHLIGHT: {
    container: {
      borderLeftWidth: 3,
      borderLeftColor: COLORS.highlightBorder,
      paddingLeft: 18,
      paddingRight: 14,
      paddingTop: 14,
      paddingBottom: 16,
      backgroundColor: COLORS.highlightBg,
    },
    headingText: {
      fontSize: TYPE.sectionHeading,
      fontFamily: FONTS.bold,
      color: COLORS.black,
      letterSpacing: 1.0,
      textTransform: "uppercase",
    },
    showHeadingLine: false,
    contentText: {
      fontSize: TYPE.body,
      color: COLORS.body,
      lineHeight: 1.72,
    },
  },

  // ── MINIMAL — understated, muted, for secondary content ───────────────────────
  MINIMAL: {
    container: {
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      paddingTop: 12,
    },
    headingText: {
      fontSize: 7.5,
      fontFamily: FONTS.regular,
      color: COLORS.faint,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    showHeadingLine: false,
    contentText: {
      fontSize: 10,
      color: COLORS.muted,
      lineHeight: 1.65,
    },
  },

  // ── HERO — large centered text, for prominent single-message sections ─────────
  HERO: {
    container: {
      alignItems: "center",
      paddingVertical: 12,
    },
    headingText: {
      fontSize: 13,
      fontFamily: FONTS.bold,
      color: COLORS.black,
      letterSpacing: 0.5,
      textAlign: "center",
    },
    showHeadingLine: false,
    contentText: {
      fontSize: TYPE.body,
      color: COLORS.muted,
      lineHeight: 1.68,
      textAlign: "center",
    },
  },

  // ── TWO_COLUMN — full-width in PDF with subtle left accent ───────────────────
  TWO_COLUMN: {
    container: {
      borderLeftWidth: 2,
      borderLeftColor: COLORS.border,
      paddingLeft: 14,
    },
    headingText: {
      fontSize: TYPE.sectionHeading,
      fontFamily: FONTS.bold,
      color: COLORS.body,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    showHeadingLine: false,
    contentText: {
      fontSize: TYPE.body,
      color: COLORS.body,
      lineHeight: 1.72,
    },
  },
}
