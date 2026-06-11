"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Activity, Bell, Pencil, Search, StickyNote, Trash2, Users } from "lucide-react"
import type { Tag } from "@prisma/client"
import type { LeadWithTags } from "@/actions/leads"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, formatDate } from "@/lib/utils"
import { PIPELINE_STAGES, PRIORITIES } from "@/lib/validations/lead"
import { CreateLeadDialog } from "./create-lead-dialog"
import { EditLeadDialog } from "./edit-lead-dialog"
import { DeleteLeadDialog } from "./delete-lead-dialog"
import { AssigneeBadge } from "./assignee-badge"
import { TagBadge } from "./tag-badge"
import { LeadTagsPopover } from "./lead-tags-popover"
import { FollowUpBadge } from "./follow-up-badge"
import { CreateFollowUpDialog } from "@/components/follow-ups/create-follow-up-dialog"
import { LogActivityDialog } from "@/components/activities/log-activity-dialog"
import { QuickAddNoteDialog } from "@/components/notes/quick-add-note-dialog"

// ─── Badge helpers ─────────────────────────────────────────────────────────────

const STAGE_STYLES: Record<string, string> = {
  NEW_LEAD:       "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  QUALIFIED:      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  DISCOVERY_CALL: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  PROPOSAL_SENT:  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  FOLLOW_UP:      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  WON:            "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  LOST:           "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

const PRIORITY_STYLES: Record<string, string> = {
  LOW:    "bg-muted text-muted-foreground",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  HIGH:   "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

const STAGE_LABELS: Record<string, string> = {
  NEW_LEAD: "New Lead", QUALIFIED: "Qualified", DISCOVERY_CALL: "Discovery Call",
  PROPOSAL_SENT: "Proposal Sent", FOLLOW_UP: "Follow-up", WON: "Won", LOST: "Lost",
}

function StageBadge({ stage }: { stage: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_STYLES[stage]}`}>
      {STAGE_LABELS[stage]}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]}`}>
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search className="size-8 text-muted-foreground mb-3" />
        <p className="font-medium">No leads match your filters</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Users className="size-10 text-muted-foreground mb-4" />
      <p className="text-lg font-semibold">No leads yet</p>
      <p className="mt-1 text-sm text-muted-foreground mb-6">
        Add your first lead to start tracking your pipeline
      </p>
      <CreateLeadDialog services={[]} />
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface LeadsTableClientProps {
  leads: LeadWithTags[]
  services?: { id: string; name: string }[]
  teamMembers?: { id: string; name: string }[]
  allTags?: Tag[]
}

export function LeadsTableClient({ leads, services = [], teamMembers = [], allTags = [] }: LeadsTableClientProps) {
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState("ALL")
  const [priorityFilter, setPriorityFilter] = useState("ALL")
  const [editingLead, setEditingLead] = useState<LeadWithTags | null>(null)
  const [deletingLead, setDeletingLead] = useState<LeadWithTags | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return leads.filter((lead) => {
      const matchesSearch =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        (lead.companyName?.toLowerCase().includes(q) ?? false) ||
        (lead.email?.toLowerCase().includes(q) ?? false)

      const matchesStage =
        stageFilter === "ALL" || lead.pipelineStage === stageFilter

      const matchesPriority =
        priorityFilter === "ALL" || lead.priority === priorityFilter

      return matchesSearch && matchesStage && matchesPriority
    })
  }, [leads, search, stageFilter, priorityFilter])

  const isFiltered =
    !!search || stageFilter !== "ALL" || priorityFilter !== "ALL"

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <div className="relative min-w-[180px] flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search leads…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[155px]">
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All stages</SelectItem>
              {PIPELINE_STAGES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[145px]">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All priorities</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CreateLeadDialog services={services} teamMembers={teamMembers} />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState isFiltered={isFiltered} />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Lead
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tags
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Stage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Assigned
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Deal Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Next Follow-up
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Added
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="bg-card hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <Link href={`/leads/${lead.id}`} className="group text-left block">
                        <p className="font-medium group-hover:underline">
                          {lead.name}
                        </p>
                        {lead.companyName && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {lead.companyName}
                          </p>
                        )}
                        {lead.email && (
                          <p className="text-xs text-muted-foreground">
                            {lead.email}
                          </p>
                        )}
                      </Link>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-1">
                        {lead.tags.map(({ tag }) => (
                          <TagBadge key={tag.id} name={tag.name} color={tag.color} />
                        ))}
                        <LeadTagsPopover
                          leadId={lead.id}
                          allTags={allTags}
                          selectedTagIds={lead.tags.map((t) => t.tagId)}
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <StageBadge stage={lead.pipelineStage} />
                    </td>

                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={lead.priority} />
                    </td>

                    <td className="px-4 py-3.5">
                      <AssigneeBadge name={lead.assignedTo} />
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground">
                      {lead.dealValue != null
                        ? formatCurrency(lead.dealValue)
                        : "—"}
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground">
                      {lead.nextFollowUp ? (
                        <div className="flex items-center gap-2">
                          <span>{formatDate(lead.nextFollowUp)}</span>
                          <FollowUpBadge date={lead.nextFollowUp} hideLater />
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <CreateFollowUpDialog
                          leadId={lead.id}
                          teamMembers={teamMembers}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Add follow-up"
                            >
                              <Bell className="size-3.5" />
                            </Button>
                          }
                        />
                        <QuickAddNoteDialog
                          leadId={lead.id}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Add note"
                            >
                              <StickyNote className="size-3.5" />
                            </Button>
                          }
                        />
                        <LogActivityDialog
                          leadId={lead.id}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Log activity"
                            >
                              <Activity className="size-3.5" />
                            </Button>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingLead(lead)}
                          aria-label="Edit lead"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeletingLead(lead)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Delete lead"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
            {isFiltered && ` · filtered from ${leads.length} total`}
          </div>
        </div>
      )}

      {/* Single dialog instances driven by state */}
      <EditLeadDialog lead={editingLead} services={services} teamMembers={teamMembers} onClose={() => setEditingLead(null)} />
      <DeleteLeadDialog
        lead={deletingLead}
        onClose={() => setDeletingLead(null)}
      />
    </>
  )
}
