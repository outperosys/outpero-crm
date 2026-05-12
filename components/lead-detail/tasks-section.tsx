import { CheckSquare } from "lucide-react"
import type { Task } from "@prisma/client"
import { AddTaskForm } from "./add-task-form"
import { TaskItem } from "./task-item"

interface TasksSectionProps {
  tasks: Task[]
  leadId: string
}

export function TasksSection({ tasks, leadId }: TasksSectionProps) {
  const pending = tasks.filter((t) => !t.completed)
  const completed = tasks.filter((t) => t.completed)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckSquare className="size-4 text-muted-foreground" />
        <h2 className="font-semibold">Tasks</h2>
        {pending.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {pending.length} open
          </span>
        )}
      </div>

      <AddTaskForm leadId={leadId} />

      {tasks.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No tasks yet
        </p>
      ) : (
        <div className="space-y-2">
          {pending.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}

          {completed.length > 0 && pending.length > 0 && (
            <div className="border-t pt-2" />
          )}

          {completed.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}
