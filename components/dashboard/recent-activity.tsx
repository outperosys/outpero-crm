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
} from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"
import type { RecentActivityItem } from "@/lib/dashboard/types"

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  CALL:          { icon: Phone,         color: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30" },
  MEETING:       { icon: CalendarDays,  color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30" },
  EMAIL:         { icon: Mail,          color: "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30" },
  PROPOSAL_SENT: { icon: FileText,      color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30" },
  FOLLOW_UP:     { icon: Bell,          color: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30" },
  STATUS_CHANGE: { icon: RefreshCw,     color: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800" },
  NOTE:          { icon: MessageSquare, color: "text-muted-foreground bg-muted" },
  INVOICE:       { icon: Receipt,       color: "text-sky-600 bg-sky-100 dark:text-sky-400 dark:bg-sky-900/30" },
  PAYMENT:       { icon: CreditCard,    color: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30" },
}

export function RecentActivityFeed({ data }: { data: RecentActivityItem[] }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h2 className="text-sm font-semibold tracking-tight">Recent Activity</h2>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent activity.</p>
      ) : (
        <div className="space-y-3">
          {data.map((activity) => {
            const config = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.NOTE
            const Icon = config.icon
            return (
              <div key={activity.id} className="flex gap-3">
                <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${config.color}`}>
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <Link href={`/leads/${activity.leadId}`} className="font-medium hover:underline">
                      {activity.leadName}
                    </Link>
                    <span className="text-muted-foreground"> — {activity.description}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(activity.createdAt)} {formatTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
