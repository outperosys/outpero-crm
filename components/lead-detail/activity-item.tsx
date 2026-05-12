import {
  Phone,
  CalendarDays,
  Mail,
  FileText,
  RefreshCw,
  MessageSquare,
  Bell,
} from "lucide-react"
import type { Activity } from "@prisma/client"
import { formatDate } from "@/lib/utils"
import { DeleteActivityButton } from "./delete-activity-button"

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; color: string }
> = {
  CALL:          { icon: Phone,        label: "Call",           color: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30" },
  MEETING:       { icon: CalendarDays, label: "Meeting",        color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30" },
  EMAIL:         { icon: Mail,         label: "Email",          color: "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30" },
  PROPOSAL_SENT: { icon: FileText,     label: "Proposal Sent",  color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30" },
  FOLLOW_UP:     { icon: Bell,         label: "Follow-up",      color: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30" },
  STATUS_CHANGE: { icon: RefreshCw,    label: "Status Change",  color: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800" },
  NOTE:          { icon: MessageSquare,label: "Note",           color: "text-muted-foreground bg-muted" },
}

export function ActivityItem({ activity }: { activity: Activity }) {
  const config = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.NOTE
  const Icon = config.icon

  return (
    <div className="group flex gap-3">
      <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${config.color}`}>
        <Icon className="size-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-xs font-medium text-muted-foreground">
              {config.label}
            </span>
            <p className="text-sm mt-0.5 whitespace-pre-wrap">{activity.description}</p>
          </div>
          <DeleteActivityButton activityId={activity.id} leadId={activity.leadId} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {activity.createdBy && <span>{activity.createdBy} · </span>}
          {formatDate(activity.createdAt)}
        </p>
      </div>
    </div>
  )
}
