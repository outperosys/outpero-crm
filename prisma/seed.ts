import { PrismaClient, Prisma, type ProposalSectionType } from "@prisma/client"

type VisualStyle = "CLEAN" | "MODERN" | "HIGHLIGHT" | "MINIMAL" | "HERO" | "TWO_COLUMN"
type LayoutType = "FULL_WIDTH" | "CENTERED" | "TWO_COLUMN" | "CARD"

const prisma = new PrismaClient()

// ─── Follow-up templates ───────────────────────────────────────────────────────

const followUpTemplates = [
  {
    name: "Proposal Follow-up",
    title: "Follow up on sent proposal",
    notes: "Check if the client has reviewed the proposal. Address any questions or objections and confirm next steps.",
  },
  {
    name: "Discovery Reminder",
    title: "Schedule discovery call",
    notes: "Reach out to schedule the discovery call. Confirm availability and send a calendar invite with agenda.",
  },
  {
    name: "No Response",
    title: "Re-attempt contact — no response",
    notes: "Client has not responded. Try a different channel (email → phone → LinkedIn). Keep it brief and low pressure.",
  },
  {
    name: "Re-engagement",
    title: "Re-engage cold lead",
    notes: "Lead has gone cold. Share a new case study, relevant success story, or industry update to re-open the conversation.",
  },
]

// ─── Proposal templates ────────────────────────────────────────────────────────

