function pad(n: number) {
  return String(n).padStart(2, "0")
}

// Format as "YYYY-MM-DDTHH:mm" for <input type="datetime-local">
export function toDateTimeLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Local datetime string offset N days from now, at the given hour (default 10am)
export function dueInDays(days: number, hour = 10): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, 0, 0, 0)
  return toDateTimeLocal(d)
}

export type FollowUpUrgency = "overdue" | "today" | "soon" | "later"

export interface FollowUpStatus {
  urgency: FollowUpUrgency
  days: number
  label: string
}

export function getFollowUpStatus(date: Date | string): FollowUpStatus {
  const d = new Date(date)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((dueStart.getTime() - todayStart.getTime()) / 86400000)

  if (diffDays < 0) {
    return { urgency: "overdue", days: Math.abs(diffDays), label: `${Math.abs(diffDays)}d overdue` }
  }
  if (diffDays === 0) {
    return { urgency: "today", days: 0, label: "Due today" }
  }
  if (diffDays === 1) {
    return { urgency: "soon", days: 1, label: "Due tomorrow" }
  }
  if (diffDays <= 3) {
    return { urgency: "soon", days: diffDays, label: `In ${diffDays}d` }
  }
  return {
    urgency: "later",
    days: diffDays,
    label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }
}
