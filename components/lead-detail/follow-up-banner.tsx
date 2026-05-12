import { AlertTriangle, Clock } from "lucide-react"
import type { Lead } from "@prisma/client"

function getFollowUpStatus(date: Date) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const followUp = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round(
    (followUp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays < 0) return { status: "overdue", days: Math.abs(diffDays) }
  if (diffDays === 0) return { status: "today", days: 0 }
  if (diffDays <= 7) return { status: "soon", days: diffDays }
  return null
}

export function FollowUpBanner({ lead }: { lead: Lead }) {
  if (!lead.nextFollowUp) return null

  const info = getFollowUpStatus(lead.nextFollowUp)
  if (!info) return null

  if (info.status === "overdue") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <AlertTriangle className="size-4 shrink-0" />
        <span>
          Follow-up overdue by{" "}
          <strong>{info.days} {info.days === 1 ? "day" : "days"}</strong> — was due{" "}
          {lead.nextFollowUp.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    )
  }

  if (info.status === "today") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
        <Clock className="size-4 shrink-0" />
        <span>Follow-up due <strong>today</strong></span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
      <Clock className="size-4 shrink-0" />
      <span>
        Follow-up in <strong>{info.days} {info.days === 1 ? "day" : "days"}</strong>{" "}
        — {lead.nextFollowUp.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
  )
}
