"use client"

import { useState, useTransition } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { addMeetingTranscript } from "@/actions/meetings"

interface MeetingTranscriptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meetingId: string
  meetingTitle: string
  hasTranscript?: boolean
}

export function MeetingTranscriptDialog({
  open,
  onOpenChange,
  meetingId,
  meetingTitle,
  hasTranscript,
}: MeetingTranscriptDialogProps) {
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      setText("")
      setError(null)
      setSuccess(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await addMeetingTranscript(meetingId, text)
      if (!result.success) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Meeting Transcript
          </DialogTitle>
          <p className="text-xs text-muted-foreground">{meetingTitle}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-400 rounded-md bg-green-50 dark:bg-green-900/20 px-3 py-2">
              Transcript processed and saved. Insights will be used in future proposals for this lead.
            </p>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">
              Transcript / Notes {hasTranscript && <span className="text-muted-foreground">(replaces existing)</span>}
            </Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the meeting transcript or your call notes here…"
              disabled={isPending}
              className="text-sm min-h-[200px]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Close
            </Button>
            <Button type="submit" size="sm" disabled={isPending || !text.trim()} className="gap-1.5">
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  Process &amp; Save
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
