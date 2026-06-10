import Link from "next/link"
import type { PipelineSnapshotItem } from "@/lib/dashboard/types"

export function PipelineSnapshot({ data }: { data: PipelineSnapshotItem[] }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Pipeline Snapshot</h2>
        <Link href="/pipeline" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
          Open Pipeline
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {data.map((stage) => (
          <Link
            key={stage.stage}
            href="/pipeline"
            className="rounded-lg border p-3 text-center transition-colors hover:border-primary/40 hover:bg-muted/30"
          >
            <p className="text-xl font-semibold tabular-nums">{stage.count}</p>
            <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{stage.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
