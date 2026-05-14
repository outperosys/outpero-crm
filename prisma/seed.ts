import { PrismaClient, Prisma, type ProposalSectionType } from "@prisma/client"

const prisma = new PrismaClient()

// ─── Follow-up templates ───────────────────────────────────────────────────────

const followUpTemplates = [
  {
    name: "Proposal Follow-up",
    title: "Follow up on sent proposal",
    notes:
      "Check if the client has reviewed the proposal. Address any questions or objections and confirm next steps.",
  },
  {
    name: "Discovery Reminder",
    title: "Schedule discovery call",
    notes:
      "Reach out to schedule the discovery call. Confirm availability and send a calendar invite with agenda.",
  },
  {
    name: "No Response",
    title: "Re-attempt contact — no response",
    notes:
      "Client has not responded. Try a different channel (email → phone → LinkedIn). Keep it brief and low pressure.",
  },
  {
    name: "Re-engagement",
    title: "Re-engage cold lead",
    notes:
      "Lead has gone cold. Share a new case study, relevant success story, or industry update to re-open the conversation.",
  },
]

// ─── Proposal templates ────────────────────────────────────────────────────────

type SectionSeed = {
  type: ProposalSectionType
  title: string
  contentTemplate: string
  order: number
  isRequired: boolean
  isAIGenerated: boolean
  metadata?: object
}

type TemplateSeed = {
  name: string
  description: string
  isDefault: boolean
  sections: SectionSeed[]
}

const proposalTemplates: TemplateSeed[] = [
  {
    name: "Full Proposal",
    description: "Complete proposal with all sections — executive summary, scope, timeline, pricing, and terms.",
    isDefault: true,
    sections: [
      {
        type: "COVER",
        title: "Cover",
        contentTemplate: "{{lead.company}} — Automation Proposal\nPrepared for: {{lead.name}}\nDate: {{proposal.date}}",
        order: 1,
        isRequired: true,
        isAIGenerated: false,
      },
      {
        type: "EXECUTIVE_SUMMARY",
        title: "Executive Summary",
        contentTemplate: "",
        order: 2,
        isRequired: true,
        isAIGenerated: true,
      },
      {
        type: "PROBLEM_STATEMENT",
        title: "The Problem",
        contentTemplate: "",
        order: 3,
        isRequired: true,
        isAIGenerated: true,
      },
      {
        type: "PROPOSED_SOLUTION",
        title: "Our Solution",
        contentTemplate: "",
        order: 4,
        isRequired: true,
        isAIGenerated: true,
      },
      {
        type: "SCOPE_OF_WORK",
        title: "Scope of Work",
        contentTemplate: "",
        order: 5,
        isRequired: true,
        isAIGenerated: true,
      },
      {
        type: "TIMELINE",
        title: "Timeline",
        contentTemplate: "",
        order: 6,
        isRequired: false,
        isAIGenerated: false,
        metadata: { phases: [] },
      },
      {
        type: "PRICING",
        title: "Investment",
        contentTemplate: "",
        order: 7,
        isRequired: true,
        isAIGenerated: false,
        metadata: { lineItems: [], grandTotal: 0 },
      },
      {
        type: "ABOUT_US",
        title: "About Outpero",
        contentTemplate:
          "We are an AI automation agency that helps businesses eliminate manual workflows and scale with intelligent systems. We specialize in workflow automation, AI integrations, and custom tooling.",
        order: 8,
        isRequired: false,
        isAIGenerated: false,
      },
      {
        type: "TERMS",
        title: "Terms & Conditions",
        contentTemplate:
          "This proposal is valid for 14 days from the date above. A 50% deposit is required to begin work. The remaining 50% is due upon project completion. All work remains the property of the client upon full payment.",
        order: 9,
        isRequired: false,
        isAIGenerated: false,
      },
      {
        type: "NEXT_STEPS",
        title: "Next Steps",
        contentTemplate: "",
        order: 10,
        isRequired: true,
        isAIGenerated: true,
      },
    ],
  },
  {
    name: "Quick Scope",
    description: "Lightweight proposal — scope and pricing only. Best for small, well-defined projects.",
    isDefault: false,
    sections: [
      {
        type: "COVER",
        title: "Cover",
        contentTemplate: "{{lead.company}} — Scope of Work\nPrepared for: {{lead.name}}\nDate: {{proposal.date}}",
        order: 1,
        isRequired: true,
        isAIGenerated: false,
      },
      {
        type: "SCOPE_OF_WORK",
        title: "Scope of Work",
        contentTemplate: "",
        order: 2,
        isRequired: true,
        isAIGenerated: true,
      },
      {
        type: "PRICING",
        title: "Investment",
        contentTemplate: "",
        order: 3,
        isRequired: true,
        isAIGenerated: false,
        metadata: { lineItems: [], grandTotal: 0 },
      },
      {
        type: "NEXT_STEPS",
        title: "Next Steps",
        contentTemplate: "",
        order: 4,
        isRequired: true,
        isAIGenerated: true,
      },
    ],
  },
  {
    name: "Discovery Proposal",
    description: "Early-stage proposal focused on the problem and proposed solution. No pricing or timeline.",
    isDefault: false,
    sections: [
      {
        type: "COVER",
        title: "Cover",
        contentTemplate: "{{lead.company}} — Discovery Overview\nPrepared for: {{lead.name}}\nDate: {{proposal.date}}",
        order: 1,
        isRequired: true,
        isAIGenerated: false,
      },
      {
        type: "PROBLEM_STATEMENT",
        title: "What We Heard",
        contentTemplate: "",
        order: 2,
        isRequired: true,
        isAIGenerated: true,
      },
      {
        type: "PROPOSED_SOLUTION",
        title: "How We Can Help",
        contentTemplate: "",
        order: 3,
        isRequired: true,
        isAIGenerated: true,
      },
      {
        type: "NEXT_STEPS",
        title: "Next Steps",
        contentTemplate: "",
        order: 4,
        isRequired: true,
        isAIGenerated: true,
      },
    ],
  },
]

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Seed follow-up templates
  for (const template of followUpTemplates) {
    await prisma.followUpTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: template,
    })
  }
  console.log(`✓ Seeded ${followUpTemplates.length} follow-up templates`)

  // Seed proposal templates
  for (const { sections, ...templateData } of proposalTemplates) {
    const template = await prisma.proposalTemplate.upsert({
      where: { name: templateData.name },
      update: { description: templateData.description, isDefault: templateData.isDefault },
      create: templateData,
    })

    // Recreate sections to keep them in sync with seed definition
    await prisma.proposalTemplateSection.deleteMany({ where: { templateId: template.id } })
    await prisma.proposalTemplateSection.createMany({
      data: sections.map((s) => ({
        templateId: template.id,
        type: s.type,
        title: s.title,
        contentTemplate: s.contentTemplate,
        order: s.order,
        isRequired: s.isRequired,
        isAIGenerated: s.isAIGenerated,
        metadata: s.metadata !== undefined ? s.metadata : Prisma.JsonNull,
      })),
    })
    console.log(`✓ Seeded proposal template: ${templateData.name} (${sections.length} sections)`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
