"use client"

import { useRef, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createActivity } from "@/actions/activities"
import { ACTIVITY_TYPES } from "@/lib/validations/activity"

export function AddActivityForm({ leadId }: { leadId: string }) {
  const [type, setType] = useState("CALL")
  const [isPending, startTransition] = useTransition()
  const descRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const description = descRef.current?.value.trim()
    if (!description) return

    startTransition(async () => {
      await createActivity(leadId, { type, description })
      if (descRef.current) descRef.current.value = ""
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ACTIVITY_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        ref={descRef}
        placeholder="What happened?"
        className="resize-none text-sm"
        rows={2}
        disabled={isPending}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Logging…" : "Log Activity"}
        </Button>
      </div>
    </form>
  )
}
