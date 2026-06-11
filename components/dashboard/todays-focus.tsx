import Link from "next/link"
import { CalendarClock, AlertTriangle, ListTodo, AlertCircle, Receipt, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TodaysFocus } from "@/lib/dashboard/types"

export function TodaysFocusCard({ data }: { data: TodaysFocus }) {
  const items = [
    { label: "Follow-ups Due Today", value: data.followUpsDueToday, href: "/follow-ups", icon: CalendarClock, urgent: false },
    { label: "Overdue Follow-ups", value: data.overdueFollowUps, href: "/follow-ups", icon: AlertTriangle, urgent: true },
    { label: "Meetings Today", value: data.meetingsToday, href: "/meetings", icon: Video, urgent: false },
    { label: "Tasks Due Today", value: data.tasksDueToday, href: "/tasks", icon: ListTodo, urgent: false },
    { label: "Overdue Tasks", value: data.overdueTasks, href: "/tasks", icon: AlertCircle, urgent: true },
    { label: "Unpaid Invoices", value: data.unpaidInvoices, href: "/financial", icon: Receipt, urgent: false },
  ]

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="text-sm font-semibold tracking-tight mb-4">Today&apos;s Focus</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => {
          const isAlert = item.urgent && item.value > 0
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30",
                isAlert && "border-destructive/30 bg-destructive/5 hover:bg-destructive/10"
              )}
            >
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-md",
                  isAlert ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-4" />
              </div>
              <p className={cn("text-3xl font-semibold tabular-nums", isAlert && "text-destructive")}>
                {item.value}
              </p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
