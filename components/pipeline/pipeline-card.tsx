"use client"

import Link from "next/link"
import { Bell, Receipt, ExternalLink, ListTodo } from "lucide-react"
import type { PipelineLead } from "@/actions/leads"
import { formatCurrency } from "@/lib/utils"
import { TaskDialog } from "@/components/tasks/task-dialog"

const PRIORITY_STYLES: Record<string, string> = {
  HIGH:   "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  LOW:    "bg-muted text-muted-foreground",
}

function followUpLabel(date: Date | null): { text: string; overdue: boolean } | null {
  if (!date) return null
  const d = new Date(date)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - todayStart.getTime()) / 86400000)
  if (diff === 0) return { text: "Today", overdue: false }
  if (diff === 1) return { text: "Tomorrow", overdue: false }
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, overdue: true }
  if (diff <= 7) return { text: `In ${diff}d`, overdue: false }
  return { text: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), overdue: false }
}

interface PipelineCardProps {
  lead: PipelineLead
  isDragging: boolean
  onDragStart: (id: string) => void
}

export function PipelineCard({ lead, isDragging, onDragStart }: PipelineCardProps) {
  const fu = followUpLabel(lead.nextFollowUp)
  const hasInvoice = lead._count.invoices > 0

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("leadId", lead.id)
        e.dataTransfer.effectAllowed = "move"
        onDragStart(lead.id)
      }}
      className={`group rounded-md border bg-card select-none cursor-grab active:cursor-grabbing transition-all duration-150 ${
        isDragging ? "opacity-40 scale-[0.97]" : "hover:border-primary/40 hover:shadow-sm"
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

        {/* Follow-up + assignee + dots */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {fu && (
              <span className={`flex items-center gap-0.5 text-[11px] ${fu.overdue ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}`}>
                <Bell className="size-3 shrink-0" />
                {fu.text}
              </span>
            )}
            {lead.assignedTo && (
              <span className="text-[11px] text-muted-foreground truncate">
                {fu ? "·" : ""} {lead.assignedTo}
              </span>
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
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors rounded-bl-md"
        >
          <ExternalLink className="size-3" />
          Open
        </Link>
        <Link
          href={`/financial/invoices/new?leadId=${lead.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <Receipt className="size-3" />
          Invoice
        </Link>
        <TaskDialog
          defaultRelatedType="LEAD"
          defaultRelatedId={lead.id}
          lockRelated
          trigger={
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors rounded-br-md"
            >
              <ListTodo className="size-3" />
              Task
            </button>
          }
        />
      </div>
    </div>
  )
}
