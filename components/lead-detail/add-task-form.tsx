"use client"

import { useRef, useTransition } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createTask } from "@/actions/tasks"

export function AddTaskForm({ leadId }: { leadId: string }) {
  const [isPending, startTransition] = useTransition()
  const titleRef = useRef<HTMLInputElement>(null)
  const dueDateRef = useRef<HTMLInputElement>(null)
  const assignedToRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const title = titleRef.current?.value.trim()
    if (!title) return

    startTransition(async () => {
      await createTask(leadId, {
        title,
        dueDate: dueDateRef.current?.value || undefined,
        assignedTo: assignedToRef.current?.value.trim() || undefined,
      })
      if (titleRef.current) titleRef.current.value = ""
      if (dueDateRef.current) dueDateRef.current.value = ""
      if (assignedToRef.current) assignedToRef.current.value = ""
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
      <Input
        ref={titleRef}
        placeholder="Task title…"
        className="min-w-[160px] flex-1 text-sm"
        disabled={isPending}
        required
      />
      <Input
        ref={dueDateRef}
        type="date"
        className="w-[155px] text-sm"
        disabled={isPending}
      />
      <Input
        ref={assignedToRef}
        placeholder="Assign to…"
        className="w-[140px] text-sm"
        disabled={isPending}
      />
      <Button type="submit" size="sm" disabled={isPending} className="gap-1">
        <Plus className="size-3.5" />
        {isPending ? "Adding…" : "Add"}
      </Button>
    </form>
  )
}
