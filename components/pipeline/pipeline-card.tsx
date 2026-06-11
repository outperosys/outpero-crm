"use client"

import Link from "next/link"
import { Activity, Bell, Receipt, ExternalLink, ListTodo, StickyNote, Tag as TagIcon } from "lucide-react"
import type { PipelineLead } from "@/actions/leads"
import type { Tag } from "@prisma/client"
import { formatCurrency } from "@/lib/utils"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { AssigneeBadge } from "@/components/leads/assignee-badge"
import { CreateFollowUpDialog } from "@/components/follow-ups/create-follow-up-dialog"
import { LogActivityDialog } from "@/components/activities/log-activity-dialog"
import { QuickAddNoteDialog } from "@/components/notes/quick-add-note-dialog"
import { TagBadge } from "@/components/leads/tag-badge"
import { LeadTagsPopover } from "@/components/leads/lead-tags-popover"
import { FollowUpBadge } from "@/components/leads/follow-up-badge"
import { getFollowUpStatus } from "@/lib/follow-up"

const PRIORITY_STYLES: Record<string, string> = {
  HIGH:   "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  LOW:    "bg-muted text-muted-foreground",
}

interface PipelineCardProps {
  lead: PipelineLead
  isDragging: boolean
  onDragStart: (id: string) => void
  teamMembers?: { id: string; name: string }[]
  allTags?: Tag[]
}

export function PipelineCard({ lead, isDragging, onDragStart, teamMembers = [], allTags = [] }: PipelineCardProps) {
  const fu = lead.nextFollowUp ? getFollowUpStatus(lead.nextFollowUp) : null
  const hasInvoice = lead._count.invoices > 0
  const needsAttention = fu?.urgency === "overdue" || fu?.urgency === "today"

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("leadId", lead.id)
        e.dataTransfer.effectAllowed = "move"
        onDragStart(lead.id)
      }}
      className={`group rounded-md border bg-card select-none cursor-grab active:cursor-grabbing transition-all duration-150 ${
        isDragging
          ? "opacity-40 scale-[0.97]"
          : needsAttention
            ? `${fu?.urgency === "overdue" ? "border-red-300 dark:border-red-900/60" : "border-amber-300 dark:border-amber-900/60"} hover:shadow-sm`
            : "hover:border-primary/40 hover:shadow-sm"
      }`}
    >
      <div className="p-3 space-y-2">
        {/* Company + priority */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium leading-snug truncate">
            {lead.companyName || lead.name}
          </span>
          <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[lead.priority]}`}>
            {lead.priority.charAt(0) + lead.priority.slice(1).toLowerCase()}
          </span>
        </div>

        {/* Lead name if different */}
        {lead.companyName && (
          <p className="text-xs text-muted-foreground truncate -mt-1">{lead.name}</p>
        )}

        {/* Service + deal value */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground truncate">
            {lead.serviceInterested || "—"}
          </span>
          {lead.dealValue != null && lead.dealValue > 0 && (
            <span className="shrink-0 text-xs font-semibold">
              {formatCurrency(lead.dealValue)}
            </span>
          )}
        </div>

        {/* Tags */}
        {lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lead.tags.map(({ tag }) => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
        )}

        {/* Follow-up + assignee + dots */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <FollowUpBadge date={lead.nextFollowUp} className="px-1.5 py-0" />
            {lead.assignedTo && (
              <AssigneeBadge name={lead.assignedTo} className="px-1.5 py-0 text-[10px]" />
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {hasInvoice && (
              <span title="Invoice exists">
                <Receipt className="size-3 text-emerald-500" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions — appear on hover */}
      <div className="border-t opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center divide-x">
        <Link
          href={`/leads/${lead.id}`}
          onClick={(e) => e.stopPropagation()}
          title="Open lead"
          className="flex-1 flex items-center justify-center py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors rounded-bl-md"
        >
          <ExternalLink className="size-3.5" />
        </Link>
        <Link
          href={`/financial/invoices/new?leadId=${lead.id}`}
          onClick={(e) => e.stopPropagation()}
          title="Create invoice"
          className="flex-1 flex items-center justify-center py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <Receipt className="size-3.5" />
        </Link>
        <TaskDialog
          defaultRelatedType="LEAD"
          defaultRelatedId={lead.id}
          lockRelated
          trigger={
            <button
              onClick={(e) => e.stopPropagation()}
              title="Add task"
              className="flex-1 flex items-center justify-center py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <ListTodo className="size-3.5" />
            </button>
          }
        />
        <CreateFollowUpDialog
          leadId={lead.id}
          teamMembers={teamMembers}
          trigger={
            <button
              onClick={(e) => e.stopPropagation()}
              title="Add follow-up"
              className="flex-1 flex items-center justify-center py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <Bell className="size-3.5" />
            </button>
          }
        />
        <QuickAddNoteDialog
          leadId={lead.id}
          trigger={
            <button
              onClick={(e) => e.stopPropagation()}
              title="Add note"
              className="flex-1 flex items-center justify-center py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <StickyNote className="size-3.5" />
            </button>
          }
        />
        <LogActivityDialog
          leadId={lead.id}
          trigger={
            <button
              onClick={(e) => e.stopPropagation()}
              title="Log activity"
              className="flex-1 flex items-center justify-center py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <Activity className="size-3.5" />
            </button>
          }
        />
        <LeadTagsPopover
          leadId={lead.id}
          allTags={allTags}
          selectedTagIds={lead.tags.map((t) => t.tagId)}
          trigger={
            <button
              onClick={(e) => e.stopPropagation()}
              title="Manage tags"
              className="flex-1 flex items-center justify-center py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors rounded-br-md"
            >
              <TagIcon className="size-3.5" />
            </button>
          }
        />
      </div>
    </div>
  )
}
