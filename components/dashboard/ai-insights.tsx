import Link from "next/link"
import { Sparkles } from "lucide-react"
import type { DashboardInsight } from "@/lib/dashboard/types"

export function AIInsights({ data }: { data: DashboardInsight[] }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-violet-500" />
        <h2 className="text-sm font-semibold tracking-tight">Insights</h2>
      </div>
      <ul className="space-y-2">
        {data.map((insight, i) => (
          <li key={i}>
            <Link href={insight.href} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
              {insight.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
