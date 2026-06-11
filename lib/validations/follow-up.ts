import { z } from "zod"

export const followUpSchema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  title: z.string().optional(),
  notes: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  assignedTo: z.string().optional(),
  templateId: z.string().optional(),
})

export type FollowUpFormValues = z.infer<typeof followUpSchema>
