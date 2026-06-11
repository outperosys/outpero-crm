"use client"

import { useState, useTransition, useMemo } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PipelineCard } from "./pipeline-card"
import { updateLeadStage, type PipelineLead } from "@/actions/leads"
import { formatCurrency } from "@/lib/utils"
import type { Tag } from "@prisma/client"

// ─── Stage config ─────────────────────────────────────────────────────────────

const BOARD_STAGES = [
  { key: "NEW_LEAD",       label: "New Lead" },
  { key: "QUALIFIED",      label: "Contacted" },
  { key: "DISCOVERY_CALL", label: "Discovery Scheduled" },
  { key: "DISCOVERY_DONE", label: "Discovery Done" },
  { key: "PROPOSAL_SENT",  label: "Proposal Sent" },
  { key: "FOLLOW_UP",      label: "Negotiation" },
  { key: "WON",            label: "Won" },
  { key: "LOST",           label: "Lost" },
] as const

type StageKey = typeof BOARD_STAGES[number]["key"]

function unique(arr: (string | null)[]): string[] {
  return [...new Set(arr.filter(Boolean) as string[])].sort()
}

// ─── Board ────────────────────────────────────────────────────────────────────

export function PipelineBoard({
  initialLeads,
  stageLabels = {},
  teamMembers = [],
  allTags = [],
}: {
  initialLeads: PipelineLead[]
  stageLabels?: Record<string, string>
  teamMembers?: { id: string; name: string }[]
  allTags?: Tag[]
}) {
  const [leads, setLeads] = useState<PipelineLead[]>(initialLeads)
  const [, startTransition] = useTransition()

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<StageKey | null>(null)

  const [search, setSearch] = useState("")
  const [filterPriority, setFilterPriority] = useState("ALL")
  const [filterAssignee, setFilterAssignee] = useState("ALL")
  const [filterService, setFilterService] = useState("ALL")

  const allAssignees = useMemo(() => unique(leads.map((l) => l.assignedTo)), [leads])
  const allServices = useMemo(() => unique(leads.map((l) => l.serviceInterested)), [leads])

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase()
    return leads.filter((l) => {
      if (q) {
        const hay = `${l.name} ${l.companyName ?? ""} ${l.email ?? ""}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filterPriority !== "ALL" && l.priority !== filterPriority) return false
      if (filterAssignee !== "ALL" && (l.assignedTo ?? "") !== filterAssignee) return false
      if (filterService !== "ALL" && (l.serviceInterested ?? "") !== filterService) return false
      return true
    })
  }, [leads, search, filterPriority, filterAssignee, filterService])

  const isFiltered = !!search || filterPriority !== "ALL" || filterAssignee !== "ALL" || filterService !== "ALL"

  function handleDragStart(leadId: string) { setDraggingId(leadId) }

  function handleDragOver(e: React.DragEvent, stage: StageKey) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setOverStage(stage)
  }

  function handleDrop(e: React.DragEvent, stage: StageKey) {
    e.preventDefault()
    const leadId = e.dataTransfer.getData("leadId") || draggingId
    setDraggingId(null)
    setOverStage(null)
    if (!leadId) return
    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.pipelineStage === stage) return
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, pipelineStage: stage } : l)))
    startTransition(async () => { await updateLeadStage(leadId, stage) })
  }

  function clearFilters() {
    setSearch("")
    setFilterPriority("ALL")
    setFilterAssignee("ALL")
    setFilterService("ALL")
  }

  return (
    <div className="flex flex-col gap-4 min-h-0 flex-1">
      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <div className="relative min-w-[180px] max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All priorities</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>

        {allAssignees.length > 0 && (
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Assigned to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All assignees</SelectItem>
              {allAssignees.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {allServices.length > 0 && (
          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger className="w-[170px] h-9">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All services</SelectItem>
              {allServices.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {isFiltered && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
            Clear
          </button>
        )}

        <span className="ml-auto text-sm text-muted-foreground">
          {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Board ─────────────────────────────────────────────────────────── */}
      <div
        className="flex gap-3 overflow-x-auto pb-2 flex-1 min-h-0"
        onDragEnd={() => { setDraggingId(null); setOverStage(null) }}
      >
        {BOARD_STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.pipelineStage === stage.key)
          const totalValue = stageLeads.reduce((s, l) => s + (l.dealValue ?? 0), 0)
          const isOver = overStage === stage.key

          return (
            <div
              key={stage.key}
              className={`flex flex-col shrink-0 w-[258px] rounded-lg border bg-muted/30 transition-colors duration-150 ${
                isOver ? "border-primary/40 bg-primary/5" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, stage.key)}
              onDragLeave={() => setOverStage(null)}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              {/* Column header */}
              <div className="px-3 pt-3 pb-2.5 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {stageLabels[stage.key] || stage.label}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                    {stageLeads.length}
                  </span>
                </div>
                {totalValue > 0 && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5 tabular-nums">
                    {formatCurrency(totalValue)}
                  </p>
                )}
              </div>

              {/* Cards — scrollbar hidden */}
              <div
                className="flex-1 overflow-y-auto p-2 space-y-1.5 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none" } as React.CSSProperties}
              >
                {stageLeads.length === 0 ? (
                  <div className={`flex items-center justify-center h-14 rounded-md border border-dashed transition-colors ${isOver ? "border-primary/40" : "border-border/50"}`}>
                    <span className="text-xs text-muted-foreground/50">
                      {isOver ? "Drop here" : "Empty"}
                    </span>
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <PipelineCard
                      key={lead.id}
                      lead={lead}
                      isDragging={draggingId === lead.id}
                      onDragStart={handleDragStart}
                      teamMembers={teamMembers}
                      allTags={allTags}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
