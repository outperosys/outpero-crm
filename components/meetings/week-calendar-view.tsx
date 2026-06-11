"use client"

import { useState, useTransition } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  XCircle,
  UserX,
  Sparkles,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MeetingDialog } from "./meeting-dialog"
import { MeetingTranscriptDialog } from "./meeting-transcript-dialog"
import { deleteMeeting, updateMeetingStatus, type MeetingWithLead } from "@/actions/meetings"
import { cn, formatTime } from "@/lib/utils"
import { MEETING_STATUS_COLORS } from "@/lib/validations/meeting"

const START_HOUR = 7
const END_HOUR = 21
const HOUR_HEIGHT = 64 // px
const MIN_BLOCK_HEIGHT = 56 // px
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT

function getMonday(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(d: Date, n: number) {
  const date = new Date(d)
  date.setDate(date.getDate() + n)
  return date
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatWeekLabel(start: Date, end: Date) {
  const startStr = start.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${startStr} – ${end.getDate()}, ${end.getFullYear()}`
  }
  const endStr = end.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
  return `${startStr} – ${endStr}`
}

function formatHourLabel(h: number) {
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12} ${h < 12 ? "AM" : "PM"}`
}

interface WeekCalendarViewProps {
  meetings: MeetingWithLead[]
  leads?: { id: string; name: string; companyName: string | null }[]
  teamMembers?: { id: string; name: string }[]
}

export function WeekCalendarView({ meetings, leads = [], teamMembers = [] }: WeekCalendarViewProps) {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [transcriptMeeting, setTranscriptMeeting] = useState<MeetingWithLead | null>(null)
  const [isPending, startTransition] = useTransition()

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

  function handleStatus(id: string, status: "COMPLETED" | "CANCELLED" | "NO_SHOW") {
    startTransition(async () => {
      await updateMeetingStatus(id, status)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteMeeting(id)
    })
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Nav */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium">{formatWeekLabel(days[0], days[6])}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setWeekStart(getMonday(new Date()))}>
              Today
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setWeekStart(addDays(weekStart, -7))}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setWeekStart(addDays(weekStart, 7))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[64px_repeat(7,minmax(150px,1fr))] min-w-[1100px]">
            {/* Day headers */}
            <div className="border-b" />
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "group/header flex items-center justify-between gap-1 border-b border-l px-2 py-2",
                  isSameDay(day, today) && "bg-primary/5"
                )}
              >
                <div>
                  <p className="text-xs text-muted-foreground">
                    {day.toLocaleDateString("en-IN", { weekday: "short" })}
                  </p>
                  <p className={cn("text-sm font-semibold", isSameDay(day, today) && "text-primary")}>
                    {day.getDate()}
                  </p>
                </div>
                <MeetingDialog
                  leads={leads}
                  teamMembers={teamMembers}
                  defaultScheduledAt={new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0)}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Add meeting"
                      className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover/header:opacity-100"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  }
                />
              </div>
            ))}

            {/* Time column */}
            <div className="relative" style={{ height: TOTAL_HEIGHT }}>
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground whitespace-nowrap"
                  style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
                >
                  {formatHourLabel(h)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const dayMeetings = meetings.filter((m) => isSameDay(new Date(m.scheduledAt), day))
              return (
                <div key={day.toISOString()} className="relative border-l" style={{ height: TOTAL_HEIGHT }}>
                  {/* Hour gridlines + click-to-add slots */}
                  {hours.map((h) => (
                    <MeetingDialog
                      key={h}
                      leads={leads}
                      teamMembers={teamMembers}
                      defaultScheduledAt={new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, 0)}
                      trigger={
                        <div
                          className="absolute inset-x-0 cursor-pointer border-t transition-colors hover:bg-muted/40"
                          style={{ top: (h - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                        />
                      }
                    />
                  ))}

                  {/* Meeting blocks */}
                  {dayMeetings.map((m) => {
                    const date = new Date(m.scheduledAt)
                    const minutesFromStart = (date.getHours() - START_HOUR) * 60 + date.getMinutes()
                    const duration = m.durationMinutes ?? 30
                    const top = Math.min(
                      Math.max((minutesFromStart / 60) * HOUR_HEIGHT, 0),
                      TOTAL_HEIGHT - MIN_BLOCK_HEIGHT
                    )
                    const height = Math.max((duration / 60) * HOUR_HEIGHT, MIN_BLOCK_HEIGHT)
                    const canShowTranscript = m.status === "COMPLETED" || date < today

                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "group/meeting absolute inset-x-0.5 z-10 overflow-hidden rounded-md border px-1.5 py-1 text-[11px] leading-tight shadow-sm",
                          MEETING_STATUS_COLORS[m.status]
                        )}
                        style={{ top, height }}
                      >
                        <MeetingDialog
                          meeting={m}
                          teamMembers={teamMembers}
                          trigger={
                            <div className="cursor-pointer">
                              <p className="font-medium truncate">{m.title}</p>
                              <p className="truncate opacity-80">
                                {formatTime(date)} · {m.lead.name}
                              </p>
                            </div>
                          }
                        />

                        {/* Hover actions */}
                        <div className="absolute inset-x-0 bottom-0 flex items-center gap-0.5 bg-inherit px-1 pb-0.5 opacity-0 transition-opacity group-hover/meeting:opacity-100">
                          {m.status === "SCHEDULED" && (
                            <>
                              <button
                                type="button"
                                title="Mark completed"
                                disabled={isPending}
                                onClick={() => handleStatus(m.id, "COMPLETED")}
                                className="rounded p-0.5 hover:text-green-600"
                              >
                                <CheckCircle2 className="size-3" />
                              </button>
                              <button
                                type="button"
                                title="Mark no-show"
                                disabled={isPending}
                                onClick={() => handleStatus(m.id, "NO_SHOW")}
                                className="rounded p-0.5 hover:text-amber-600"
                              >
                                <UserX className="size-3" />
                              </button>
                              <button
                                type="button"
                                title="Cancel meeting"
                                disabled={isPending}
                                onClick={() => handleStatus(m.id, "CANCELLED")}
                                className="rounded p-0.5 hover:text-destructive"
                              >
                                <XCircle className="size-3" />
                              </button>
                            </>
                          )}
                          {canShowTranscript && (
                            <button
                              type="button"
                              title="Meeting transcript"
                              disabled={isPending}
                              onClick={() => setTranscriptMeeting(m)}
                              className={cn("rounded p-0.5 hover:text-primary", m.transcript && "text-primary")}
                            >
                              <Sparkles className="size-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            title="Delete meeting"
                            disabled={isPending}
                            onClick={() => handleDelete(m.id)}
                            className="ml-auto rounded p-0.5 hover:text-destructive"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {transcriptMeeting && (
        <MeetingTranscriptDialog
          open={!!transcriptMeeting}
          onOpenChange={(open) => !open && setTranscriptMeeting(null)}
          meetingId={transcriptMeeting.id}
          meetingTitle={transcriptMeeting.title}
          hasTranscript={!!transcriptMeeting.transcript}
        />
      )}
    </>
  )
}
