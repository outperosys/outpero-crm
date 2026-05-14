"use client"

import { useRef, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { completeFollowUp } from "@/actions/follow-ups"

interface CompleteFollowUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  followUpId: string
  title: string
  assignedTo?: string | null
}

export function CompleteFollowUpDialog({
  open,
  onOpenChange,
  followUpId,
  title,
  assignedTo,
}: CompleteFollowUpDialogProps) {
  const [isPending, startTransition] = useTransition()
  const nextTitleRef = useRef<HTMLInputElement>(null)
  const nextDateRef = useRef<HTMLInputElement>(null)
  const nextNotesRef = useRef<HTMLTextAreaElement>(null)
  const nextAssignedRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const dueDate = nextDateRef.current?.value || undefined

    startTransition(async () => {
      const result = await completeFollowUp(
        followUpId,
        dueDate
          ? {
              dueDate,
              title: nextTitleRef.current?.value || undefined,
              notes: nextNotesRef.current?.value || undefined,
              assignedTo: nextAssignedRef.current?.value || undefined,
            }
          : undefined
      )
      if (result.success) {
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Complete Follow-up</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-muted-foreground">"{title}"</p>

          {/* Next follow-up section */}
          <div className="space-y-3 rounded-lg border px-3.5 py-3.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Schedule next follow-up (optional)
            </p>

            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input
                ref={nextTitleRef}
                placeholder={title}
                disabled={isPending}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Label className="text-xs">Due Date</Label>
                <Input
                  ref={nextDateRef}
                  type="date"
                  disabled={isPending}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Assign To</Label>
                <Input
                  ref={nextAssignedRef}
                  placeholder={assignedTo ?? "Name…"}
                  disabled={isPending}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Notes (optional)</Label>
              <Textarea
                ref={nextNotesRef}
                placeholder="Add context for next time…"
                disabled={isPending}
                className="text-sm min-h-[60px] resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Completing…" : "Mark Complete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
