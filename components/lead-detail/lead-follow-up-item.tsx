"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Trash2, Calendar, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CompleteFollowUpDialog } from "@/components/follow-ups/complete-follow-up-dialog"
import { AIGeneratorSheet } from "@/components/follow-ups/ai-generator-sheet"
import { deleteFollowUp } from "@/actions/follow-ups"
import { cn, formatDate } from "@/lib/utils"
import type { FollowUp } from "@prisma/client"

function getDiffDays(dueDate: Date): number {
  const today = new Date()
  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const dueMs = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime()
  return Math.round((dueMs - todayMs) / 86400000)
}

export function LeadFollowUpItem({
  followUp,
  leadName,
}: {
  followUp: FollowUp
  leadName: string
}) {
  const [completeOpen, setCompleteOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const diffDays = followUp.completed ? null : getDiffDays(followUp.dueDate)
  const isOverdue = diffDays !== null && diffDays < 0
  const isToday = diffDays === 0

  function handleDelete() {
    startTransition(async () => {
      await deleteFollowUp(followUp.id)
    })
  }

  function dueDateLabel(): string {
    if (followUp.completed) {
      return followUp.completedAt
        ? `Completed ${formatDate(followUp.completedAt)}`
        : "Completed"
    }
    if (diffDays === null) return formatDate(followUp.dueDate)
    if (diffDays < 0)
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} overdue`
    if (diffDays === 0) return "Due today"
    if (diffDays === 1) return "Due tomorrow"
    return formatDate(followUp.dueDate)
  }

  return (
    <>
      <div
        className={cn(
          "group flex items-start gap-3 rounded-lg border px-3.5 py-3 transition-colors",
          followUp.completed && "opacity-60",
          isOverdue && "border-destructive/40 bg-destructive/5",
          isToday &&
            !followUp.completed &&
            "border-amber-300/60 bg-amber-50/50 dark:border-amber-700/50 dark:bg-amber-900/10"
        )}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <p
            className={cn(
              "text-sm",
              followUp.completed && "line-through text-muted-foreground"
            )}
          >
            {followUp.title}
          </p>
          <div className="flex flex-wrap gap-3">
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue
                  ? "text-destructive"
                  : isToday && !followUp.completed
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-muted-foreground"
              )}
            >
              <Calendar className="size-3" />
              {dueDateLabel()}
            </span>
            {followUp.assignedTo && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="size-3" />
                {followUp.assignedTo}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
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
                size="icon-sm"
                onClick={() => setCompleteOpen(true)}
                disabled={isPending}
                title="Mark complete"
                className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                <CheckCircle2 className="size-3.5" />
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
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>

      {!followUp.completed && (
        <>
          <CompleteFollowUpDialog
            open={completeOpen}
            onOpenChange={setCompleteOpen}
            followUpId={followUp.id}
            title={followUp.title}
            assignedTo={followUp.assignedTo}
          />
          <AIGeneratorSheet
            open={aiOpen}
            onOpenChange={setAiOpen}
            leadId={followUp.leadId}
            leadName={leadName}
            followUpTitle={followUp.title}
          />
        </>
      )}
    </>
  )
}
