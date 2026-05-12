"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteActivity } from "@/actions/activities"

export function DeleteActivityButton({
  activityId,
  leadId,
}: {
  activityId: string
  leadId: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={isPending}
      className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
      onClick={() =>
        startTransition(async () => {
          await deleteActivity(activityId, leadId)
        })
      }
    >
      <Trash2 className="size-3" />
    </Button>
  )
}
