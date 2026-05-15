"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  updateProposalSection,
  reorderProposalSection,
  toggleProposalSectionVisibility,
} from "@/actions/proposals"
import type { ProposalSection } from "@prisma/client"
import {
  SectionContent,
  PricingContent,
  TimelineContent,
  parsePricingContent,
  parseTimelineContent,
  serializePricing,
  serializeTimeline,
  SectionStyleWrapper,
} from "@/lib/proposal/renderer"
import { VISUAL_STYLE_LABELS, LAYOUT_TYPE_LABELS } from "@/lib/proposal/presets"
import type { VisualStyleKey, LayoutTypeKey } from "@/lib/proposal/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  EyeOff,
  Check,
  X,
  Plus,
  Trash2,
  Sparkles,
  Wand2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Pricing editor ───────────────────────────────────────────────────────────

interface PricingRow { item: string; price: string; notes: string }

function PricingEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [rows, setRows] = useState<PricingRow[]>(() => {
    const parsed = parsePricingContent(value)
    return parsed.length > 0 ? parsed : [{ item: "", price: "", notes: "" }]
  })

  function update(index: number, field: keyof PricingRow, val: string) {
    const next = rows.map((r, i) => (i === index ? { ...r, [field]: val } : r))
    setRows(next)
    onChange(serializePricing(next))
  }

  function addRow() { setRows([...rows, { item: "", price: "", notes: "" }]) }

  function removeRow(index: number) {
    const next = rows.filter((_, i) => i !== index)
    const result = next.length ? next : [{ item: "", price: "", notes: "" }]
    setRows(result)
    onChange(serializePricing(result))
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_120px_1fr_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
        <span>Item</span><span>Price</span><span>Notes (optional)</span><span />
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_120px_1fr_32px] gap-2 items-center">
          <Input className="h-8 text-sm" placeholder="e.g. Setup fee" value={row.item} onChange={(e) => update(i, "item", e.target.value)} />
          <Input className="h-8 text-sm" placeholder="$0" value={row.price} onChange={(e) => update(i, "price", e.target.value)} />
          <Input className="h-8 text-sm" placeholder="One-time" value={row.notes} onChange={(e) => update(i, "notes", e.target.value)} />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeRow(i)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addRow} className="w-full">
        <Plus className="h-3.5 w-3.5 mr-1.5" />Add line item
      </Button>
    </div>
  )
}

// ─── Timeline editor ──────────────────────────────────────────────────────────

interface TimelineRow { phase: string; duration: string; description: string }

function TimelineEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [rows, setRows] = useState<TimelineRow[]>(() => {
    const parsed = parseTimelineContent(value)
    return parsed.length > 0 ? parsed : [{ phase: "", duration: "", description: "" }]
  })

  function update(index: number, field: keyof TimelineRow, val: string) {
    const next = rows.map((r, i) => (i === index ? { ...r, [field]: val } : r))
    setRows(next)
    onChange(serializeTimeline(next))
  }

  function addRow() { setRows([...rows, { phase: "", duration: "", description: "" }]) }

  function removeRow(index: number) {
    const next = rows.filter((_, i) => i !== index)
    const result = next.length ? next : [{ phase: "", duration: "", description: "" }]
    setRows(result)
    onChange(serializeTimeline(result))
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_140px_1fr_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
        <span>Phase</span><span>Duration</span><span>Description</span><span />
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_140px_1fr_32px] gap-2 items-center">
          <Input className="h-8 text-sm" placeholder="Phase 1: Discovery" value={row.phase} onChange={(e) => update(i, "phase", e.target.value)} />
          <Input className="h-8 text-sm" placeholder="Week 1–2" value={row.duration} onChange={(e) => update(i, "duration", e.target.value)} />
          <Input className="h-8 text-sm" placeholder="Details…" value={row.description} onChange={(e) => update(i, "description", e.target.value)} />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeRow(i)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addRow} className="w-full">
        <Plus className="h-3.5 w-3.5 mr-1.5" />Add phase
      </Button>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────

interface ProposalSectionCardProps {
  section: ProposalSection
  proposalId: string
  isFirst: boolean
  isLast: boolean
}

export function ProposalSectionCard({ section, proposalId, isFirst, isLast }: ProposalSectionCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(section.content)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isPricing = section.type === "PRICING"
  const isTimeline = section.type === "TIMELINE"
  const isCover = section.type === "COVER"

  const visualStyle = (section.visualStyle ?? "CLEAN") as VisualStyleKey
  const layoutType = (section.layoutType ?? "FULL_WIDTH") as LayoutTypeKey
  const styleLabel = VISUAL_STYLE_LABELS[visualStyle]

  function handleSave() {
    startTransition(async () => {
      await updateProposalSection(section.id, proposalId, draft)
      setEditing(false)
    })
  }

  function handleCancel() { setDraft(section.content); setEditing(false) }

  function handleMoveUp() {
    startTransition(async () => { await reorderProposalSection(proposalId, section.id, "up") })
  }

  function handleMoveDown() {
    startTransition(async () => { await reorderProposalSection(proposalId, section.id, "down") })
  }

  function handleToggleVisibility() {
    startTransition(async () => {
      await toggleProposalSectionVisibility(section.id, proposalId)
      router.refresh()
    })
  }

  if (!section.isVisible) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/20 px-4 py-2.5 opacity-50 hover:opacity-100 transition-opacity">
        <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground flex-1">{section.title}</span>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground" onClick={handleToggleVisibility} disabled={isPending}>
          Restore
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", isPending && "opacity-60 pointer-events-none")}>
      {/* Card header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b bg-muted/20">
        <div className="flex gap-0.5 shrink-0">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleMoveUp} disabled={isFirst || isPending}>
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleMoveDown} disabled={isLast || isPending}>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <h2 className={cn("font-medium truncate", isCover ? "text-base" : "text-sm")}>
            {section.title}
          </h2>
          {section.isAIGenerated && (
            <Badge variant="secondary" className="text-xs gap-1 shrink-0">
              <Sparkles className="h-2.5 w-2.5" />AI
            </Badge>
          )}
          <span className="text-xs text-muted-foreground hidden sm:inline shrink-0">{styleLabel}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleToggleVisibility} disabled={isPending} title="Hide section">
            <EyeOff className="h-3.5 w-3.5" />
          </Button>
          {!editing && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setEditing(true)} title="Edit section">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Card content — styled via renderer */}
      <div className="px-5 py-5">
        {editing ? (
          <div className="space-y-3">
            {isPricing ? (
              <PricingEditor value={draft} onChange={setDraft} />
            ) : isTimeline ? (
              <TimelineEditor value={draft} onChange={setDraft} />
            ) : (
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={isCover ? 4 : 7}
                className="text-sm resize-none font-[inherit] leading-relaxed"
                placeholder="Write section content…"
                autoFocus
              />
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending}>
                <X className="h-3.5 w-3.5 mr-1.5" />Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isPending}>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                {isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <SectionStyleWrapper
            visualStyle={visualStyle}
            layoutType={layoutType}
            title={isCover ? undefined : undefined}
            showTitle={false}
          >
            <SectionContent type={section.type} content={section.content} />
          </SectionStyleWrapper>
        )}
      </div>
    </div>
  )
}
