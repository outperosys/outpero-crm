import type { VisualStyleKey, LayoutTypeKey, AccentColorKey } from "./types"

// ─── Labels (for UI selectors) ────────────────────────────────────────────────

export const VISUAL_STYLE_LABELS: Record<VisualStyleKey, string> = {
  CLEAN: "Clean",
  MODERN: "Modern",
  HIGHLIGHT: "Highlight",
  MINIMAL: "Minimal",
  HERO: "Hero",
  TWO_COLUMN: "Two-Column",
}

export const VISUAL_STYLE_DESCRIPTIONS: Record<VisualStyleKey, string> = {
  CLEAN: "Standard text on white — for body content",
  MODERN: "Subtle card background — for deliverables",
  HIGHLIGHT: "Accent border strip — for key value props",
  MINIMAL: "Muted, reduced weight — for secondary content",
  HERO: "Large centered text — for cover pages",
  TWO_COLUMN: "Label left / content right — for metrics",
}

export const LAYOUT_TYPE_LABELS: Record<LayoutTypeKey, string> = {
  FULL_WIDTH: "Full Width",
  CENTERED: "Centered",
  TWO_COLUMN: "Two Column",
  CARD: "Card",
}

// ─── Web class presets ────────────────────────────────────────────────────────
// The renderer owns all styling. Components never hardcode styles.

export interface WebPreset {
  section: string  // classes applied to outer section container
  title: string    // classes applied to section title
  content: string  // classes applied to content area
}

export const VISUAL_STYLE_CLASSES: Record<VisualStyleKey, WebPreset> = {
  CLEAN: {
    section: "py-2",
    title: "text-base font-semibold text-foreground mb-3",
    content: "text-sm leading-relaxed text-foreground",
  },
  MODERN: {
    section: "rounded-lg bg-muted/40 px-5 py-4",
    title: "text-base font-semibold text-foreground mb-3",
    content: "text-sm leading-relaxed",
  },
  HIGHLIGHT: {
    section: "border-l-4 border-primary pl-5 py-3 bg-primary/5 rounded-r-lg",
    title: "text-base font-semibold text-primary mb-2",
    content: "text-sm leading-relaxed text-foreground",
  },
  MINIMAL: {
    section: "py-2 opacity-90",
    title: "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2",
    content: "text-sm leading-relaxed text-muted-foreground",
  },
  HERO: {
    section: "text-center py-8",
    title: "text-2xl font-bold text-foreground mb-3",
    content: "text-sm text-muted-foreground leading-relaxed",
  },
  TWO_COLUMN: {
    section: "py-2",
    title: "text-base font-semibold text-foreground mb-3",
    content: "text-sm",
  },
}

// Layout container classes
export const LAYOUT_TYPE_CLASSES: Record<LayoutTypeKey, string> = {
  FULL_WIDTH: "w-full",
  CENTERED: "max-w-2xl mx-auto",
  TWO_COLUMN: "grid grid-cols-2 gap-8",
  CARD: "rounded-xl border bg-card px-6 py-5",
}

// ─── Accent color resolution ───────────────────────────────────────────────────

export const ACCENT_COLORS: Record<AccentColorKey, { className: string }> = {
  primary: { className: "border-primary bg-primary/5" },
  blue:    { className: "border-blue-500 bg-blue-50 dark:bg-blue-950/30" },
  slate:   { className: "border-slate-400 bg-slate-50 dark:bg-slate-900/30" },
  amber:   { className: "border-amber-400 bg-amber-50 dark:bg-amber-950/30" },
  none:    { className: "" },
}
