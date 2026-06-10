import type { TeamSnapshotItem } from "@/lib/dashboard/types"

export function TeamSnapshot({ data }: { data: TeamSnapshotItem[] }) {
  if (data.length === 0) return null

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h2 className="text-sm font-semibold tracking-tight">Team Snapshot</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((member) => (
          <div key={member.name} className="rounded-lg border p-3 space-y-2">
            <p className="text-sm font-medium truncate">{member.name}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{member.assignedLeads} leads</span>
              <span>{member.openTasks} tasks</span>
              <span>{member.followUpsDue} follow-ups</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
