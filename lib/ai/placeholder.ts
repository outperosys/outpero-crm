import type { BusinessContext } from "@/lib/ai/types"

// ─── Placeholder context shape ────────────────────────────────────────────────

export interface PlaceholderContext {
  lead: {
    name?: string | null
    company?: string | null
    service?: string | null
    problem?: string | null
    industry?: string | null
    tools?: string | null
    teamSize?: string | null
  }
  proposal: {
    date: string
    validity?: string | null
  }
  agency?: Pick<BusinessContext, "agencyName">
}

// ─── Resolver ─────────────────────────────────────────────────────────────────

/**
 * Resolves {{placeholder}} tokens in a content template string.
 * Pure sync, no AI. Runs before any OpenAI calls.
 * Unknown placeholders are left as-is.
 */
export function resolvePlaceholders(template: string, ctx: PlaceholderContext): string {
  const map: Record<string, string> = {
    "{{lead.name}}": ctx.lead.name ?? "",
    "{{lead.company}}": ctx.lead.company ?? "",
    "{{lead.service}}": ctx.lead.service ?? "",
    "{{lead.problem}}": ctx.lead.problem ?? "",
    "{{lead.industry}}": ctx.lead.industry ?? "",
    "{{lead.tools}}": ctx.lead.tools ?? "",
    "{{lead.teamSize}}": ctx.lead.teamSize ?? "",
    "{{proposal.date}}": ctx.proposal.date,
    "{{proposal.validity}}": ctx.proposal.validity ?? "14 days",
    "{{agency.name}}": ctx.agency?.agencyName ?? "",
  }

  let result = template
  for (const [token, value] of Object.entries(map)) {
    result = result.replaceAll(token, value)
  }
  return result
}

// ─── Date formatting ──────────────────────────────────────────────────────────

export function formatProposalDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
