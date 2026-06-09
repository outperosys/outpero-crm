import { CheckSquare, Plus } from "lucide-react"
import type { Task } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { TaskItemCompact } from "@/components/tasks/task-item-compact"

interface TasksSectionProps {
  tasks: Task[]
  leadId: string
  teamMembers?: { id: string; name: string }[]
}

export function TasksSection({ tasks, leadId, teamMembers = [] }: TasksSectionProps) {
  const pending = tasks.filter((t) => t.status !== "DONE")
  const completed = tasks.filter((t) => t.status === "DONE")

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckSquare className="size-4 text-muted-foreground" />
        <h2 className="font-semibold">Tasks</h2>
        <div className="ml-auto flex items-center gap-2">
          {pending.length > 0 && (
            <span className="text-xs text-muted-foreground">{pending.length} open</span>
          )}
          <TaskDialog
            defaultRelatedType="LEAD"
            defaultRelatedId={leadId}
            lockRelated
            teamMembers={teamMembers}
            trigger={
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                <Plus className="size-3.5" />
                Add
              </Button>
            }
          />
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No tasks yet
        </p>
      ) : (
        <div className="space-y-2">
          {pending.map((task) => (
            <TaskItemCompact key={task.id} task={task} teamMembers={teamMembers} />
          ))}

          {completed.length > 0 && pending.length > 0 && (
            <div className="border-t pt-2" />
          )}

          {completed.map((task) => (
            <TaskItemCompact key={task.id} task={task} teamMembers={teamMembers} />
          ))}
        </div>
      )}
    </div>
  )
}
