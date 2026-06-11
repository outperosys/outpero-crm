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
import { QuickDatePicks, quickDueDate } from "./quick-date-picks"
import { FOLLOW_UP_PRESETS } from "@/lib/follow-up-presets"

interface CreateFollowUpDialogProps {
  leads?: { id: string; name: string; companyName: string | null }[]
  leadId?: string
  trigger?: React.ReactNode
  teamMembers?: { id: string; name: string }[]
}

export function CreateFollowUpDialog({
  leads,
  leadId: defaultLeadId,
  trigger,
  teamMembers = [],
}: CreateFollowUpDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState("")
  const [isPending, startTransition] = useTransition()

  const leadIdRef = useRef<HTMLSelectElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const assignedToRef = useRef<HTMLInputElement | HTMLSelectElement>(null)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setDueDate(quickDueDate("Tomorrow"))
    } else {
      setError(null)
    }
  }

  function applyPreset(preset: (typeof FOLLOW_UP_PRESETS)[number]) {
    if (titleRef.current) titleRef.current.value = preset.title
    if (notesRef.current) notesRef.current.value = preset.notes
    setDueDate(preset.dueDate())
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const leadId = defaultLeadId || leadIdRef.current?.value || ""
    const title = titleRef.current?.value.trim() || ""
    const notes = notesRef.current?.value.trim() || ""
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

          {/* Quick fill presets */}
          <div className="space-y-1.5">
            <Label className="text-xs">Quick Fill (optional)</Label>
            <div className="flex flex-wrap gap-1.5">
              {FOLLOW_UP_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs font-normal"
                  onClick={() => applyPreset(preset)}
                  disabled={isPending}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs">Title (optional)</Label>
            <Input
              ref={titleRef}
              placeholder="Follow-up"
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

          {/* Due date quick picks */}
          <div className="space-y-1.5">
            <Label className="text-xs">Due Date &amp; Time</Label>
            <QuickDatePicks value={dueDate} onPick={setDueDate} />
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              disabled={isPending}
              className="text-sm"
            />
          </div>

          {/* Assigned to */}
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
