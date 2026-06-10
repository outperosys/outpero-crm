"use client"

import { useTransition } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { updateTaskStatus } from "@/actions/tasks"

export function TaskQuickToggle({ taskId }: { taskId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Checkbox
      disabled={isPending}
      onCheckedChange={(checked) => {
        if (!checked) return
        startTransition(async () => {
          await updateTaskStatus(taskId, "DONE")
        })
      }}
    />
  )
}
