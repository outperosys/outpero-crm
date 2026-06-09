"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { CheckCircle2, Trash2, Calendar, User, Building2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteFollowUp } from "@/actions/follow-ups"
import { CompleteFollowUpDialog } from "./complete-follow-up-dialog"
import { AIGeneratorSheet } from "./ai-generator-sheet"
import { cn, formatDate, formatTime } from "@/lib/utils"
import type { FollowUpWithLead } from "@/actions/follow-ups"

const STAGE_LABELS: Record<string, string> = {
  NEW_LEAD: "New Lead",
  QUALIFIED: "Qualified",
  DISCOVERY_CALL: "Discovery Call",
  PROPOSAL_SENT: "Proposal Sent",
  FOLLOW_UP: "Follow-up",
  WON: "Won",
  LOST: "Lost",
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

export type CardVariant = "overdue" | "today" | "upcoming" | "completed"

function getDueDateLabel(dueDate: Date, variant: CardVariant): string {
  const time = formatTime(dueDate)
  const at = time ? ` · ${time}` : ""

  if (variant === "completed") return `Completed ${formatDate(dueDate)}${at}`

  const today = new Date()
  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const dueMs = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime()
  const diffDays = Math.round((dueMs - todayMs) / 86400000)

  if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} overdue${at}`
  if (diffDays === 0) return `Due today${at}`
  if (diffDays === 1) return `Due tomorrow${at}`
  if (diffDays <= 7) return `Due in ${diffDays} days${at}`
  return `Due ${formatDate(dueDate)}${at}`
}

export function FollowUpCard({
  followUp,
  variant,
  teamMembers = [],
}: {
  followUp: FollowUpWithLead
  variant: CardVariant
  teamMembers?: { id: string; name: string }[]
}) {
  const [completeOpen, setCompleteOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteFollowUp(followUp.id)
    })
  }

  const dueDateLabel = getDueDateLabel(followUp.dueDate, variant)

  return (
    <>
      <div
        className={cn(
          "group rounded-lg border bg-card px-4 py-3.5 transition-colors",
          variant === "overdue" && "border-destructive/30 bg-destructive/5",
          variant === "today" &&
            "border-amber-300/60 bg-amber-50/50 dark:border-amber-700/50 dark:bg-amber-900/10",
          variant === "completed" && "opacity-60"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Lead info row */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link
                href={`/leads/${followUp.lead.id}`}
                className="font-medium text-sm hover:underline underline-offset-4"
              >
                {followUp.lead.name}
              </Link>
              {followUp.lead.companyName && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="size-3" />
                  {followUp.lead.companyName}
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  PRIORITY_COLORS[followUp.lead.priority]
                )}
              >
                {followUp.lead.priority.charAt(0) +
                  followUp.lead.priority.slice(1).toLowerCase()}
              </span>
              <span className="text-xs text-muted-foreground">
                {STAGE_LABELS[followUp.lead.pipelineStage]}
              </span>
            </div>

            {/* Follow-up title */}
            <p
              className={cn(
                "text-sm",
                variant === "completed" && "line-through text-muted-foreground"
              )}
            >
              {followUp.title}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap gap-3">
              <span
                className={cn(
                  "flex items-center gap-1 text-xs",
                  variant === "overdue"
                    ? "text-destructive"
                    : variant === "today"
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-muted-foreground"
                )}
              >
                <Calendar className="size-3" />
                {dueDateLabel}
              </span>
              {followUp.assignedTo && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="size-3" />
                  {followUp.assignedTo}
                </span>
              )}
              {followUp.lead.lastContacted && (
                <span className="text-xs text-muted-foreground">
                  Last contacted {formatDate(followUp.lead.lastContacted)}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {!followUp.completed && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setAiOpen(true)}
                  disabled={isPending}
                  title="Generate AI message"
                  className="text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                >
                  <Sparkles className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCompleteOpen(true)}
                  disabled={isPending}
                  className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <CheckCircle2 className="size-3.5" />
                  Complete
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              onClick={handleDelete}
              className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {!followUp.completed && (
        <CompleteFollowUpDialog
          open={completeOpen}
          onOpenChange={setCompleteOpen}
          followUpId={followUp.id}
          title={followUp.title}
          assignedTo={followUp.assignedTo}
          teamMembers={teamMembers}
        />
      )}

      <AIGeneratorSheet
        open={aiOpen}
        onOpenChange={setAiOpen}
        leadId={followUp.lead.id}
        leadName={followUp.lead.name}
        followUpTitle={followUp.title}
      />
    </>
  )
}
