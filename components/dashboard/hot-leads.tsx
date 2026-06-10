import Link from "next/link"
import { Flame } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { HotLead } from "@/lib/dashboard/types"

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  LOW: "bg-muted text-muted-foreground",
}

export function HotLeads({ data }: { data: HotLead[] }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Flame className="size-4 text-orange-500" />
        <h2 className="text-sm font-semibold tracking-tight">Hot Leads</h2>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hot leads right now.</p>
      ) : (
        <div className="space-y-1">
          {data.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="flex items-center justify-between gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{lead.companyName || lead.name}</p>
                {lead.companyName && <p className="text-xs text-muted-foreground truncate">{lead.name}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {lead.nextFollowUp && (
                  <span className="text-xs text-muted-foreground">{formatDate(lead.nextFollowUp)}</span>
                )}
                {lead.dealValue != null && lead.dealValue > 0 && (
                  <span className="text-sm font-semibold tabular-nums">{formatCurrency(lead.dealValue)}</span>
                )}
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[lead.priority]}`}
                >
                  {lead.priority.charAt(0) + lead.priority.slice(1).toLowerCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
