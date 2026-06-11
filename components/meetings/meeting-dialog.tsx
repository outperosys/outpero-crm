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
import { createMeeting, updateMeeting, type MeetingWithLead } from "@/actions/meetings"
import { MEETING_TYPES, MEETING_TYPE_LABELS } from "@/lib/validations/meeting"

const SELECT_CLASS =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

// Converts a Date to "YYYY-MM-DDTHH:mm" for datetime-local inputs, in local time.
function toLocalInputValue(date: Date): string {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

interface MeetingDialogProps {
  leads?: { id: string; name: string; companyName: string | null }[]
  leadId?: string
  meeting?: MeetingWithLead
  trigger?: React.ReactNode
  teamMembers?: { id: string; name: string }[]
  defaultScheduledAt?: Date
}

export function MeetingDialog({
  leads,
  leadId: defaultLeadId,
  meeting,
  trigger,
  teamMembers = [],
  defaultScheduledAt,
}: MeetingDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEdit = !!meeting

  const leadIdRef = useRef<HTMLSelectElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const typeRef = useRef<HTMLSelectElement>(null)
  const scheduledAtRef = useRef<HTMLInputElement>(null)
  const durationRef = useRef<HTMLInputElement>(null)
  const meetingLinkRef = useRef<HTMLInputElement>(null)
  const locationRef = useRef<HTMLInputElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const assignedToRef = useRef<HTMLInputElement | HTMLSelectElement>(null)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const leadId = meeting?.leadId || defaultLeadId || leadIdRef.current?.value || ""
    const title = titleRef.current?.value.trim() || ""
    const type = (typeRef.current?.value || "DISCOVERY_CALL") as (typeof MEETING_TYPES)[number]
    const scheduledAt = scheduledAtRef.current?.value || ""
    const durationMinutes = durationRef.current?.value.trim() || ""
    const meetingLink = meetingLinkRef.current?.value.trim() || ""
    const location = locationRef.current?.value.trim() || ""
    const notes = notesRef.current?.value.trim() || ""
    const assignedTo = assignedToRef.current?.value.trim() || ""

    startTransition(async () => {
      const data = {
        leadId,
        title,
        type,
        scheduledAt,
        durationMinutes: durationMinutes || undefined,
        meetingLink: meetingLink || undefined,
        location: location || undefined,
        notes: notes || undefined,
        assignedTo: assignedTo || undefined,
      }
      const result = isEdit
        ? await updateMeeting(meeting!.id, data)
        : await createMeeting(data)

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
            New Meeting
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Meeting" : "New Meeting"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}

          {/* Lead selector — hidden when leadId is pre-filled or editing */}
          {!defaultLeadId && !isEdit && leads && (
            <div className="space-y-1.5">
              <Label className="text-xs">Lead</Label>
              <select ref={leadIdRef} required className={SELECT_CLASS}>
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

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input
              ref={titleRef}
              defaultValue={meeting?.title}
              placeholder="Meeting title…"
              required
              disabled={isPending}
              className="text-sm"
            />
          </div>

          {/* Type + Scheduled at */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <select ref={typeRef} defaultValue={meeting?.type ?? "DISCOVERY_CALL"} disabled={isPending} className={SELECT_CLASS}>
                {MEETING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {MEETING_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date &amp; Time</Label>
              <Input
                ref={scheduledAtRef}
                type="datetime-local"
                defaultValue={
                  meeting
                    ? toLocalInputValue(new Date(meeting.scheduledAt))
                    : defaultScheduledAt
                    ? toLocalInputValue(defaultScheduledAt)
                    : undefined
                }
                required
                disabled={isPending}
                className="text-sm"
              />
            </div>
          </div>

          {/* Duration + Meeting link */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Duration (minutes)</Label>
              <Input
                ref={durationRef}
                type="number"
                min="0"
                defaultValue={meeting?.durationMinutes ?? undefined}
                placeholder="30"
                disabled={isPending}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Assigned To</Label>
              {teamMembers.length > 0 ? (
                <select
                  ref={assignedToRef as React.RefObject<HTMLSelectElement>}
                  defaultValue={meeting?.assignedTo ?? ""}
                  disabled={isPending}
                  className={SELECT_CLASS}
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              ) : (
                <Input
                  ref={assignedToRef as React.RefObject<HTMLInputElement>}
                  defaultValue={meeting?.assignedTo ?? undefined}
                  placeholder="Name…"
                  disabled={isPending}
                  className="text-sm"
                />
              )}
            </div>
          </div>

          {/* Meeting link */}
          <div className="space-y-1.5">
            <Label className="text-xs">Meeting Link (optional)</Label>
            <Input
              ref={meetingLinkRef}
              type="url"
              defaultValue={meeting?.meetingLink ?? undefined}
              placeholder="https://meet.google.com/…"
              disabled={isPending}
              className="text-sm"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label className="text-xs">Location (optional)</Label>
            <Input
              ref={locationRef}
              defaultValue={meeting?.location ?? undefined}
              placeholder="Office, client site, etc…"
              disabled={isPending}
              className="text-sm"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea
              ref={notesRef}
              defaultValue={meeting?.notes ?? undefined}
              placeholder="Agenda, talking points…"
              disabled={isPending}
              className="text-sm min-h-[72px] resize-none"
            />
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
              {isPending ? "Saving…" : isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
