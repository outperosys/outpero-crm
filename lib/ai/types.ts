// ─── Follow-up generation ─────────────────────────────────────────────────────

export type FollowUpTone = "professional" | "friendly" | "assertive"
export type FollowUpLength = "short" | "medium" | "detailed"
export type FollowUpChannel = "whatsapp" | "email"
export type FollowUpStyle = "soft" | "direct" | "urgent"

export interface FollowUpGenerationOptions {
  tone: FollowUpTone
  length: FollowUpLength
  channel: FollowUpChannel
  style: FollowUpStyle
  customIntent?: string
  count?: number
}

export interface FollowUpVariation {
  label: string
  message: string
}

// ─── Shared prompt context ────────────────────────────────────────────────────

export interface LeadAIContext {
  name: string
  companyName: string | null
  serviceInterested: string | null
  industry: string | null
  pipelineStage: string
  priority: string
  urgency: string
  currentProblem: string | null
  notes: string | null
  proposalSent: boolean
  dealValue: number | null
  lastContacted: Date | null
}

export interface ActivityAIContext {
  type: string
  description: string
  createdAt: Date
}

// ─── Future: business context (injected from Settings) ────────────────────────
// This will be populated from a future Settings/Brand layer.
// All prompt builders accept this as an optional parameter so injection
// requires no structural change to prompts — just pass it in.

export interface BusinessContext {
  agencyName?: string
  services?: string[]
  brandTone?: string
  customInstructions?: string
}
