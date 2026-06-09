import Link from "next/link"
import {
  Phone,
  CalendarDays,
  Mail,
  FileText,
  RefreshCw,
  MessageSquare,
  Bell,
  Receipt,
  CreditCard,
  ExternalLink,
} from "lucide-react"
import type { Activity } from "@prisma/client"
import { formatDate, formatTime } from "@/lib/utils"
import { DeleteActivityButton } from "./delete-activity-button"

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; color: string }
> = {
  CALL:          { icon: Phone,        label: "Call",           color: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30" },
  MEETING:       { icon: CalendarDays, label: "Meeting",        color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30" },
  EMAIL:         { icon: Mail,         label: "Email",          color: "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30" },
  PROPOSAL_SENT: { icon: FileText,     label: "Proposal",       color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30" },
  FOLLOW_UP:     { icon: Bell,         label: "Follow-up",      color: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30" },
  STATUS_CHANGE: { icon: RefreshCw,    label: "Status Change",  color: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800" },
  NOTE:          { icon: MessageSquare,label: "Note",           color: "text-muted-foreground bg-muted" },
  INVOICE:       { icon: Receipt,      label: "Invoice",        color: "text-sky-600 bg-sky-100 dark:text-sky-400 dark:bg-sky-900/30" },
  PAYMENT:       { icon: CreditCard,   label: "Payment",        color: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30" },
}

export function ActivityItem({ activity }: { activity: Activity }) {
  const config = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.NOTE
  const Icon = config.icon
  const time = formatTime(activity.createdAt)

  return (
    <div className="group flex gap-3">
      <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${config.color}`}>
        <Icon className="size-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
            <p className="text-sm whitespace-pre-wrap">{activity.description}</p>
            {(activity as any).link && (
              <Link
                href={(activity as any).link}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
              >
                <ExternalLink className="size-3" />
                View
              </Link>
            )}
          </div>
          <DeleteActivityButton activityId={activity.id} leadId={activity.leadId} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {activity.createdBy && <span>{activity.createdBy} · </span>}
          {formatDate(activity.createdAt)}{time ? ` · ${time}` : ""}
        </p>
      </div>
    </div>
  )
}
