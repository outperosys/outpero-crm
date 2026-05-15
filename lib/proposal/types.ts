// ─── Visual configuration types ───────────────────────────────────────────────

export type VisualStyleKey =
  | "CLEAN"
  | "MODERN"
  | "HIGHLIGHT"
  | "MINIMAL"
  | "HERO"
  | "TWO_COLUMN"

export type LayoutTypeKey = "FULL_WIDTH" | "CENTERED" | "TWO_COLUMN" | "CARD"

export type AccentColorKey = "primary" | "blue" | "slate" | "amber" | "none"
export type AlignmentValue = "left" | "center" | "right"
export type SpacingValue = "compact" | "normal" | "relaxed"
export type EmphasisLevel = "low" | "medium" | "high"
export type WidthValue = "narrow" | "normal" | "wide"

// Stored in ProposalTemplateSection.metadata and ProposalSection.metadata
// as { visualConfig: SectionVisualConfig }
export interface SectionVisualConfig {
  alignment?: AlignmentValue
  spacing?: SpacingValue
  accentColor?: AccentColorKey
  showDivider?: boolean
  emphasisLevel?: EmphasisLevel
  width?: WidthValue
}
