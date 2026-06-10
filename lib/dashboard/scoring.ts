import type { HotLead } from "./types"

export interface HotLeadCandidate {
  id: string
  name: string
  companyName: string | null
  dealValue: number | null
  priority: string
  urgency: string
  nextFollowUp: Date | null
  lastContacted: Date | null
}

const DAY_MS = 24 * 60 * 60 * 1000

function scoreCandidate(lead: HotLeadCandidate, now: number): number {
  let score = 0

  if (lead.priority === "HIGH") score += 3
  else if (lead.priority === "MEDIUM") score += 1

  if (lead.urgency === "HIGH") score += 2
  else if (lead.urgency === "MEDIUM") score += 1

  if (lead.dealValue) {
    score += Math.min(lead.dealValue / 50000, 4)
  }

  if (lead.nextFollowUp) {
    const daysOut = (lead.nextFollowUp.getTime() - now) / DAY_MS
    if (daysOut <= 3) score += 2
    else if (daysOut <= 7) score += 1
  }

  if (lead.lastContacted) {
    const daysSince = (now - lead.lastContacted.getTime()) / DAY_MS
    if (daysSince <= 7) score += 1
  }

  return score
}

// Ranks candidate leads by priority, urgency, deal value, follow-up
// proximity, and recent activity. Returns the top `limit` leads.
export function rankHotLeads(candidates: HotLeadCandidate[], limit = 5): HotLead[] {
  const now = Date.now()
  return candidates
    .map((lead) => ({
      id: lead.id,
      name: lead.name,
      companyName: lead.companyName,
      dealValue: lead.dealValue,
      priority: lead.priority,
      nextFollowUp: lead.nextFollowUp,
      score: scoreCandidate(lead, now),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
