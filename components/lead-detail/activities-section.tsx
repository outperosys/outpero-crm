import { Activity } from "lucide-react"
import type { Activity as ActivityModel } from "@prisma/client"
import { AddActivityForm } from "./add-activity-form"
import { ActivityItem } from "./activity-item"

interface ActivitiesSectionProps {
  activities: ActivityModel[]
  leadId: string
}

export function ActivitiesSection({ activities, leadId }: ActivitiesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="size-4 text-muted-foreground" />
        <h2 className="font-semibold">Activity</h2>
        {activities.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {activities.length}
          </span>
        )}
      </div>

      <AddActivityForm leadId={leadId} />

      {activities.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No activity logged yet
        </p>
      ) : (
        <div className="max-h-[420px] overflow-y-auto space-y-4 pr-1">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  )
}
