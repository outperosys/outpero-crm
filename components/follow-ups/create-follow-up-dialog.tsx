"use client"

import { useState, useRef, useTransition } from "react"
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
import { createFollowUp } from "@/actions/follow-ups"
import type { FollowUpTemplate } from "@prisma/client"

interface CreateFollowUpDialogProps {
  leads?: { id: string; name: string; companyName: string | null }[]
  templates: FollowUpTemplate[]
  leadId?: string
  trigger?: React.ReactNode
  teamMembers?: { id: string; name: string }[]
}

export function CreateFollowUpDialog({
  leads,
  templates,
  leadId: defaultLeadId,
  trigger,
  teamMembers = [],
}: CreateFollowUpDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const leadIdRef = useRef<HTMLSelectElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const dueDateRef = useRef<HTMLInputElement>(null)
  const assignedToRef = useRef<HTMLInputElement | HTMLSelectElement>(null)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setError(null)
    }
  }

  function handleTemplateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const template = templates.find((t) => t.id === e.target.value)
    if (template) {
      if (titleRef.current) titleRef.current.value = template.title
      if (notesRef.current) notesRef.current.value = template.notes || ""
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const leadId = defaultLeadId || leadIdRef.current?.value || ""
    const title = titleRef.current?.value.trim() || ""
    const notes = notesRef.current?.value.trim() || ""
    const dueDate = dueDateRef.current?.value || ""
    const assignedTo = assignedToRef.current?.value.trim() || ""

    startTransition(async () => {
      const result = await createFollowUp({
        leadId,
        title,
        notes: notes || undefined,
        dueDate,
        assignedTo: assignedTo || undefined,
      })
      if (!result.success) {
        setError(result.error)
      } else {
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            New Follow-up
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Follow-up</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}

          {/* Lead selector — hidden when leadId is pre-filled */}
          {!defaultLeadId && leads && (
            <div className="space-y-1.5">
              <Label className="text-xs">Lead</Label>
              <select
                ref={leadIdRef}
                required
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select a lead…</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name}
                    {lead.companyName ? ` — ${lead.companyName}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Template selector */}
          {templates.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">Template (optional)</Label>
              <select
                onChange={handleTemplateChange}
                defaultValue=""
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">No template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input
              ref={titleRef}
              placeholder="Follow-up title…"
              required
              disabled={isPending}
              className="text-sm"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea
              ref={notesRef}
              placeholder="Add any notes or talking points…"
              disabled={isPending}
              className="text-sm min-h-[72px] resize-none"
            />
          </div>

          {/* Due date + assigned to */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Due Date &amp; Time</Label>
              <Input
                ref={dueDateRef}
                type="datetime-local"
                required
                disabled={isPending}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Assigned To</Label>
              {teamMembers.length > 0 ? (
                <select
                  ref={assignedToRef as React.RefObject<HTMLSelectElement>}
                  disabled={isPending}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              ) : (
                <Input
                  ref={assignedToRef as React.RefObject<HTMLInputElement>}
                  placeholder="Name…"
                  disabled={isPending}
                  className="text-sm"
                />
              )}
            </div>
          </div>

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
              {isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
