"use client"

import { useTransition } from "react"
import { Trash2, Pencil, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateTaskStatus, reassignTask, deleteTask } from "@/actions/tasks"
import { TaskDialog } from "./task-dialog"
import { TASK_STATUSES } from "@/lib/validations/task"
import { STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from "./task-constants"
import { cn, formatDate } from "@/lib/utils"
import type { Task, TaskStatus } from "@prisma/client"

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === "DONE") return false
  return new Date(task.dueDate) < new Date(new Date().toDateString())
}

export function TaskItemCompact({
  task,
  teamMembers = [],
}: {
  task: Task
  teamMembers?: { id: string; name: string }[]
}) {
  const [isPending, startTransition] = useTransition()
  const overdue = isOverdue(task)

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    startTransition(async () => {
      await updateTaskStatus(task.id, e.target.value as TaskStatus)
    })
  }

  function handleReassign(e: React.ChangeEvent<HTMLSelectElement>) {
    startTransition(async () => {
      await reassignTask(task.id, e.target.value)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteTask(task.id)
    })
  }

  const assigneeOptions =
    task.assignedTo && !teamMembers.some((m) => m.name === task.assignedTo)
      ? [{ id: task.assignedTo, name: task.assignedTo }, ...teamMembers]
      : teamMembers

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border px-3.5 py-3 transition-colors",
        task.status === "DONE" && "opacity-60",
        overdue && "border-destructive/40 bg-destructive/5"
      )}
    >
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className={cn("text-sm", task.status === "DONE" && "line-through text-muted-foreground")}>
            {task.title}
          </p>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              PRIORITY_COLORS[task.priority]
            )}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                overdue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <Calendar className="size-3" />
              {overdue ? "Overdue · " : ""}
              {formatDate(task.dueDate)}
            </span>
          )}
          <select
            value={task.assignedTo ?? ""}
            onChange={handleReassign}
            disabled={isPending}
            className="h-6 cursor-pointer rounded-md border-none bg-transparent text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:outline-none"
          >
            <option value="">Unassigned</option>
            {assigneeOptions.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <select
          value={task.status}
          onChange={handleStatusChange}
          disabled={isPending}
          className={cn(
            "h-7 cursor-pointer rounded-md border-0 px-2 text-xs font-medium outline-none focus-visible:outline-none",
            STATUS_COLORS[task.status]
          )}
        >
          {TASK_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <TaskDialog
          task={task}
          lockRelated
          teamMembers={teamMembers}
          trigger={
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              title="Edit task"
              className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
            >
              <Pencil className="size-3.5" />
            </Button>
          }
        />

        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={handleDelete}
          title="Delete task"
          className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
