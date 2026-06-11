"use client"

import { useRef, useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createNote } from "@/actions/notes"

interface QuickAddNoteDialogProps {
  leadId: string
  trigger: React.ReactNode
}

export function QuickAddNoteDialog({ leadId, trigger }: QuickAddNoteDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLTextAreaElement>(null)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const content = ref.current?.value.trim()
    if (!content) return

    startTransition(async () => {
      const result = await createNote(leadId, { content })
      if (!result.success) {
        setError(result.error)
      } else {
        if (ref.current) ref.current.value = ""
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}
          <Textarea
            ref={ref}
            placeholder="Add a note…"
            className="resize-none text-sm"
            rows={4}
            disabled={isPending}
            autoFocus
          />
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
              {isPending ? "Adding…" : "Add Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
