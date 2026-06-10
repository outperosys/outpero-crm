import { StatCard } from "./stat-card"
import type { SalesOverview as SalesOverviewData } from "@/lib/dashboard/types"

export function SalesOverview({ data }: { data: SalesOverviewData }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h2 className="text-sm font-semibold tracking-tight">Sales Overview</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Total Leads"
          value={data.totalLeads}
          sublabel={`+${data.totalLeadsLast30} last 30d`}
          href="/leads"
        />
        <StatCard
          label="Active Leads"
          value={data.activeLeads}
          sublabel={`+${data.activeLeadsLast30} last 30d`}
          href="/pipeline"
        />
        <StatCard label="Hot Leads" value={data.hotLeads} sublabel="High priority" href="/pipeline" />
        <StatCard
          label="Won Deals"
          value={data.wonDeals}
          sublabel={`+${data.wonDealsLast30} last 30d`}
          href="/pipeline"
          tone="success"
        />
        <StatCard
          label="Lost Deals"
          value={data.lostDeals}
          sublabel={`+${data.lostDealsLast30} last 30d`}
          href="/pipeline"
          tone="destructive"
        />
      </div>
    </div>
  )
}
