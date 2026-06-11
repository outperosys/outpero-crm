"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Pencil,
  Sparkles,
  Trash2,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  UserX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { deleteMeeting, updateMeetingStatus, type MeetingWithLead } from "@/actions/meetings"
import { MeetingDialog } from "./meeting-dialog"
import { MeetingTranscriptDialog } from "./meeting-transcript-dialog"
import { cn, formatDate, formatTime } from "@/lib/utils"
import { MEETING_TYPE_LABELS, MEETING_STATUS_LABELS, MEETING_STATUS_COLORS } from "@/lib/validations/meeting"

interface MeetingCardProps {
  meeting: MeetingWithLead
  showLead?: boolean
  teamMembers?: { id: string; name: string }[]
}

export function MeetingCard({ meeting, showLead = true, teamMembers = [] }: MeetingCardProps) {
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isPast = new Date(meeting.scheduledAt) < new Date()
  const time = formatTime(meeting.scheduledAt)

  function handleStatus(status: "COMPLETED" | "CANCELLED" | "NO_SHOW") {
    startTransition(async () => {
      await updateMeetingStatus(meeting.id, status)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteMeeting(meeting.id)
    })
  }

  return (
    <>
      <div
        className={cn(
          "group rounded-lg border bg-card px-4 py-3.5 transition-colors",
          meeting.status === "CANCELLED" && "opacity-60"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Lead info row */}
            {showLead && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link
                  href={`/leads/${meeting.lead.id}`}
                  className="font-medium text-sm hover:underline underline-offset-4"
                >
                  {meeting.lead.name}
                </Link>
                {meeting.lead.companyName && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="size-3" />
                    {meeting.lead.companyName}
                  </span>
                )}
              </div>
            )}

            {/* Title + badges */}
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{meeting.title}</p>
              <Badge variant="outline">{MEETING_TYPE_LABELS[meeting.type]}</Badge>
              <Badge className={MEETING_STATUS_COLORS[meeting.status]}>
                {MEETING_STATUS_LABELS[meeting.status]}
              </Badge>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                {formatDate(meeting.scheduledAt)}
              </span>
              {time && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {time}
                  {meeting.durationMinutes ? ` (${meeting.durationMinutes} min)` : ""}
                </span>
              )}
              {meeting.location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {meeting.location}
                </span>
              )}
              {meeting.assignedTo && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="size-3" />
                  {meeting.assignedTo}
                </span>
              )}
              {meeting.meetingLink && (
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="size-3" />
                  Join
                </a>
              )}
            </div>

            {meeting.notes && (
              <p className="text-xs text-muted-foreground whitespace-pre-line">{meeting.notes}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {meeting.status === "SCHEDULED" && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleStatus("COMPLETED")}
                  disabled={isPending}
                  title="Mark completed"
                  className="text-muted-foreground opacity-0 transition-opacity hover:text-green-600 group-hover:opacity-100"
                >
                  <CheckCircle2 className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleStatus("NO_SHOW")}
                  disabled={isPending}
                  title="Mark no-show"
                  className="text-muted-foreground opacity-0 transition-opacity hover:text-amber-600 group-hover:opacity-100"
                >
                  <UserX className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleStatus("CANCELLED")}
                  disabled={isPending}
                  title="Cancel meeting"
                  className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <XCircle className="size-3.5" />
                </Button>
              </>
            )}
            {(meeting.status === "COMPLETED" || isPast) && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setTranscriptOpen(true)}
                disabled={isPending}
                title="Meeting transcript"
                className={cn(
                  "text-muted-foreground transition-opacity hover:text-primary group-hover:opacity-100",
                  meeting.transcript ? "opacity-100 text-primary" : "opacity-0"
                )}
              >
                <Sparkles className="size-3.5" />
              </Button>
            )}
            <MeetingDialog
              meeting={meeting}
              teamMembers={teamMembers}
              trigger={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  title="Edit meeting"
                  className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                >
                  <Pencil className="size-3.5" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              onClick={handleDelete}
              title="Delete meeting"
              className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <MeetingTranscriptDialog
        open={transcriptOpen}
        onOpenChange={setTranscriptOpen}
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        hasTranscript={!!meeting.transcript}
      />
    </>
  )
}
