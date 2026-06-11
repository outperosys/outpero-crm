import { Bell, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getFollowUpStatus } from "@/lib/follow-up"

const URGENCY_STYLES: Record<string, string> = {
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  today: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  soon: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  later: "bg-muted text-muted-foreground",
}

export function FollowUpBadge({ date, className, hideLater = false }: { date: Date | string | null; className?: string; hideLater?: boolean }) {
  if (!date) return null

  const status = getFollowUpStatus(date)
  if (hideLater && status.urgency === "later") return null

  const Icon = status.urgency === "overdue" ? AlertTriangle : Bell

  return (
    <span className={cn(
      "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
      URGENCY_STYLES[status.urgency],
      className
    )}>
      <Icon className="size-3 shrink-0" />
      {status.label}
    </span>
  )
}
