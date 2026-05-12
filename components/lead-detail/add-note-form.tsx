"use client"

import { useRef, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createNote } from "@/actions/notes"

export function AddNoteForm({ leadId }: { leadId: string }) {
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const content = ref.current?.value.trim()
    if (!content) return

    startTransition(async () => {
      await createNote(leadId, { content })
      if (ref.current) ref.current.value = ""
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        ref={ref}
        placeholder="Add a note…"
        className="resize-none text-sm"
        rows={3}
        disabled={isPending}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Adding…" : "Add Note"}
        </Button>
      </div>
    </form>
  )
}
