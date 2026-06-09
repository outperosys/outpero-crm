import { z } from "zod"

export const PIPELINE_STAGES = [
  { value: "NEW_LEAD",          label: "New Lead" },
  { value: "QUALIFIED",         label: "Contacted" },
  { value: "DISCOVERY_CALL",    label: "Discovery Scheduled" },
  { value: "DISCOVERY_DONE",    label: "Discovery Done" },
  { value: "PROPOSAL_SENT",     label: "Proposal Sent" },
  { value: "FOLLOW_UP",         label: "Negotiation" },
  { value: "WON",               label: "Won" },
  { value: "LOST",              label: "Lost" },
] as const

export const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
] as const

export const URGENCIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
] as const

export const LEAD_SOURCES = [
  "Instagram",
  "LinkedIn",
  "Facebook",
  "WhatsApp",
  "Referral",
  "Cold Call",
  "Email Outreach",
  "Google Ads",
  "YouTube",
  "Website / SEO",
  "Twitter / X",
  "IndiaMART",
  "JustDial",
  "Event / Conference",
  "Partner",
  "Other",
] as const

export const INDUSTRIES = [
  "E-commerce",
  "Real Estate",
  "Healthcare",
  "Education",
  "Finance & BFSI",
  "Retail",
  "Technology",
  "Food & Beverage",
  "Hospitality",
  "Legal",
  "Logistics",
  "Manufacturing",
  "Other",
] as const

export const TEAM_SIZES = ["1–5", "6–20", "21–50", "51–200", "201–500", "500+"] as const

export const leadSchema = z.object({
  name: z.string().min(1, "Lead name is required"),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  source: z.string().optional(),
  serviceInterested: z.string().optional(),
  callVolume: z.string().optional(),
  industry: z.string().optional(),
  teamSize: z.string().optional(),

  socialProfiles: z.string().optional(),
  existingWebsite: z.string().optional(),

  currentProblem: z.string().optional(),
  currentTools: z.string().optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"]),
  pipelineStage: z.enum([
    "NEW_LEAD",
    "QUALIFIED",
    "DISCOVERY_CALL",
    "DISCOVERY_DONE",
    "PROPOSAL_SENT",
    "FOLLOW_UP",
    "WON",
    "LOST",
  ]),

  lastContacted: z.string().optional(),
  nextFollowUp: z.string().optional(),

  dealValue: z.coerce.number().min(0).optional().nullable(),
  proposalSent: z.boolean(),

  notes: z.string().optional(),
  assignedTo: z.string().optional(),
})

export type LeadFormValues = z.infer<typeof leadSchema>
