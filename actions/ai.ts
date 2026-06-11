"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getOpenAI, AI_MODEL } from "@/lib/ai/openai"
import {
  buildFollowUpSystemPrompt,
  buildFollowUpUserPrompt,
} from "@/lib/ai/prompts/follow-up"
import {
  buildProposalSystemPrompt,
  buildProposalRefinementSystemPrompt,
  buildProposalSectionPrompt,
  buildProposalRefinementPrompt,
} from "@/lib/ai/prompts/proposal"
import { resolvePlaceholders, formatProposalDate } from "@/lib/ai/placeholder"
import { buildLeadContext, processTranscript } from "@/lib/ai/context"
import type { ActionResult } from "@/types"
import type { FollowUpGenerationOptions, FollowUpVariation, BusinessContext } from "@/lib/ai/types"
import type { Prisma, ProposalSectionType } from "@prisma/client"

async function getBusinessContext(): Promise<BusinessContext | undefined> {
  try {
    const db = prisma as any // eslint-disable-line @typescript-eslint/no-explicit-any
    const s = await db.agencySettings.findUnique({ where: { id: "1" } })
    if (!s) return undefined
    return {
      agencyName:          s.businessName         ?? undefined,
      brandTone:           s.defaultTone          ?? s.toneOfVoice ?? undefined,
      proposalStyle:       s.defaultProposalStyle ?? undefined,
      customInstructions:  s.aiBrandVoice         ?? undefined,
    }
  } catch {
    return undefined
  }
}

// ─── Follow-up generation ──────────────────────────────────────────────────────

export async function generateFollowUpDrafts(
  leadId: string,
  options: FollowUpGenerationOptions
): Promise<ActionResult<FollowUpVariation[]>> {
  await requireAuth()

  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local",
    }
  }

  const [lead, activities] = await Promise.all([
    prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        name: true,
        companyName: true,
        serviceInterested: true,
        industry: true,
        pipelineStage: true,
        priority: true,
        urgency: true,
        currentProblem: true,
        notes: true,
        proposalSent: true,
        dealValue: true,
        lastContacted: true,
      },
    }),
    prisma.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { type: true, description: true, createdAt: true },
    }),
  ])

  if (!lead) return { success: false, error: "Lead not found" }

  const business = await getBusinessContext()
  const systemPrompt = buildFollowUpSystemPrompt(business)
  const userPrompt = buildFollowUpUserPrompt(lead, activities, options)

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.85,
      max_tokens: 2500,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) return { success: false, error: "No response received from AI" }

    const parsed = JSON.parse(content) as { variations?: unknown }
    const variations = parsed.variations

    if (!Array.isArray(variations) || variations.length === 0) {
      return { success: false, error: "Unexpected AI response format. Please try again." }
    }

    return { success: true, data: variations as FollowUpVariation[] }
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed"
    return { success: false, error: message }
  }
}

// ─── Proposal generation ───────────────────────────────────────────────────────

export interface ProposalGenerationOptions {
  customInstructions?: string
  transcriptText?: string   // raw text from a discovery call or meeting
}

