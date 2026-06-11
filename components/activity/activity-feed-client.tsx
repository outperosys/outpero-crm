"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import {
  Activity as ActivityIcon,
  Phone,
  CalendarDays,
  Mail,
  FileText,
  RefreshCw,
  MessageSquare,
  Bell,
  Search,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate, formatTime } from "@/lib/utils"
import { ACTIVITY_TYPES } from "@/lib/validations/activity"
import { deleteActivity, type ActivityWithLead } from "@/actions/activities"

const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  CALL:          { icon: Phone,        label: "Call",          color: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30" },
  MEETING:       { icon: CalendarDays, label: "Meeting",       color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30" },
  EMAIL:         { icon: Mail,         label: "Email",         color: "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30" },
  PROPOSAL_SENT: { icon: FileText,     label: "Proposal",      color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30" },
  FOLLOW_UP:     { icon: Bell,         label: "Follow-up",     color: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30" },
  STATUS_CHANGE: { icon: RefreshCw,    label: "Status Change", color: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800" },
  NOTE:          { icon: MessageSquare,label: "Note",          color: "text-muted-foreground bg-muted" },
}

function ActivityRow({ activity, onDelete }: { activity: ActivityWithLead; onDelete: (id: string, leadId: string) => void }) {
  const config = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.NOTE
  const Icon = config.icon
  const time = formatTime(activity.createdAt)

  return (
    <div className="group flex gap-3 rounded-lg border bg-card p-3.5">
      <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${config.color}`}>
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm leading-snug">
              <Link href={`/leads/${activity.leadId}`} className="font-medium hover:underline">
                {activity.lead.companyName || activity.lead.name}
              </Link>
              <span className="text-xs font-medium text-muted-foreground"> · {config.label}</span>
            </p>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{activity.description}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(activity.id, activity.leadId)}
            className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            aria-label="Delete activity"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {activity.createdBy && <span>{activity.createdBy} · </span>}
          {formatDate(activity.createdAt)}{time ? ` · ${time}` : ""}
        </p>
      </div>
    </div>
  )
}

export function ActivityFeedClient({ activities }: { activities: ActivityWithLead[] }) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [items, setItems] = useState(activities)
  const [, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return items.filter((a) => {
      const matchesSearch =
        !q ||
        a.description.toLowerCase().includes(q) ||
        a.lead.name.toLowerCase().includes(q) ||
        (a.lead.companyName?.toLowerCase().includes(q) ?? false)
      const matchesType = typeFilter === "ALL" || a.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [items, search, typeFilter])

  function handleDelete(id: string, leadId: string) {
    setItems((prev) => prev.filter((a) => a.id !== id))
    startTransition(async () => { await deleteActivity(id, leadId) })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-[180px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activity…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {ACTIVITY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ActivityIcon className="size-8 text-muted-foreground mb-3" />
          <p className="font-medium">No activity found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length === 0 ? "Activity logged on leads will show up here" : "Try adjusting your search or filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <ActivityRow key={a.id} activity={a} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
