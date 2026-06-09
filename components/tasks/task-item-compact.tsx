"use client"

import { useTransition } from "react"
import { Trash2, User, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toggleTask, deleteTask } from "@/actions/tasks"
import { cn, formatDate } from "@/lib/utils"
import type { Task } from "@prisma/client"

function isOverdue(task: Task) {
  if (!task.dueDate || task.completed) return false
  return new Date(task.dueDate) < new Date(new Date().toDateString())
}

export function TaskItem({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition()
  const overdue = isOverdue(task)

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      await toggleTask(task.id, task.leadId, checked)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteTask(task.id, task.leadId)
    })
  }

  return (
    <div className={cn(
      "group flex items-start gap-3 rounded-lg border px-3.5 py-3 transition-colors",
      task.completed && "opacity-60",
      overdue && !task.completed && "border-destructive/40 bg-destructive/5"
    )}>
      <Checkbox
        checked={task.completed}
        onCheckedChange={handleToggle}
        disabled={isPending}
        className="mt-0.5 shrink-0"
      />

      <div className="flex-1 min-w-0 space-y-1">
        <p className={cn("text-sm", task.completed && "line-through text-muted-foreground")}>
          {task.title}
        </p>
        <div className="flex flex-wrap gap-3">
          {task.dueDate && (
            <span className={cn(
              "flex items-center gap-1 text-xs",
              overdue && !task.completed ? "text-destructive" : "text-muted-foreground"
            )}>
              <Calendar className="size-3" />
              {overdue && !task.completed ? "Overdue · " : ""}
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.assignedTo && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="size-3" />
              {task.assignedTo}
            </span>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        onClick={handleDelete}
        className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="size-3" />
      </Button>
    </div>
  )
}
