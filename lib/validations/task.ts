import { z } from "zod"

export const TASK_STATUSES = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "WAITING", label: "Waiting" },
  { value: "DONE", label: "Done" },
] as const

export const TASK_PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
] as const

export const TASK_RELATED_TYPES = [
  { value: "LEAD", label: "Lead" },
  { value: "INVOICE", label: "Invoice" },
  { value: "RECEIPT", label: "Receipt" },
  { value: "SERVICE", label: "Service" },
  { value: "GENERAL", label: "General" },
] as const

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "WAITING", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
  relatedType: z.enum(["LEAD", "INVOICE", "RECEIPT", "SERVICE", "GENERAL"]),
  leadId: z.string().optional(),
  invoiceId: z.string().optional(),
  receiptId: z.string().optional(),
  serviceId: z.string().optional(),
})

export type TaskFormValues = z.infer<typeof taskSchema>

export const taskCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
})

export type TaskCommentFormValues = z.infer<typeof taskCommentSchema>
