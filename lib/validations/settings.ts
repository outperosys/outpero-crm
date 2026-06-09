import { z } from "zod"

export const PIPELINE_STAGE_KEYS = [
  "NEW_LEAD",
  "QUALIFIED",
  "DISCOVERY_CALL",
  "DISCOVERY_DONE",
  "PROPOSAL_SENT",
  "FOLLOW_UP",
  "WON",
  "LOST",
] as const

export const DEFAULT_STAGE_LABELS: Record<string, string> = {
  NEW_LEAD:       "New Lead",
  QUALIFIED:      "Contacted",
  DISCOVERY_CALL: "Discovery Scheduled",
  DISCOVERY_DONE: "Discovery Done",
  PROPOSAL_SENT:  "Proposal Sent",
  FOLLOW_UP:      "Negotiation",
  WON:            "Won",
  LOST:           "Lost",
}

export const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "friendly",     label: "Friendly" },
  { value: "assertive",    label: "Assertive" },
  { value: "consultative", label: "Consultative" },
  { value: "conversational", label: "Conversational" },
] as const

export const PROPOSAL_STYLE_OPTIONS = [
  { value: "formal",       label: "Formal" },
  { value: "consultative", label: "Consultative" },
  { value: "technical",    label: "Technical" },
  { value: "story-driven", label: "Story-driven" },
] as const

export const FOLLOW_UP_STYLE_OPTIONS = [
  { value: "direct",    label: "Direct" },
  { value: "soft",      label: "Soft" },
  { value: "brief",     label: "Brief" },
  { value: "nurturing", label: "Nurturing" },
] as const

export const SERVICE_ORDERING_OPTIONS = [
  { value: "manual",       label: "Manual" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "price_asc",    label: "Price (Low → High)" },
  { value: "price_desc",   label: "Price (High → Low)" },
] as const

// ─── Section schemas ──────────────────────────────────────────────────────────

export const businessSettingsSchema = z.object({
  businessName: z.string().optional(),
  website:      z.string().optional(),
  email:        z.string().email("Invalid email").optional().or(z.literal("")),
  phone:        z.string().optional(),
  address:      z.string().optional(),
  gstNumber:    z.string().optional(),
  tagline:      z.string().optional(),
})

export const brandingSettingsSchema = z.object({
  logoUrl:          z.string().optional(),
  primaryColor:     z.string().optional(),
  secondaryColor:   z.string().optional(),
  accentColor:      z.string().optional(),
  brandDescription: z.string().optional(),
})

export const paymentSettingsSchema = z.object({
  bankName:            z.string().optional(),
  accountHolder:       z.string().optional(),
  accountNumber:       z.string().optional(),
  ifscCode:            z.string().optional(),
  upiId:               z.string().optional(),
  paymentInstructions: z.string().optional(),
})

export const aiSettingsSchema = z.object({
  defaultTone:          z.string().optional(),
  defaultProposalStyle: z.string().optional(),
  defaultFollowUpStyle: z.string().optional(),
  aiBrandVoice:         z.string().optional(),
})

export const servicePreferencesSchema = z.object({
  defaultServiceId:   z.string().optional(),
  featuredServiceIds: z.array(z.string()),
  serviceOrdering:    z.string().optional(),
})

export const pipelineSettingsSchema = z.object({
  pipelineStageLabels: z.record(z.string()),
  defaultWonStage:     z.string().optional(),
  defaultLostStage:    z.string().optional(),
})

export const teamMemberSchema = z.object({
  name:     z.string().min(1, "Name is required"),
  role:     z.string().min(1, "Role is required"),
  email:    z.string().email("Valid email required"),
  isActive: z.boolean(),
})

// ─── Form value types ─────────────────────────────────────────────────────────

export type BusinessSettingsValues   = z.infer<typeof businessSettingsSchema>
export type BrandingSettingsValues   = z.infer<typeof brandingSettingsSchema>
export type PaymentSettingsValues    = z.infer<typeof paymentSettingsSchema>
export type AISettingsValues         = z.infer<typeof aiSettingsSchema>
export type ServicePreferencesValues = z.infer<typeof servicePreferencesSchema>
export type PipelineSettingsValues   = z.infer<typeof pipelineSettingsSchema>
export type TeamMemberValues         = z.infer<typeof teamMemberSchema>

// Legacy — kept for backward compat with existing code
export const agencySettingsSchema = z.object({
  name:       z.string().optional(),
  address:    z.string().optional(),
  bankDetails: z.string().optional(),
  terms:      z.string().optional(),
  toneOfVoice: z.string().optional(),
})
export type AgencySettingsFormValues = z.infer<typeof agencySettingsSchema>
