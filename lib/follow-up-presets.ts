import { dueInDays } from "@/lib/follow-up"

export interface FollowUpPreset {
  label: string
  title: string
  notes: string
  dueDate: () => string
}

export const FOLLOW_UP_PRESETS: FollowUpPreset[] = [
  {
    label: "Proposal sent",
    title: "Follow up on sent proposal",
    notes: "Check if they've reviewed the proposal. Address any questions or objections and confirm next steps.",
    dueDate: () => dueInDays(1),
  },
  {
    label: "No response",
    title: "Re-attempt contact — no response",
    notes: "No response yet. Try a different channel (email → call → LinkedIn). Keep it brief and low pressure.",
    dueDate: () => dueInDays(3),
  },
  {
    label: "Schedule discovery call",
    title: "Schedule discovery call",
    notes: "Reach out to schedule the discovery call. Confirm availability and send a calendar invite with agenda.",
    dueDate: () => dueInDays(1),
  },
  {
    label: "Post-call check-in",
    title: "Check in after call",
    notes: "Recap the key points discussed and confirm the agreed next steps.",
    dueDate: () => dueInDays(1),
  },
  {
    label: "Send contract",
    title: "Send contract / agreement",
    notes: "Prepare and send the agreement for signing.",
    dueDate: () => dueInDays(1),
  },
  {
    label: "Chase payment",
    title: "Follow up on payment",
    notes: "Confirm whether the invoice has been paid. Send a friendly reminder if not.",
    dueDate: () => dueInDays(2),
  },
  {
    label: "Re-engage cold lead",
    title: "Re-engage cold lead",
    notes: "Share a relevant case study, success story, or industry update to re-open the conversation.",
    dueDate: () => dueInDays(7),
  },
  {
    label: "Onboarding check-in",
    title: "Onboarding check-in",
    notes: "Check how onboarding is going and whether they need anything from us.",
    dueDate: () => dueInDays(3),
  },
]
