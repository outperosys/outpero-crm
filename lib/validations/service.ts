import { z } from "zod"

export const SERVICE_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
]

export const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
  shortDescription: z.string().min(1, "Short description is required"),
  fullDescription: z.string().optional(),
  startingPrice: z.coerce.number().min(0, "Must be positive").optional(),
  defaultPrice: z.coerce.number().min(0, "Must be positive").optional(),
  pricingNotes: z.string().optional(),
  timeline: z.string().optional(),
  deliverables: z.string().optional(),
  implementationSteps: z.string().optional(),
  idealClient: z.string().optional(),
  problemsSolved: z.string().optional(),
  commonObjections: z.string().optional(),
  aiContext: z.string().optional(),
  proposalInstructions: z.string().optional(),
  followUpInstructions: z.string().optional(),
  proposalDefaults: z.string().optional(),
  invoiceDefaults: z.string().optional(),
  notes: z.string().optional(),
})

export type ServiceFormValues = z.infer<typeof serviceSchema>
