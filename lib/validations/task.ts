import { z } from "zod"

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
})

export type TaskFormValues = z.infer<typeof taskSchema>
