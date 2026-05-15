import { cn } from "@/lib/utils"
import { VISUAL_STYLE_CLASSES, LAYOUT_TYPE_CLASSES } from "./presets"
import type { VisualStyleKey, LayoutTypeKey, SectionVisualConfig } from "./types"
import type { ProposalSectionType } from "@prisma/client"

// ─── Spacing map ──────────────────────────────────────────────────────────────

const SPACING_CLASSES: Record<string, string> = {
  compact: "space-y-1",
  normal: "space-y-3",
  relaxed: "space-y-5",
}

// ─── Type-specific read-only content renderers ────────────────────────────────

export function TextContent({ content }: { content: string }) {
  if (!content.trim())
    return (
      <p className="text-sm text-muted-foreground italic">
        No content yet — click Edit to add.
      </p>
    )
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
      {content}
    </p>
  )
}

export function CoverContent({ content }: { content: string }) {
  return (
    <div className="text-center py-2 space-y-1">
      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    </div>
  )
}

interface PricingRow {
  item: string
  price: string
  notes: string
}

export function parsePricingContent(content: string): PricingRow[] {
  if (!content.trim()) return []
  return content
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const [item = "", price = "", notes = ""] = line.split("|").map((s) => s.trim())
      return { item, price, notes }
    })
}

export function serializePricing(rows: PricingRow[]): string {
  return rows
    .filter((r) => r.item.trim() || r.price.trim())
    .map((r) => [r.item, r.price, r.notes].join(" | "))
    .join("\n")
}

export function PricingContent({ content }: { content: string }) {
  const rows = parsePricingContent(content)
  if (rows.length === 0)
    return (
      <p className="text-sm text-muted-foreground italic">
        No pricing yet — click Edit to add line items.
      </p>
    )
  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
              Item
            </th>
            <th className="px-3 py-2 text-right font-medium text-xs text-muted-foreground">
              Price
            </th>
            <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground hidden sm:table-cell">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={cn("border-b last:border-0", i % 2 === 1 && "bg-muted/20")}>
              <td className="px-3 py-2.5">{row.item}</td>
              <td className="px-3 py-2.5 text-right font-medium tabular-nums">{row.price}</td>
              <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface TimelineRow {
  phase: string
  duration: string
  description: string
}

export function parseTimelineContent(content: string): TimelineRow[] {
  if (!content.trim()) return []
  return content
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const [phase = "", duration = "", description = ""] = line.split("|").map((s) => s.trim())
      return { phase, duration, description }
    })
}

export function serializeTimeline(rows: TimelineRow[]): string {
  return rows
    .filter((r) => r.phase.trim())
    .map((r) => [r.phase, r.duration, r.description].join(" | "))
    .join("\n")
}

export function TimelineContent({ content }: { content: string }) {
  const rows = parseTimelineContent(content)
  if (rows.length === 0)
    return (
      <p className="text-sm text-muted-foreground italic">
        No timeline yet — click Edit to add phases.
      </p>
    )
  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-md border bg-muted/20 px-4 py-3"
        >
          <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{row.phase}</p>
            {row.duration && (
              <p className="text-xs text-muted-foreground mt-0.5">{row.duration}</p>
            )}
          </div>
          {row.description && (
            <p className="text-xs text-muted-foreground max-w-xs shrink-0 hidden md:block">
              {row.description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Section content dispatcher ───────────────────────────────────────────────

export function SectionContent({
  type,
  content,
}: {
  type: ProposalSectionType
  content: string
}) {
  if (type === "COVER") return <CoverContent content={content} />
  if (type === "PRICING") return <PricingContent content={content} />
  if (type === "TIMELINE") return <TimelineContent content={content} />
  return <TextContent content={content} />
}

// ─── Styled section wrapper ───────────────────────────────────────────────────
// Applies visual preset + layout to any section's content.

export function SectionStyleWrapper({
  visualStyle,
  layoutType,
  config,
  title,
  showTitle = true,
  children,
  className,
}: {
  visualStyle: VisualStyleKey
  layoutType: LayoutTypeKey
  config?: SectionVisualConfig
  title?: string
  showTitle?: boolean
  children: React.ReactNode
  className?: string
}) {
  const preset = VISUAL_STYLE_CLASSES[visualStyle] ?? VISUAL_STYLE_CLASSES.CLEAN
  const layoutClass = LAYOUT_TYPE_CLASSES[layoutType] ?? LAYOUT_TYPE_CLASSES.FULL_WIDTH
  const spacingClass = config?.spacing ? SPACING_CLASSES[config.spacing] : "space-y-3"

  return (
    <div className={cn(layoutClass, className)}>
      <div className={cn(preset.section, spacingClass)}>
        {showTitle && title && (
          <h2 className={preset.title}>{title}</h2>
        )}
        <div className={preset.content}>{children}</div>
      </div>
    </div>
  )
}
