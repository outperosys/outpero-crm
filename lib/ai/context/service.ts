import type { Service } from "@prisma/client"
import { formatCurrency } from "@/lib/utils"

export function buildServiceContext(service: Service): string {
  const lines = [
    `Service: ${service.name}`,
    `Category: ${service.category}`,
    `Status: ${service.status}`,
    service.shortDescription
      ? `Short description: ${service.shortDescription}`
      : null,
    service.fullDescription ? `Full description: ${service.fullDescription}` : null,
    service.startingPrice !== null
      ? `Starting price: ${formatCurrency(service.startingPrice)}`
      : null,
    service.defaultPrice !== null
      ? `Default price: ${formatCurrency(service.defaultPrice)}`
      : null,
    service.pricingNotes ? `Pricing notes: ${service.pricingNotes}` : null,
    service.timeline ? `Timeline: ${service.timeline}` : null,
    service.deliverables ? `Deliverables: ${service.deliverables}` : null,
    service.implementationSteps
      ? `Implementation steps: ${service.implementationSteps}`
      : null,
    service.idealClient ? `Ideal client: ${service.idealClient}` : null,
    service.problemsSolved ? `Problems solved: ${service.problemsSolved}` : null,
    service.commonObjections
      ? `Common objections: ${service.commonObjections}`
      : null,
    service.aiContext ? `AI context: ${service.aiContext}` : null,
    service.proposalInstructions
      ? `Proposal instructions: ${service.proposalInstructions}`
      : null,
    service.followUpInstructions
      ? `Follow-up instructions: ${service.followUpInstructions}`
      : null,
    service.proposalDefaults
      ? `Proposal defaults: ${service.proposalDefaults}`
      : null,
    service.invoiceDefaults ? `Invoice defaults: ${service.invoiceDefaults}` : null,
  ]

  return lines.filter(Boolean).join("\n")
}

export function buildServicesContext(services: Service[]): string {
  if (services.length === 0) return ""

  return services.map(buildServiceContext).join("\n\n---\n\n")
}
