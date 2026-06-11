"use client"

import { useState } from "react"
import { Calendar, List, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { MeetingCard } from "./meeting-card"
import { WeekCalendarView } from "./week-calendar-view"
import type { MeetingWithLead } from "@/actions/meetings"

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

interface MeetingsViewProps {
  meetings: MeetingWithLead[]
  leads?: { id: string; name: string; companyName: string | null }[]
  teamMembers?: { id: string; name: string }[]
}

export function MeetingsView({ meetings, leads = [], teamMembers = [] }: MeetingsViewProps) {
  const [view, setView] = useState<"list" | "calendar">("calendar")

  const today = startOfDay(new Date())
  const scheduled = meetings.filter((m) => m.status === "SCHEDULED")
  const todayMeetings = scheduled.filter((m) => isSameDay(new Date(m.scheduledAt), today))
  const upcoming = scheduled.filter(
    (m) => new Date(m.scheduledAt) > today && !isSameDay(new Date(m.scheduledAt), today)
  )
  const past = meetings
    .filter((m) => m.status !== "SCHEDULED" || new Date(m.scheduledAt) < today)
    .filter((m) => !todayMeetings.includes(m))
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 20)

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border p-0.5">
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              view === "list"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="size-3.5" />
            List
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              view === "calendar"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calendar className="size-3.5" />
            Calendar
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        <WeekCalendarView meetings={meetings} leads={leads} teamMembers={teamMembers} />
      ) : (
        <>
          {/* Empty state */}
          {meetings.length === 0 && (
            <div className="rounded-lg border border-dashed p-16 text-center">
              <Video className="size-8 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">No meetings yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Schedule your first meeting to keep track of calls and demos
              </p>
            </div>
          )}

          {/* Today */}
          {todayMeetings.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-amber-600 dark:text-amber-400">Today</h2>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {todayMeetings.length}
                </span>
              </div>
              <div className="space-y-2">
                {todayMeetings.map((m) => (
                  <MeetingCard key={m.id} meeting={m} teamMembers={teamMembers} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Upcoming</h2>
              <div className="space-y-2">
                {upcoming.map((m) => (
                  <MeetingCard key={m.id} meeting={m} teamMembers={teamMembers} />
                ))}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Past</h2>
              <div className="space-y-2">
                {past.map((m) => (
                  <MeetingCard key={m.id} meeting={m} teamMembers={teamMembers} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
