"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  updateProposalSection,
  reorderProposalSection,
  toggleProposalSectionVisibility,
} from "@/actions/proposals"
import type { ProposalSection } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  Eye,
  EyeOff,
  Check,
  X,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Pricing parser ───────────────────────────────────────────────────────────

interface PricingRow { item: string; price: string; notes: string }

function parsePricing(content: string): PricingRow[] {
  if (!content.trim()) return [{ item: "", price: "", notes: "" }]
  return content
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const [item = "", price = "", notes = ""] = line.split("|").map((s) => s.trim())
      return { item, price, notes }
    })
}

function serializePricing(rows: PricingRow[]): string {
  return rows
    .filter((r) => r.item.trim() || r.price.trim())
    .map((r) => [r.item, r.price, r.notes].join(" | "))
    .join("\n")
}

// ─── Timeline parser ──────────────────────────────────────────────────────────

interface TimelineRow { phase: string; duration: string; description: string }

function parseTimeline(content: string): TimelineRow[] {
  if (!content.trim()) return [{ phase: "", duration: "", description: "" }]
  return content
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const [phase = "", duration = "", description = ""] = line.split("|").map((s) => s.trim())
      return { phase, duration, description }
    })
}

function serializeTimeline(rows: TimelineRow[]): string {
  return rows
    .filter((r) => r.phase.trim())
    .map((r) => [r.phase, r.duration, r.description].join(" | "))
    .join("\n")
}

// ─── Read-only renderers ──────────────────────────────────────────────────────

function TextRenderer({ content }: { content: string }) {
  if (!content.trim()) return <p className="text-sm text-muted-foreground italic">No content yet — click Edit to add.</p>
  return <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{content}</p>
}

function CoverRenderer({ content }: { content: string }) {
  return (
    <div className="text-center py-4 space-y-1">
      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
  )
}

function PricingRenderer({ content }: { content: string }) {
  const rows = parsePricing(content)
  if (rows.length === 0 || (rows.length === 1 && !rows[0].item)) {
    return <p className="text-sm text-muted-foreground italic">No pricing yet — click Edit to add line items.</p>
  }
  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">Item</th>
            <th className="px-3 py-2 text-right font-medium text-xs text-muted-foreground">Price</th>
            <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground hidden sm:table-cell">Notes</th>
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

function TimelineRenderer({ content }: { content: string }) {
  const rows = parseTimeline(content)
  if (rows.length === 0 || (rows.length === 1 && !rows[0].phase)) {
    return <p className="text-sm text-muted-foreground italic">No timeline yet — click Edit to add phases.</p>
  }
  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-4 rounded-md border bg-muted/20 px-4 py-3">
          <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{row.phase}</p>
            {row.duration && <p className="text-xs text-muted-foreground mt-0.5">{row.duration}</p>}
          </div>
          {row.description && (
            <p className="text-xs text-muted-foreground max-w-xs shrink-0 hidden md:block">{row.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Edit forms ───────────────────────────────────────────────────────────────

function PricingEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [rows, setRows] = useState<PricingRow[]>(() => parsePricing(value))

  function update(index: number, field: keyof PricingRow, val: string) {
    const next = rows.map((r, i) => (i === index ? { ...r, [field]: val } : r))
    setRows(next)
    onChange(serializePricing(next))
  }

  function addRow() {
    const next = [...rows, { item: "", price: "", notes: "" }]
    setRows(next)
  }

  function removeRow(index: number) {
    const next = rows.filter((_, i) => i !== index)
    setRows(next.length ? next : [{ item: "", price: "", notes: "" }])
    onChange(serializePricing(next))
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

function TimelineEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [rows, setRows] = useState<TimelineRow[]>(() => parseTimeline(value))

  function update(index: number, field: keyof TimelineRow, val: string) {
    const next = rows.map((r, i) => (i === index ? { ...r, [field]: val } : r))
    setRows(next)
    onChange(serializeTimeline(next))
  }

  function addRow() {
    const next = [...rows, { phase: "", duration: "", description: "" }]
    setRows(next)
  }

  function removeRow(index: number) {
    const next = rows.filter((_, i) => i !== index)
    setRows(next.length ? next : [{ phase: "", duration: "", description: "" }])
    onChange(serializeTimeline(next))
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_140px_1fr_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
        <span>Phase</span><span>Duration</span><span>Description (optional)</span><span />
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_140px_1fr_32px] gap-2 items-center">
          <Input className="h-8 text-sm" placeholder="e.g. Phase 1: Discovery" value={row.phase} onChange={(e) => update(i, "phase", e.target.value)} />
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

export function ProposalSectionCard({
  section,
  proposalId,
  isFirst,
  isLast,
}: ProposalSectionCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(section.content)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isCover = section.type === "COVER"
  const isPricing = section.type === "PRICING"
  const isTimeline = section.type === "TIMELINE"

  function handleSave() {
    startTransition(async () => {
      await updateProposalSection(section.id, proposalId, draft)
      setEditing(false)
    })
  }

  function handleCancel() {
    setDraft(section.content)
    setEditing(false)
  }

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

  // Hidden section — compact ghost row
  if (!section.isVisible) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/20 px-4 py-2.5 opacity-50 hover:opacity-100 transition-opacity">
        <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground flex-1">{section.title}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground"
          onClick={handleToggleVisibility}
          disabled={isPending}
        >
          Restore
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("rounded-xl border bg-card", isPending && "opacity-60 pointer-events-none")}>
      {/* Card header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b">
        {/* Reorder */}
        <div className="flex gap-0.5 shrink-0">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleMoveUp} disabled={isFirst || isPending} aria-label="Move up">
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleMoveDown} disabled={isLast || isPending} aria-label="Move down">
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Section title + badges */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <h2 className={cn("font-medium truncate", isCover ? "text-base" : "text-sm")}>
            {section.title}
          </h2>
          {section.isAIGenerated && (
            <Badge variant="secondary" className="text-xs gap-1 shrink-0">
              <Sparkles className="h-2.5 w-2.5" />AI
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleToggleVisibility}
            disabled={isPending}
            aria-label="Hide section"
          >
            <EyeOff className="h-3.5 w-3.5" />
          </Button>
          {!editing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setEditing(true)}
              aria-label="Edit section"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Card content */}
      <div className={cn("px-5 py-5", isCover && "py-8")}>
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
                rows={isCover ? 4 : 6}
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
          <>
            {isCover && <CoverRenderer content={section.content} />}
            {isPricing && <PricingRenderer content={section.content} />}
            {isTimeline && <TimelineRenderer content={section.content} />}
            {!isCover && !isPricing && !isTimeline && <TextRenderer content={section.content} />}
          </>
        )}
      </div>
    </div>
  )
}
