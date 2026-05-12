import { z } from "zod"

export const ACTIVITY_TYPES = [
  { value: "CALL", label: "Call" },
  { value: "MEETING", label: "Meeting" },
  { value: "EMAIL", label: "Email" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "STATUS_CHANGE", label: "Status Change" },
  { value: "NOTE", label: "Note" },
] as const

export const activitySchema = z.object({
  type: z.enum([
    "CALL",
    "MEETING",
    "EMAIL",
    "PROPOSAL_SENT",
    "FOLLOW_UP",
    "STATUS_CHANGE",
    "NOTE",
  ]),
  description: z.string().min(1, "Description is required"),
  createdBy: z.string().optional(),
})

export type ActivityFormValues = z.infer<typeof activitySchema>
