"use client"

import { useRef, useState, useTransition } from "react"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createTask, updateTask } from "@/actions/tasks"
import { TASK_STATUSES, TASK_PRIORITIES, TASK_RELATED_TYPES } from "@/lib/validations/task"
import { SELECT_CLASS } from "./task-constants"
import type { Task, TaskRelatedType } from "@prisma/client"

interface EntityOption {
  id: string
  label: string
}

interface TaskDialogProps {
  task?: Task
  trigger?: React.ReactNode
  defaultRelatedType?: TaskRelatedType
  defaultRelatedId?: string
  lockRelated?: boolean
  leads?: { id: string; name: string; companyName: string | null }[]
  invoices?: { id: string; invoiceNumber: string }[]
  receipts?: { id: string; receiptNumber: string }[]
  services?: { id: string; name: string }[]
  teamMembers?: { id: string; name: string }[]
}

function relatedIdOf(task?: Task) {
  if (!task) return ""
  return task.leadId || task.invoiceId || task.receiptId || task.serviceId || ""
}

function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return ""
  return new Date(date).toISOString().slice(0, 10)
}

export function TaskDialog({
  task,
  trigger,
  defaultRelatedType = "GENERAL",
  defaultRelatedId = "",
  lockRelated = false,
  leads = [],
  invoices = [],
  receipts = [],
  services = [],
  teamMembers = [],
}: TaskDialogProps) {
  const isEdit = !!task
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [relatedType, setRelatedType] = useState<TaskRelatedType>(
    task?.relatedType ?? defaultRelatedType
  )
  const [relatedId, setRelatedId] = useState(task ? relatedIdOf(task) : defaultRelatedId)

  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const statusRef = useRef<HTMLSelectElement>(null)
  const priorityRef = useRef<HTMLSelectElement>(null)
  const dueDateRef = useRef<HTMLInputElement>(null)
  const assignedToRef = useRef<HTMLInputElement | HTMLSelectElement>(null)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setError(null)
      setRelatedType(task?.relatedType ?? defaultRelatedType)
      setRelatedId(task ? relatedIdOf(task) : defaultRelatedId)
    }
  }

  function handleRelatedTypeChange(next: TaskRelatedType) {
    setRelatedType(next)
    setRelatedId("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const title = titleRef.current?.value.trim() || ""
    const description = descriptionRef.current?.value.trim() || ""
    const status = (statusRef.current?.value || "TODO") as Task["status"]
    const priority = (priorityRef.current?.value || "MEDIUM") as Task["priority"]
    const dueDate = dueDateRef.current?.value || ""
    const assignedTo = assignedToRef.current?.value.trim() || ""

    const payload = {
      title,
      description: description || undefined,
      status,
      priority,
      dueDate: dueDate || undefined,
      assignedTo: assignedTo || undefined,
      relatedType,
      leadId: relatedType === "LEAD" ? relatedId || undefined : undefined,
      invoiceId: relatedType === "INVOICE" ? relatedId || undefined : undefined,
      receiptId: relatedType === "RECEIPT" ? relatedId || undefined : undefined,
      serviceId: relatedType === "SERVICE" ? relatedId || undefined : undefined,
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateTask(task!.id, payload)
        : await createTask(payload)

      if (!result.success) {
        setError(result.error)
        return
      }

      setOpen(false)
      if (!isEdit) {
        if (titleRef.current) titleRef.current.value = ""
        if (descriptionRef.current) descriptionRef.current.value = ""
        if (dueDateRef.current) dueDateRef.current.value = ""
        setRelatedType(defaultRelatedType)
        setRelatedId(defaultRelatedId)
      }
    })
  }

  const relatedOptions: EntityOption[] =
    relatedType === "LEAD"
      ? leads.map((l) => ({
          id: l.id,
          label: l.companyName ? `${l.name} — ${l.companyName}` : l.name,
        }))
      : relatedType === "INVOICE"
      ? invoices.map((i) => ({ id: i.id, label: i.invoiceNumber }))
      : relatedType === "RECEIPT"
      ? receipts.map((r) => ({ id: r.id, label: r.receiptNumber }))
      : relatedType === "SERVICE"
      ? services.map((s) => ({ id: s.id, label: s.name }))
      : []

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input
              ref={titleRef}
              defaultValue={task?.title}
              placeholder="Task title…"
              required
              disabled={isPending}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Description (optional)</Label>
            <Textarea
              ref={descriptionRef}
              defaultValue={task?.description || ""}
              placeholder="Add more detail…"
              disabled={isPending}
              className="text-sm min-h-[72px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <select
                ref={statusRef}
                defaultValue={task?.status ?? "TODO"}
                disabled={isPending}
                className={SELECT_CLASS}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <select
                ref={priorityRef}
                defaultValue={task?.priority ?? "MEDIUM"}
                disabled={isPending}
                className={SELECT_CLASS}
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Due Date</Label>
              <Input
                ref={dueDateRef}
                type="date"
                defaultValue={toDateInputValue(task?.dueDate)}
                disabled={isPending}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Assigned To</Label>
              {teamMembers.length > 0 ? (
                <select
                  ref={assignedToRef as React.RefObject<HTMLSelectElement>}
                  defaultValue={task?.assignedTo ?? ""}
                  disabled={isPending}
                  className={SELECT_CLASS}
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  ref={assignedToRef as React.RefObject<HTMLInputElement>}
                  defaultValue={task?.assignedTo ?? ""}
                  placeholder="Name…"
                  disabled={isPending}
                  className="text-sm"
                />
              )}
            </div>
          </div>

          {!lockRelated && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Related To</Label>
                <select
                  value={relatedType}
                  onChange={(e) => handleRelatedTypeChange(e.target.value as TaskRelatedType)}
                  disabled={isPending}
                  className={SELECT_CLASS}
                >
                  {TASK_RELATED_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              {relatedType !== "GENERAL" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    {TASK_RELATED_TYPES.find((t) => t.value === relatedType)?.label}
                  </Label>
                  <select
                    value={relatedId}
                    onChange={(e) => setRelatedId(e.target.value)}
                    disabled={isPending}
                    className={SELECT_CLASS}
                  >
                    <option value="">Select…</option>
                    {relatedOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
