// Shared design tokens for all PDF documents (proposals, invoices, etc.)
// All PDF components import from here for consistency.

export const COLORS = {
  black: "#111827",       // Headings, strong text
  body: "#374151",        // Body text
  muted: "#6b7280",       // Labels, secondary
  border: "#d1d5db",      // Dividers, table borders
  subtle: "#f3f4f6",      // Table header bg, alternating rows
  white: "#ffffff",
  accent: "#111827",      // Section heading color
}

export const FONTS = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
  oblique: "Helvetica-Oblique",
}

export const SPACING = {
  pagePaddingH: 56,  // pt — horizontal page margin
  pagePaddingV: 52,  // pt — vertical page margin
  sectionGap: 22,    // pt — between sections
  headingGap: 8,     // pt — between heading and content
  lineGap: 5,        // pt — between paragraphs/rows
}

export const TYPE = {
  coverCompany: 28,
  coverTitle: 14,
  coverMeta: 10,
  sectionHeading: 8,
  body: 10,
  small: 8.5,
  tableHeader: 8,
  tableCell: 9,
  footer: 7.5,
}
