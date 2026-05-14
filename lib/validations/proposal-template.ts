import { z } from "zod"

export const PROPOSAL_SECTION_TYPES = [
  "COVER",
  "EXECUTIVE_SUMMARY",
  "PROBLEM_STATEMENT",
  "PROPOSED_SOLUTION",
  "SCOPE_OF_WORK",
  "TIMELINE",
  "PRICING",
  "ABOUT_US",
  "TERMS",
  "NEXT_STEPS",
  "CUSTOM",
] as const

export const PROPOSAL_SECTION_LABELS: Record<(typeof PROPOSAL_SECTION_TYPES)[number], string> = {
  COVER: "Cover",
  EXECUTIVE_SUMMARY: "Executive Summary",
  PROBLEM_STATEMENT: "Problem Statement",
  PROPOSED_SOLUTION: "Proposed Solution",
  SCOPE_OF_WORK: "Scope of Work",
  TIMELINE: "Timeline",
  PRICING: "Pricing",
  ABOUT_US: "About Us",
  TERMS: "Terms & Conditions",
  NEXT_STEPS: "Next Steps",
  CUSTOM: "Custom Section",
}

export const proposalTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(300).optional(),
  isDefault: z.boolean().optional(),
})

export const proposalTemplateSectionSchema = z.object({
  type: z.enum(PROPOSAL_SECTION_TYPES),
  title: z.string().min(1, "Title is required").max(100),
  contentTemplate: z.string().max(5000).optional(),
  isRequired: z.boolean().optional(),
  isAIGenerated: z.boolean().optional(),
})

export type ProposalTemplateFormValues = z.infer<typeof proposalTemplateSchema>
export type ProposalTemplateSectionFormValues = z.infer<typeof proposalTemplateSectionSchema>