type SectionSeed = {
  type: ProposalSectionType
  title: string
  templateText: string
  aiInstructions?: string
  order: number
  isRequired: boolean
  isAIGenerated: boolean
  isAIRefinement: boolean
  visualStyle: VisualStyle
  layoutType: LayoutType
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
    description: "Complete proposal — executive summary, scope, timeline, pricing, and terms.",
    isDefault: true,
    sections: [
      {
        type: "COVER",
        title: "Cover",
        templateText: "{{lead.company}} — Automation Proposal\nPrepared for: {{lead.name}}\nDate: {{proposal.date}}",
        order: 1,
        isRequired: true,
        isAIGenerated: false,
        isAIRefinement: false,
        visualStyle: "HERO",
        layoutType: "CENTERED",
      },
      {
        type: "EXECUTIVE_SUMMARY",
        title: "Executive Summary",
        templateText: "",
        aiInstructions: "2-3 paragraphs. Open with the client's company name and the specific problem they face. Close with the clear outcome we deliver. No generic openers like 'We are pleased to present'.",
        order: 2,
        isRequired: true,
        isAIGenerated: true,
        isAIRefinement: false,
        visualStyle: "CLEAN",
        layoutType: "FULL_WIDTH",
      },
      {
        type: "PROBLEM_STATEMENT",
        title: "The Problem",
        templateText: "{{lead.company}} is dealing with manual, time-consuming processes that slow down the team and create room for errors. Without automation, these inefficiencies will only compound as the business scales.\n\nWe've seen this pattern across the {{lead.industry}} space — teams spend hours on tasks that should take minutes, and critical work gets delayed as a result.",
        aiInstructions: "Refine this to be specific to the lead. Replace the generic description with their actual problem and industry context. Keep the two-paragraph structure. Sound like you've diagnosed their exact situation.",
        order: 3,
        isRequired: true,
        isAIGenerated: false,
        isAIRefinement: true,
        visualStyle: "HIGHLIGHT",
        layoutType: "FULL_WIDTH",
      },
      {
        type: "PROPOSED_SOLUTION",
        title: "Our Solution",
        templateText: "",
        aiInstructions: "2 paragraphs. First: describe our specific approach to solving their problem — name the automation method or tool category. Second: explain what this unlocks for them operationally. Be concrete. Avoid vague phrases like 'leveraging AI'.",
        order: 4,
        isRequired: true,
        isAIGenerated: true,
        isAIRefinement: false,
        visualStyle: "CLEAN",
        layoutType: "FULL_WIDTH",
      },
      {
        type: "SCOPE_OF_WORK",
        title: "Scope of Work",
        templateText: "Our engagement includes the following deliverables:\n\n- Workflow audit and process mapping\n- Custom automation build and configuration\n- Integration with existing tools and systems\n- Testing and quality assurance\n- Team training and documentation\n- 30 days post-launch support",
        aiInstructions: "Refine the deliverables list to match this client's specific service need, industry, and current tools. Replace generic items with concrete, specific ones. Keep as a bullet list with 4-6 items. Start each with an action verb.",
        order: 5,
        isRequired: true,
        isAIGenerated: false,
        isAIRefinement: true,
        visualStyle: "MODERN",
        layoutType: "FULL_WIDTH",
      },
      {
        type: "TIMELINE",
        title: "Timeline",
        templateText: "",
        order: 6,
        isRequired: false,
        isAIGenerated: false,
        isAIRefinement: false,
        visualStyle: "CLEAN",
        layoutType: "FULL_WIDTH",
        metadata: { phases: [] },
      },
      {
        type: "PRICING",
        title: "Investment",
        templateText: "",
        order: 7,
        isRequired: true,
        isAIGenerated: false,
        isAIRefinement: false,
        visualStyle: "CLEAN",
        layoutType: "FULL_WIDTH",
        metadata: { lineItems: [], grandTotal: 0 },
      },
      {
        type: "ABOUT_US",
        title: "About Outpero",
        templateText: "We are an AI automation agency that helps businesses eliminate manual workflows and scale with intelligent systems. We specialize in workflow automation, AI integrations, and custom tooling.\n\nOur approach is hands-on and outcome-focused — we build systems that actually get used, and we stay close through launch and beyond.",
        order: 8,
        isRequired: false,
        isAIGenerated: false,
        isAIRefinement: false,
        visualStyle: "MINIMAL",
        layoutType: "FULL_WIDTH",
      },
      {
        type: "TERMS",
        title: "Terms & Conditions",
        templateText: "This proposal is valid for 14 days from the date above. A 50% deposit is required to begin work. The remaining 50% is due upon project completion. All work remains the property of the client upon full payment.",
        order: 9,
        isRequired: false,
        isAIGenerated: false,
        isAIRefinement: false,
        visualStyle: "MINIMAL",
        layoutType: "FULL_WIDTH",
      },
      {
        type: "NEXT_STEPS",
        title: "Next Steps",
        templateText: "",
        aiInstructions: "3-4 bullet points: review proposal → approve and sign → kick-off call → deposit. Direct and action-oriented. End with one sentence inviting questions.",
        order: 10,
        isRequired: true,
        isAIGenerated: true,
        isAIRefinement: false,
        visualStyle: "MODERN",
        layoutType: "FULL_WIDTH",
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
        templateText: "{{lead.company}} — Scope of Work\nPrepared for: {{lead.name}}\nDate: {{proposal.date}}",
        order: 1,
        isRequired: true,
        isAIGenerated: false,
        isAIRefinement: false,
        visualStyle: "HERO",
        layoutType: "CENTERED",
      },
      {
        type: "SCOPE_OF_WORK",
        title: "Scope of Work",
        templateText: "This engagement covers the following deliverables:\n\n- Process analysis and requirements gathering\n- Build and configure the automation\n- Testing and validation\n- Handoff and documentation",
        aiInstructions: "Refine these deliverables to match the client's specific need and service interest. Make each item concrete and specific. Keep as 4-5 bullet points starting with action verbs.",
        order: 2,
        isRequired: true,
        isAIGenerated: false,
        isAIRefinement: true,
        visualStyle: "MODERN",
        layoutType: "FULL_WIDTH",
      },
      {
        type: "PRICING",
        title: "Investment",
        templateText: "",
        order: 3,
        isRequired: true,
        isAIGenerated: false,
        isAIRefinement: false,
        visualStyle: "CLEAN",
        layoutType: "FULL_WIDTH",
        metadata: { lineItems: [], grandTotal: 0 },
      },
      {
        type: "NEXT_STEPS",
        title: "Next Steps",
        templateText: "",
        aiInstructions: "3-4 bullet points covering: review → approve → kick-off call → deposit. Short and direct.",
        order: 4,
        isRequired: true,
        isAIGenerated: true,
        isAIRefinement: false,
        visualStyle: "MODERN",
        layoutType: "FULL_WIDTH",
      },
    ],
  },
  // ── Showcase template — one section per style/mode combination ──────────────
  {
    name: "Config Showcase",
    description: "Demo template — every section uses a different visual style, layout, and AI mode. Use this to preview how configs render.",
    isDefault: false,
    sections: [
      // ① HERO + CENTERED + Static — largest text, centered
      {
        type: "COVER",
        title: "Cover — HERO · Centered · Static",
        templateText: "{{lead.company}} — AI Automation Proposal\nPrepared for: {{lead.name}}\nDate: {{proposal.date}}\n\nOutpero × {{lead.company}}",
        order: 1,
        isRequired: true,
        isAIGenerated: false,
        isAIRefinement: false,
        visualStyle: "HERO" as VisualStyle,
        layoutType: "CENTERED" as LayoutType,
      },
      // ② HIGHLIGHT + FULL_WIDTH + AI Refine — accent border strip, AI personalizes the draft
      {
        type: "PROBLEM_STATEMENT",
        title: "The Problem — HIGHLIGHT · Full Width · AI Refine",
        templateText: "{{lead.company}} is dealing with manual, repetitive processes that eat into the team's time and create avoidable errors. The real cost isn't just the hours lost — it's the decisions that get delayed and the growth that gets blocked.\n\nThis is exactly the kind of problem that a well-designed automation solves permanently.",
        aiInstructions: "Refine this using the lead's actual problem, industry, and current tools. Make it feel like we diagnosed their specific situation. Keep two paragraphs, same structure.",
        order: 2,
        isRequired: true,
        isAIGenerated: false,
        isAIRefinement: true,
        visualStyle: "HIGHLIGHT" as VisualStyle,
        layoutType: "FULL_WIDTH" as LayoutType,
      },
      // ③ CLEAN + FULL_WIDTH + AI Generate — plain white, AI writes from scratch
      {
        type: "EXECUTIVE_SUMMARY",
        title: "Executive Summary — CLEAN · Full Width · AI Generate",
        templateText: "",
        aiInstructions: "2 paragraphs max. Open with the lead's company and the one sentence version of their problem. Close with the specific outcome we're delivering. No filler, no generic openers.",
        order: 3,
        isRequired: true,
        isAIGenerated: true,
        isAIRefinement: false,
        visualStyle: "CLEAN" as VisualStyle,
        layoutType: "FULL_WIDTH" as LayoutType,
      },
      // ④ MODERN + FULL_WIDTH + AI Refine — card background, AI refines bullet list
      {
        type: "SCOPE_OF_WORK",
        title: "Scope of Work — MODERN · Full Width · AI Refine",
        templateText: "This engagement includes:\n\n- Process audit and requirements mapping\n- Custom automation design and build\n- Integration with existing tools\n- QA testing and validation\n- Team onboarding and documentation\n- 30-day post-launch support",
        aiInstructions: "Make the deliverables specific to this lead's service interest and current tools. Replace generic items with concrete ones. Keep bullet format, 4-6 items, action verbs.",
        order: 4,
        isRequired: true,
        isAIGenerated: false,
        isAIRefinement: true,
        visualStyle: "MODERN" as VisualStyle,
        layoutType: "FULL_WIDTH" as LayoutType,
      },
      // ⑤ CLEAN + CARD + Static — pricing inside a bordered card
      {
        type: "PRICING",
        title: "Investment — CLEAN · Card · Static",
        templateText: "",
        order: 5,
        isRequired: true,
        isAIGenerated: false,
        isAIRefinement: false,
        visualStyle: "CLEAN" as VisualStyle,
        layoutType: "CARD" as LayoutType,
        metadata: { lineItems: [], grandTotal: 0 },
      },
      // ⑥ CLEAN + FULL_WIDTH + Static — timeline structured editor
      {
        type: "TIMELINE",
        title: "Timeline — CLEAN · Full Width · Static",
        templateText: "",
        order: 6,
        isRequired: false,
        isAIGenerated: false,
        isAIRefinement: false,
        visualStyle: "CLEAN" as VisualStyle,
        layoutType: "FULL_WIDTH" as LayoutType,
        metadata: { phases: [] },
      },
      // ⑦ MINIMAL + FULL_WIDTH + Static — muted/understated, standard text
      {
        type: "ABOUT_US",
        title: "About Us — MINIMAL · Full Width · Static",
        templateText: "Outpero is a small AI automation agency. We work with businesses that want to eliminate manual work and build systems that scale. We keep projects focused, move fast, and stay close through launch.",
        order: 7,
        isRequired: false,
        isAIGenerated: false,
        isAIRefinement: false,
        visualStyle: "MINIMAL" as VisualStyle,
        layoutType: "FULL_WIDTH" as LayoutType,
      },
      // ⑧ MODERN + CENTERED + AI Generate — card style, centered, AI-written
      {
        type: "NEXT_STEPS",
        title: "Next Steps — MODERN · Centered · AI Generate",
        templateText: "",
        aiInstructions: "3-4 bullet points: review → approve → kick-off call → deposit. Short sentences. End with one line inviting questions.",
        order: 8,
        isRequired: true,
        isAIGenerated: true,
        isAIRefinement: false,
        visualStyle: "MODERN" as VisualStyle,
        layoutType: "CENTERED" as LayoutType,
      },
      // ⑨ MINIMAL + CENTERED + Static — footer-style terms
      {
        type: "TERMS",
        title: "Terms — MINIMAL · Centered · Static",
        templateText: "Valid for 14 days from {{proposal.date}}. 50% deposit to begin. Remainder due on completion. All deliverables transfer to client upon full payment.",
        order: 9,
        isRequired: false,
        isAIGenerated: false,
        isAIRefinement: false,
        visualStyle: "MINIMAL" as VisualStyle,
        layoutType: "CENTERED" as LayoutType,
      },
    ],
  },

  {
    name: "Discovery Proposal",
    description: "Early-stage proposal focused on the problem and solution. No pricing or timeline.",
    isDefault: false,
    sections: [
      {
        type: "COVER",
        title: "Cover",
        templateText: "{{lead.company}} — Discovery Overview\nPrepared for: {{lead.name}}\nDate: {{proposal.date}}",
        order: 1,
        isRequired: true,
        isAIGenerated: false,
        isAIRefinement: false,
        visualStyle: "HERO",
        layoutType: "CENTERED",
      },
      {
        type: "PROBLEM_STATEMENT",
        title: "What We Heard",
        templateText: "{{lead.company}} is facing challenges that slow the team down and limit growth. Based on our conversations, the core issue is a combination of manual processes and disconnected systems.\n\nThis is a common challenge in the {{lead.industry}} space, and it's exactly the kind of problem that automation can solve well.",
        aiInstructions: "Refine this to reflect what we know about this specific lead's problem. Reference their industry and current tools if known. Sound like we've genuinely listened. Keep two paragraphs.",
        order: 2,
        isRequired: true,
        isAIGenerated: false,
        isAIRefinement: true,
        visualStyle: "HIGHLIGHT",
        layoutType: "FULL_WIDTH",
      },
      {
        type: "PROPOSED_SOLUTION",
        title: "How We Can Help",
        templateText: "",
        aiInstructions: "1-2 paragraphs describing our high-level approach. Focus on the outcome, not the process. Tie it directly to their specific problem. Avoid overpromising — this is a discovery proposal.",
        order: 3,
        isRequired: true,
        isAIGenerated: true,
        isAIRefinement: false,
        visualStyle: "CLEAN",
        layoutType: "FULL_WIDTH",
      },
      {
        type: "NEXT_STEPS",
        title: "Next Steps",
        templateText: "",
        aiInstructions: "3-4 steps covering: review this overview → schedule a discovery call → define scope → proposal. Keep it light — this is a discovery document, not a close.",
        order: 4,
        isRequired: true,
        isAIGenerated: true,
        isAIRefinement: false,
        visualStyle: "MODERN",
        layoutType: "FULL_WIDTH",
      },
    ],
  },
]

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  for (const template of followUpTemplates) {
    await prisma.followUpTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: template,
    })
  }
  console.log(`✓ Seeded ${followUpTemplates.length} follow-up templates`)

  for (const { sections, ...templateData } of proposalTemplates) {
    const template = await prisma.proposalTemplate.upsert({
      where: { name: templateData.name },
      update: { description: templateData.description, isDefault: templateData.isDefault },
      create: templateData,
    })

    await prisma.proposalTemplateSection.deleteMany({ where: { templateId: template.id } })
    await prisma.proposalTemplateSection.createMany({
      data: sections.map((s) => ({
        templateId: template.id,
        type: s.type,
        title: s.title,
        templateText: s.templateText,
        aiInstructions: s.aiInstructions ?? null,
        order: s.order,
        isRequired: s.isRequired,
        isAIGenerated: s.isAIGenerated,
        isAIRefinement: s.isAIRefinement,
        visualStyle: s.visualStyle,
        layoutType: s.layoutType,
        metadata: s.metadata !== undefined ? s.metadata : Prisma.JsonNull,
      })),
    })
    console.log(`✓ Seeded proposal template: ${templateData.name} (${sections.length} sections)`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
