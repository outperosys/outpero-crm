import Link from "next/link"
import { cn, formatDate } from "@/lib/utils"
import { TaskQuickToggle } from "./task-quick-toggle"
import type { MyTasksData } from "@/lib/dashboard/types"

export function MyTasks({ data }: { data: MyTasksData }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">My Tasks</h2>
        <Link href="/tasks" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border p-2">
          <p className="text-lg font-semibold tabular-nums">{data.openTasks}</p>
          <p className="text-[11px] text-muted-foreground">Open</p>
        </div>
        <div className="rounded-lg border p-2">
          <p className="text-lg font-semibold tabular-nums">{data.dueToday}</p>
          <p className="text-[11px] text-muted-foreground">Due Today</p>
        </div>
        <div className={cn("rounded-lg border p-2", data.overdue > 0 && "border-destructive/30 bg-destructive/5")}>
          <p className={cn("text-lg font-semibold tabular-nums", data.overdue > 0 && "text-destructive")}>
            {data.overdue}
          </p>
          <p className="text-[11px] text-muted-foreground">Overdue</p>
        </div>
      </div>

      {data.tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing on your plate.</p>
      ) : (
        <div className="space-y-1">
          {data.tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-muted/40">
              <TaskQuickToggle taskId={task.id} />
              <p className="min-w-0 flex-1 truncate text-sm">{task.title}</p>
              {task.dueDate && (
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(task.dueDate)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
