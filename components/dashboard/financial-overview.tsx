import Link from "next/link"
import { cn, formatCurrency } from "@/lib/utils"
import type { FinancialOverview as FinancialOverviewData } from "@/lib/dashboard/types"

export function FinancialOverview({ data }: { data: FinancialOverviewData }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Financial Overview</h2>
        <Link href="/financial" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border p-3 space-y-1">
          <p className="text-xs text-muted-foreground">Total Invoiced</p>
          <p className="text-xl font-semibold tabular-nums">{formatCurrency(data.totalInvoiced)}</p>
        </div>
        <div className="rounded-lg border p-3 space-y-1">
          <p className="text-xs text-muted-foreground">Total Collected</p>
          <p className="text-xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatCurrency(data.totalCollected)}
          </p>
        </div>
        <div className="rounded-lg border p-3 space-y-1">
          <p className="text-xs text-muted-foreground">Outstanding</p>
          <p className={cn("text-xl font-semibold tabular-nums", data.outstanding > 0 && "text-destructive")}>
            {formatCurrency(data.outstanding)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Link href="/financial" className="rounded-lg border p-2 text-center transition-colors hover:bg-muted/30">
          <p className="text-lg font-semibold tabular-nums">{data.invoiceCounts.draft}</p>
          <p className="text-[11px] text-muted-foreground">Draft</p>
        </Link>
        <Link href="/financial" className="rounded-lg border p-2 text-center transition-colors hover:bg-muted/30">
          <p className="text-lg font-semibold tabular-nums">{data.invoiceCounts.sent}</p>
          <p className="text-[11px] text-muted-foreground">Sent</p>
        </Link>
        <Link
          href="/financial"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-center transition-colors hover:bg-destructive/10"
        >
          <p className="text-lg font-semibold tabular-nums text-destructive">{data.invoiceCounts.overdue}</p>
          <p className="text-[11px] text-muted-foreground">Overdue</p>
        </Link>
        <Link href="/financial" className="rounded-lg border p-2 text-center transition-colors hover:bg-muted/30">
          <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {data.invoiceCounts.paid}
          </p>
          <p className="text-[11px] text-muted-foreground">Paid</p>
        </Link>
      </div>
    </div>
  )
}
