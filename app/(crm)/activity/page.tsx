import { getAllActivities } from "@/actions/activities"
import { getLeads } from "@/actions/leads"
import { ActivityFeedClient } from "@/components/activity/activity-feed-client"
import { LogActivityDialog } from "@/components/activities/log-activity-dialog"

export const metadata = { title: "Activity — Outpero CRM" }

export default async function ActivityPage() {
  const [activities, leads] = await Promise.all([
    getAllActivities(),
    getLeads(),
  ])

  const leadOptions = leads.map((l) => ({
    id: l.id,
    name: l.name,
    companyName: l.companyName,
  }))

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
          <p className="text-sm text-muted-foreground">
            {activities.length === 0
              ? "No activity logged yet"
              : `${activities.length} recent ${activities.length === 1 ? "entry" : "entries"} across all leads`}
          </p>
        </div>
        <LogActivityDialog leads={leadOptions} />
      </div>

      <ActivityFeedClient activities={activities} />
    </div>
  )
}
