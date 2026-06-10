import type { DashboardInsight } from "./types"

export interface InsightInputs {
  highValueUncontactedLeads: number
  overdueInvoices: number
  overdueFollowUps: number
  overdueTasks: number
  hotLeadsAwaitingFollowUp: number
}

// Rule-based operational insights — no AI involved. Each rule fires only
// when its count is > 0, ranked roughly by urgency.
export function buildInsights(inputs: InsightInputs): DashboardInsight[] {
  const insights: DashboardInsight[] = []

  if (inputs.overdueFollowUps > 0) {
    insights.push({
      text: `${inputs.overdueFollowUps} follow-up${inputs.overdueFollowUps === 1 ? " is" : "s are"} overdue.`,
      href: "/follow-ups",
    })
  }

  if (inputs.overdueInvoices > 0) {
    insights.push({
      text: `${inputs.overdueInvoices} invoice${inputs.overdueInvoices === 1 ? " is" : "s are"} overdue.`,
      href: "/financial",
    })
  }

  if (inputs.highValueUncontactedLeads > 0) {
    insights.push({
      text: `${inputs.highValueUncontactedLeads} high-value lead${inputs.highValueUncontactedLeads === 1 ? " has" : "s have"} not been contacted in 5+ days.`,
      href: "/pipeline",
    })
  }

  if (inputs.overdueTasks > 0) {
    insights.push({
      text: `${inputs.overdueTasks} task${inputs.overdueTasks === 1 ? " is" : "s are"} overdue.`,
      href: "/tasks",
    })
  }

  if (inputs.hotLeadsAwaitingFollowUp > 0) {
    insights.push({
      text: `${inputs.hotLeadsAwaitingFollowUp} high-priority lead${inputs.hotLeadsAwaitingFollowUp === 1 ? " has" : "s have"} no upcoming follow-up scheduled.`,
      href: "/pipeline",
    })
  }

  if (insights.length === 0) {
    insights.push({ text: "All caught up — nothing urgent right now.", href: "/pipeline" })
  }

  return insights
}
