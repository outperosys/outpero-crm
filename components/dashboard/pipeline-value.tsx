import { StatCard } from "./stat-card"
import { formatCurrency } from "@/lib/utils"
import type { PipelineValue as PipelineValueData } from "@/lib/dashboard/types"

export function PipelineValueCard({ data }: { data: PipelineValueData }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h2 className="text-sm font-semibold tracking-tight">Pipeline Value</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Pipeline" value={formatCurrency(data.totalPipelineValue)} href="/pipeline" />
        <StatCard label="High Priority" value={formatCurrency(data.highPriorityPipelineValue)} href="/pipeline" />
        <StatCard label="Won Revenue" value={formatCurrency(data.wonRevenue)} href="/pipeline" tone="success" />
        <StatCard label="Expected Revenue" value={formatCurrency(data.expectedRevenue)} href="/pipeline" />
      </div>
    </div>
  )
}
