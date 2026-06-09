import { CheckSquare, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TaskDialog } from "./task-dialog"
import { TaskItemCompact } from "./task-item-compact"
import { getEntityTasks } from "@/actions/tasks"
import type { TaskRelatedType } from "@prisma/client"

interface EntityTasksCardProps {
  relatedType: TaskRelatedType
  relatedId: string
  teamMembers?: { id: string; name: string }[]
}

export async function EntityTasksCard({ relatedType, relatedId, teamMembers = [] }: EntityTasksCardProps) {
  const tasks = await getEntityTasks(relatedType, relatedId)
  const pending = tasks.filter((t) => t.status !== "DONE")
  const completed = tasks.filter((t) => t.status === "DONE")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <CheckSquare className="size-4" />
          Tasks
        </CardTitle>
        <TaskDialog
          defaultRelatedType={relatedType}
          defaultRelatedId={relatedId}
          lockRelated
          teamMembers={teamMembers}
          trigger={
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
              <Plus className="size-3.5" />
              Add
            </Button>
          }
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">No tasks yet</p>
        ) : (
          <>
            {pending.map((task) => (
              <TaskItemCompact key={task.id} task={task} teamMembers={teamMembers} />
            ))}
            {completed.length > 0 && pending.length > 0 && <div className="border-t pt-2" />}
            {completed.map((task) => (
              <TaskItemCompact key={task.id} task={task} teamMembers={teamMembers} />
            ))}
          </>
        )}
      </CardContent>
    </Card>
  )
}
