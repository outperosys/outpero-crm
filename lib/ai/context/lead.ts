import { summarizeNotes } from "./summarize"
import { formatTranscriptInsights } from "./transcript"
import type { TranscriptInsights } from "./transcript"

// Max activities included in any prompt — older ones are dropped first.
const ACTIVITY_LIMIT = 8

const STAGE_LABELS: Record<string, string> = {
  NEW_LEAD:       "New Lead",
  QUALIFIED:      "Qualified",
  DISCOVERY_CALL: "Discovery Call",
  PROPOSAL_SENT:  "Proposal Sent",
  FOLLOW_UP:      "Follow-up",
  WON:            "Won",
  LOST:           "Lost",
}

// ─── Input shapes (what the action fetches from DB) ──────────────────────────

export interface RawLead {
  name: string
  companyName: string | null
  industry: string | null
  serviceInterested: string | null
  currentProblem: string | null
  currentTools: string | null
  teamSize: string | null
  source: string | null
  urgency: string
  priority: string
  pipelineStage: string
  dealValue: number | null
}

// ─── Output shape (consumed by prompt builders) ───────────────────────────────

export interface LeadFullContext {
  // Lead identity
  name: string
  company: string | null
  industry: string | null
  serviceInterested: string | null
  currentProblem: string | null
  currentTools: string | null
  teamSize: string | null
  source: string | null

  // Lead status
  urgency: string
  priority: string
  pipelineStage: string
  dealValue: number | null

  // Processed context (ready to inject into prompts)
  notesContext: string      // raw notes joined (≤4) or AI-summarized (>4)
  notesSummarized: boolean  // true when AI summarization was applied
  activityLines: string[]   // formatted, capped to ACTIVITY_LIMIT
  followUpTitles: string[]

  // Discovery context (null when no transcript was processed)
  transcriptBlock: string | null
}

// ─── Builder ──────────────────────────────────────────────────────────────────

export async function buildLeadContext(
  lead: RawLead,
  rawNotes: { content: string }[],
  rawActivities: { type: string; description: string; createdAt: Date }[],
  rawFollowUps: { title: string }[],
  transcriptInsights?: TranscriptInsights[]
): Promise<LeadFullContext> {
  // Notes: summarize if needed (async AI call)
  const noteTexts = rawNotes.map((n) => n.content)
  const summarized = noteTexts.length > 4
  const notesContext = await summarizeNotes(noteTexts)

  // Activities: cap and format
  const activityLines = rawActivities
    .slice(0, ACTIVITY_LIMIT)
    .map((a) => {
      const date = new Date(a.createdAt).toLocaleDateString("en-US", {
        month: "short", day: "numeric",
      })
      return `[${a.type.replace(/_/g, " ")}] ${a.description} (${date})`
    })

  // Follow-ups
  const followUpTitles = rawFollowUps.map((f) => f.title)

  // Transcript insights: merge all available and format into one block
  let transcriptBlock: string | null = null
  if (transcriptInsights && transcriptInsights.length > 0) {
    const merged = transcriptInsights.map(formatTranscriptInsights).filter(Boolean)
    transcriptBlock = merged.join("\n\n") || null
  }

  return {
    name:              lead.name,
    company:           lead.companyName,
    industry:          lead.industry,
    serviceInterested: lead.serviceInterested,
    currentProblem:    lead.currentProblem,
    currentTools:      lead.currentTools,
    teamSize:          lead.teamSize,
    source:            lead.source,
    urgency:           lead.urgency,
    priority:          lead.priority,
    pipelineStage:     STAGE_LABELS[lead.pipelineStage] ?? lead.pipelineStage,
    dealValue:         lead.dealValue,
    notesContext,
    notesSummarized:   summarized,
    activityLines,
    followUpTitles,
    transcriptBlock,
  }
}
