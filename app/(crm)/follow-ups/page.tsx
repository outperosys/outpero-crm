import { CalendarClock } from "lucide-react"
import { getFollowUps } from "@/actions/follow-ups"
import { getLeads } from "@/actions/leads"
import { getTeamMembers } from "@/actions/settings"
import { FollowUpCard } from "@/components/follow-ups/follow-up-card"
import { CreateFollowUpDialog } from "@/components/follow-ups/create-follow-up-dialog"
import type { FollowUpWithLead } from "@/actions/follow-ups"

export const metadata = { title: "Follow-ups — Outpero CRM" }

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

function partitionFollowUps(followUps: FollowUpWithLead[]) {
  const today = startOfDay(new Date())
  const pending = followUps.filter((f) => !f.completed)
  const overdue = pending.filter((f) => startOfDay(f.dueDate) < today)
  const dueToday = pending.filter((f) => isSameDay(f.dueDate, today))
  const upcoming = pending.filter((f) => startOfDay(f.dueDate) > today)
  const completed = followUps.filter((f) => f.completed).slice(0, 20)
  return { overdue, dueToday, upcoming, completed }
}

export default async function FollowUpsPage() {
  const [followUps, leads, teamMembers] = await Promise.all([
    getFollowUps(),
    getLeads(),
    getTeamMembers().catch(() => []),
  ])

  const { overdue, dueToday, upcoming, completed } = partitionFollowUps(followUps)
  const totalPending = overdue.length + dueToday.length + upcoming.length

  const leadOptions = leads.map((l) => ({
    id: l.id,
    name: l.name,
    companyName: l.companyName,
  }))

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Follow-ups</h1>
          <p className="text-sm text-muted-foreground">
            {totalPending === 0
              ? "All caught up"
              : `${totalPending} pending${overdue.length > 0 ? ` · ${overdue.length} overdue` : ""}`}
          </p>
        </div>
        <CreateFollowUpDialog leads={leadOptions} teamMembers={teamMembers} />
      </div>

      {/* Empty state */}
      {followUps.length === 0 && (
        <div className="rounded-lg border border-dashed p-16 text-center">
          <CalendarClock className="size-8 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">No follow-ups yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first follow-up to ensure no lead gets forgotten
          </p>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-destructive">Overdue</h2>
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              {overdue.length}
            </span>
          </div>
          <div className="space-y-2">
            {overdue.map((f) => (
              <FollowUpCard key={f.id} followUp={f} variant="overdue" teamMembers={teamMembers} />
            ))}
          </div>
        </section>
      )}

      {/* Due Today */}
      {dueToday.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Due Today
            </h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {dueToday.length}
            </span>
          </div>
          <div className="space-y-2">
            {dueToday.map((f) => (
              <FollowUpCard key={f.id} followUp={f} variant="today" teamMembers={teamMembers} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Upcoming</h2>
          <div className="space-y-2">
            {upcoming.map((f) => (
              <FollowUpCard key={f.id} followUp={f} variant="upcoming" teamMembers={teamMembers} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Completed */}
      {completed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Recently Completed
          </h2>
          <div className="space-y-2">
            {completed.map((f) => (
              <FollowUpCard key={f.id} followUp={f} variant="completed" teamMembers={teamMembers} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
