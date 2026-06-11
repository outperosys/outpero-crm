import { z } from "zod"
import type { MeetingType, MeetingStatus } from "@prisma/client"

export const meetingSchema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  title: z.string().min(1, "Title is required"),
  type: z.enum(["DISCOVERY_CALL", "DEMO", "ONBOARDING", "CHECK_IN", "INTERNAL", "OTHER"]),
  scheduledAt: z.string().min(1, "Scheduled time is required"),
  durationMinutes: z.string().optional(),
  meetingLink: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
})

export type MeetingFormValues = z.infer<typeof meetingSchema>

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  DISCOVERY_CALL: "Discovery Call",
  DEMO: "Demo",
  ONBOARDING: "Onboarding",
  CHECK_IN: "Check-in",
  INTERNAL: "Internal",
  OTHER: "Other",
}

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
}

export const MEETING_STATUS_COLORS: Record<MeetingStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  CANCELLED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  NO_SHOW: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

export const MEETING_TYPES: MeetingType[] = [
  "DISCOVERY_CALL",
  "DEMO",
  "ONBOARDING",
  "CHECK_IN",
  "INTERNAL",
  "OTHER",
]