export async function generateProposal(
  leadId: string,
  templateId: string,
  options: ProposalGenerationOptions = {}
): Promise<ActionResult<string>> {
  await requireAuth()

  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local" }
  }

  // ── 1. Fetch all context in parallel ──────────────────────────────────────
  const [lead, notes, activities, followUps, template, existingTranscripts] = await Promise.all([
    prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        name: true,
        companyName: true,
        industry: true,
        serviceInterested: true,
        currentProblem: true,
        currentTools: true,
        teamSize: true,
        source: true,
        urgency: true,
        priority: true,
        pipelineStage: true,
        dealValue: true,
      },
    }),
    prisma.note.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { content: true },
    }),
    prisma.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { type: true, description: true, createdAt: true },
    }),
    prisma.followUp.findMany({
      where: { leadId, completed: false },
      orderBy: { dueDate: "asc" },
      take: 5,
      select: { title: true },
    }),
    prisma.proposalTemplate.findUnique({
      where: { id: templateId },
      include: { sections: { orderBy: { order: "asc" } } },
    }),
    prisma.meetingTranscript.findMany({
      where: { leadId },
      orderBy: { processedAt: "desc" },
      take: 2,
      select: { insights: true },
    }),
  ])

  if (!lead) return { success: false, error: "Lead not found" }
  if (!template) return { success: false, error: "Template not found" }

  // ── 2. Process new transcript if provided ─────────────────────────────────
  let newTranscriptInsights = null
  if (options.transcriptText?.trim()) {
    try {
      newTranscriptInsights = await processTranscript(options.transcriptText)
      // Persist for future proposals on this lead
      await prisma.meetingTranscript.create({
        data: {
          leadId,
          rawText: options.transcriptText.slice(0, 8000),
          insights: newTranscriptInsights as object,
          source: "MANUAL",
        },
      })
    } catch {
      // Don't block proposal generation if transcript processing fails
      newTranscriptInsights = null
    }
  }

  // ── 3. Build centralized lead context ─────────────────────────────────────
  // Merge newly processed transcript with any existing transcripts from DB
  const allTranscriptInsights = [
    ...(newTranscriptInsights ? [newTranscriptInsights] : []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...existingTranscripts.map((t) => t.insights as any),
  ]

  const leadCtx = await buildLeadContext(
    lead,
    notes,
    activities,
    followUps,
    allTranscriptInsights.length > 0 ? allTranscriptInsights : undefined
  )

  // ── 4. Build placeholder context (for static sections) ────────────────────
  const proposalDate = formatProposalDate()
  const placeholderCtx = {
    lead: {
      name: lead.name,
      company: lead.companyName,
      service: lead.serviceInterested,
      problem: lead.currentProblem,
      industry: lead.industry,
      tools: lead.currentTools,
      teamSize: lead.teamSize,
    },
    proposal: { date: proposalDate },
  }

  // ── 5. Create the Proposal record (DRAFT) ─────────────────────────────────
  const business = await getBusinessContext()

  const proposalTitle = lead.companyName
    ? `${lead.companyName} — ${template.name}`
    : `${lead.name} — ${template.name}`

  let proposal: { id: string }
  try {
    proposal = await prisma.proposal.create({
      data: { leadId, templateId, title: proposalTitle, status: "DRAFT" },
      select: { id: true },
    })
  } catch {
    return { success: false, error: "Failed to create proposal record" }
  }

  // ── 6. Resolve / generate each section (three modes) ─────────────────────
  type SectionPayload = Prisma.ProposalSectionCreateManyInput

  const systemPrompt = buildProposalSystemPrompt(business)
  const refinementSystemPrompt = buildProposalRefinementSystemPrompt(business)

  // Token budgets matched to expected output length per section type.
  // Tighter limits force conciseness — the model fills structure, not space.
  const SECTION_MAX_TOKENS: Partial<Record<string, number>> = {
    COVER:             130,
    EXECUTIVE_SUMMARY: 260,
    PROBLEM_STATEMENT: 240,
    PROPOSED_SOLUTION: 270,
    SCOPE_OF_WORK:     320,
    TIMELINE:          300,
    NEXT_STEPS:        180,
    ABOUT_US:          200,
    TERMS:             220,
    CUSTOM:            280,
  }
  const DEFAULT_MAX_TOKENS = 260
  // Refinement prompts process more input so they get a small buffer
  const REFINEMENT_BUFFER = 80

  const sectionPromises = template.sections.map(async (templateSection) => {
    let content: string

    if (!templateSection.isAIGenerated && !templateSection.isAIRefinement) {
      // Mode C — placeholder resolution only, no AI call
      content = resolvePlaceholders(templateSection.templateText, placeholderCtx)
    } else if (templateSection.isAIRefinement) {
      // Mode B — AI refines templateText using full lead context
      try {
        const userPrompt = buildProposalRefinementPrompt(
          templateSection.templateText,
          leadCtx,
          templateSection.aiInstructions ?? undefined
        )
        const sectionTokens =
          (SECTION_MAX_TOKENS[templateSection.type] ?? DEFAULT_MAX_TOKENS) + REFINEMENT_BUFFER
        const completion = await getOpenAI().chat.completions.create({
          model: AI_MODEL,
          messages: [
            { role: "system", content: refinementSystemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.55,
          max_tokens: sectionTokens,
        })
        content =
          completion.choices[0]?.message?.content?.trim() ??
          templateSection.templateText
      } catch {
        content = templateSection.templateText
      }
    } else {
      // Mode A — AI writes section from scratch using full lead context
      try {
        const userPrompt = buildProposalSectionPrompt(
          templateSection.type,
          leadCtx,
          options.customInstructions,
          templateSection.aiInstructions ?? undefined
        )
        const sectionTokens = SECTION_MAX_TOKENS[templateSection.type] ?? DEFAULT_MAX_TOKENS
        const completion = await getOpenAI().chat.completions.create({
          model: AI_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.65,
          max_tokens: sectionTokens,
        })
        content =
          completion.choices[0]?.message?.content?.trim() ??
          "[Generation failed — click Edit to write this section manually.]"
      } catch {
        content = "[Generation failed — click Edit to write this section manually.]"
      }
    }

    return {
      proposalId: proposal.id,
      type: templateSection.type,
      title: templateSection.title,
      content,
      order: templateSection.order,
      isAIGenerated: templateSection.isAIGenerated || templateSection.isAIRefinement,
      isVisible: true,
      visualStyle: templateSection.visualStyle,
      layoutType: templateSection.layoutType,
    } satisfies SectionPayload
  })

  let sections: SectionPayload[]
  try {
    sections = await Promise.all(sectionPromises)
  } catch {
    await prisma.proposal.delete({ where: { id: proposal.id } }).catch(() => null)
    return { success: false, error: "Proposal generation failed. Please try again." }
  }

  // ── 7. Persist all sections ────────────────────────────────────────────────
  try {
    await prisma.proposalSection.createMany({ data: sections })
  } catch {
    await prisma.proposal.delete({ where: { id: proposal.id } }).catch(() => null)
    return { success: false, error: "Failed to save proposal sections. Please try again." }
  }

  await prisma.activity.create({
    data: {
      leadId,
      type: "PROPOSAL_SENT",
      description: `Proposal generated: ${proposalTitle}`,
      link: `/proposals/${proposal.id}`,
    },
  }).catch(() => null)

  revalidatePath("/proposals")
  revalidatePath(`/leads/${leadId}`)

  return { success: true, data: proposal.id }
}
