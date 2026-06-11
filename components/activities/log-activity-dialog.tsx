"use client"

import { useRef, useState, useTransition } from "react"
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
import { Label } from "@/components/ui/label"
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

interface LogActivityDialogProps {
  leads?: { id: string; name: string; companyName: string | null }[]
  leadId?: string
  trigger?: React.ReactNode
}

export function LogActivityDialog({
  leads,
  leadId: defaultLeadId,
  trigger,
}: LogActivityDialogProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState("CALL")
  const [selectedLeadId, setSelectedLeadId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const descRef = useRef<HTMLTextAreaElement>(null)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setError(null)
      setType("CALL")
      setSelectedLeadId("")
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const leadId = defaultLeadId || selectedLeadId
    const description = descRef.current?.value.trim() || ""

    if (!leadId) {
      setError("Select a lead")
      return
    }
    if (!description) {
      setError("Description is required")
      return
    }

    startTransition(async () => {
      const result = await createActivity(leadId, { type, description })
      if (!result.success) {
        setError(result.error)
      } else {
        if (descRef.current) descRef.current.value = ""
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
            Log Activity
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
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
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
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

          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
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
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea
              ref={descRef}
              placeholder="What happened?"
              className="resize-none text-sm"
              rows={3}
              disabled={isPending}
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
              {isPending ? "Logging…" : "Log Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
