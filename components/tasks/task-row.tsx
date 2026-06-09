"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Trash2, CheckCircle2, Pencil, Calendar, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateTaskStatus, reassignTask, deleteTask } from "@/actions/tasks"
import { TaskDialog } from "./task-dialog"
import { TASK_STATUSES } from "@/lib/validations/task"
import { STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from "./task-constants"
import { cn, formatDate } from "@/lib/utils"
import type { TaskWithRelations } from "@/actions/tasks"
import type { TaskStatus } from "@prisma/client"

function startOfDay(date: Date | string) {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function dueLabel(task: TaskWithRelations, overdue: boolean): string {
  if (!task.dueDate) return ""
  if (task.status === "DONE") return `Completed ${formatDate(task.dueDate)}`

  const today = startOfDay(new Date())
  const due = startOfDay(task.dueDate)
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000)

  if (overdue) return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} overdue`
  if (diffDays === 0) return "Due today"
  if (diffDays === 1) return "Due tomorrow"
  if (diffDays <= 7) return `Due in ${diffDays} days`
  return `Due ${formatDate(task.dueDate)}`
}

function getRelated(task: TaskWithRelations): { label: string; href: string } | null {
  if (task.relatedType === "LEAD" && task.lead) {
    return {
      label: task.lead.companyName ? `${task.lead.name} — ${task.lead.companyName}` : task.lead.name,
      href: `/leads/${task.lead.id}`,
    }
  }
  if (task.relatedType === "INVOICE" && task.invoice) {
    return { label: task.invoice.invoiceNumber, href: `/financial/invoices/${task.invoice.id}` }
  }
  if (task.relatedType === "RECEIPT" && task.receipt) {
    return { label: task.receipt.receiptNumber, href: `/financial/receipts/${task.receipt.id}` }
  }
  if (task.relatedType === "SERVICE" && task.service) {
    return { label: task.service.name, href: `/services` }
  }
  return null
}

interface TaskRowProps {
  task: TaskWithRelations
  teamMembers?: { id: string; name: string }[]
  leads?: { id: string; name: string; companyName: string | null }[]
  invoices?: { id: string; invoiceNumber: string }[]
  receipts?: { id: string; receiptNumber: string }[]
  services?: { id: string; name: string }[]
}

export function TaskRow({
  task,
  teamMembers = [],
  leads = [],
  invoices = [],
  receipts = [],
  services = [],
}: TaskRowProps) {
  const [isPending, startTransition] = useTransition()
  const overdue = task.status !== "DONE" && !!task.dueDate && startOfDay(task.dueDate) < startOfDay(new Date())
  const related = getRelated(task)

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

  function handleMarkDone() {
    startTransition(async () => {
      await updateTaskStatus(task.id, "DONE")
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
        "group rounded-lg border bg-card px-4 py-3 transition-colors",
        overdue && "border-destructive/30 bg-destructive/5",
        task.status === "DONE" && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className={cn("text-sm font-medium", task.status === "DONE" && "line-through text-muted-foreground")}>
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
            {related && (
              <Link
                href={related.href}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
              >
                {related.label}
              </Link>
            )}
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
                {dueLabel(task, overdue)}
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
            {task._count.comments > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="size-3" />
                {task._count.comments}
              </span>
            )}
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

          {task.status !== "DONE" && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleMarkDone}
              disabled={isPending}
              title="Mark done"
              className="text-muted-foreground opacity-0 transition-opacity hover:text-emerald-600 group-hover:opacity-100"
            >
              <CheckCircle2 className="size-3.5" />
            </Button>
          )}

          <TaskDialog
            task={task}
            teamMembers={teamMembers}
            leads={leads}
            invoices={invoices}
            receipts={receipts}
            services={services}
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
    </div>
  )
}
