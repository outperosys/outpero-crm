"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { openai, AI_MODEL } from "@/lib/ai/openai"
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
import type { ActionResult } from "@/types"
import type { FollowUpGenerationOptions, FollowUpVariation } from "@/lib/ai/types"
import type { ProposalSectionType } from "@prisma/client"

async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

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

  // Fetch lead context + recent activities in parallel
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

  if (!lead) {
    return { success: false, error: "Lead not found" }
  }

  const systemPrompt = buildFollowUpSystemPrompt()
  const userPrompt = buildFollowUpUserPrompt(lead, activities, options)

  try {
    const completion = await openai.chat.completions.create({
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
    if (!content) {
      return { success: false, error: "No response received from AI" }
    }

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
}

/**
 * Generates a full structured proposal from a lead + template.
 * Flow:
 *   1. Fetch all context in parallel (lead, notes, activities, follow-ups, template)
 *   2. Create Proposal record (DRAFT)
 *   3. For non-AI sections: resolve placeholders → content ready
 *   4. For AI sections: build prompt → call OpenAI (all in Promise.all)
 *   5. Persist all ProposalSection records
 *   6. Return proposal ID
 *
 * Failure strategy:
 *   - Per-section AI failure: stores a fallback message, proposal still created
 *   - Fatal failure (no lead/template, DB error): returns error, cleans up proposal
 */
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
  const [lead, notes, activities, followUps, template] = await Promise.all([
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
      },
    }),
    prisma.note.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { content: true },
    }),
    prisma.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
      take: 5,
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
  ])

  if (!lead) return { success: false, error: "Lead not found" }
  if (!template) return { success: false, error: "Template not found" }

  // ── 2. Build shared context objects ───────────────────────────────────────
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
    // agency context: will be injected from BusinessSettings when built
  }

  const noteStrings = notes.map((n) => n.content)
  const activityStrings = activities.map(
    (a) => `[${a.type.replace("_", " ")}] ${a.description}`
  )
  const followUpTitles = followUps.map((f) => f.title)

  const systemPrompt = buildProposalSystemPrompt(/* business */ undefined)

  const proposalTitle = lead.companyName
    ? `${lead.companyName} — ${template.name}`
    : `${lead.name} — ${template.name}`

  // ── 3. Create the Proposal record (DRAFT) ─────────────────────────────────
  let proposal: { id: string }
  try {
    proposal = await prisma.proposal.create({
      data: {
        leadId,
        templateId,
        title: proposalTitle,
        status: "DRAFT",
      },
      select: { id: true },
    })
  } catch {
    return { success: false, error: "Failed to create proposal record" }
  }

  // ── 4. Resolve / generate each section (three modes) ─────────────────────
  type SectionPayload = {
    proposalId: string
    type: ProposalSectionType
    title: string
    content: string
    order: number
    isAIGenerated: boolean
    isVisible: boolean
    visualStyle: string
    layoutType: string
  }

  const leadCtx = {
    name: lead.name,
    company: lead.companyName,
    industry: lead.industry,
    serviceInterested: lead.serviceInterested,
    currentProblem: lead.currentProblem,
    currentTools: lead.currentTools,
    teamSize: lead.teamSize,
  }

  const refinementSystemPrompt = buildProposalRefinementSystemPrompt()

  const sectionPromises = template.sections.map(async (templateSection) => {
    let content: string

    if (!templateSection.isAIGenerated && !templateSection.isAIRefinement) {
      // Mode C — placeholder resolution only, no AI
      content = resolvePlaceholders(templateSection.templateText, placeholderCtx)
    } else if (templateSection.isAIRefinement) {
      // Mode B — AI refines templateText using lead context
      try {
        const userPrompt = buildProposalRefinementPrompt(
          templateSection.templateText,
          leadCtx,
          noteStrings,
          activityStrings,
          templateSection.aiInstructions ?? undefined
        )
        const completion = await openai.chat.completions.create({
          model: AI_MODEL,
          messages: [
            { role: "system", content: refinementSystemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.6,
          max_tokens: 600,
        })
        content =
          completion.choices[0]?.message?.content?.trim() ??
          templateSection.templateText
      } catch {
        content = templateSection.templateText // fallback: use original draft
      }
    } else {
      // Mode A — AI writes section from scratch
      try {
        const userPrompt = buildProposalSectionPrompt(
          templateSection.type,
          leadCtx,
          noteStrings,
          activityStrings,
          followUpTitles,
          options.customInstructions,
          templateSection.aiInstructions ?? undefined
        )
        const completion = await openai.chat.completions.create({
          model: AI_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 600,
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

  // All AI sections run in parallel — non-AI sections resolve immediately
  let sections: SectionPayload[]
  try {
    sections = await Promise.all(sectionPromises)
  } catch {
    // Fatal parallel failure — clean up the proposal record
    await prisma.proposal.delete({ where: { id: proposal.id } }).catch(() => null)
    return { success: false, error: "Proposal generation failed. Please try again." }
  }

  // ── 5. Persist all sections ────────────────────────────────────────────────
  try {
    await prisma.proposalSection.createMany({ data: sections })
  } catch {
    await prisma.proposal.delete({ where: { id: proposal.id } }).catch(() => null)
    return { success: false, error: "Failed to save proposal sections. Please try again." }
  }

  revalidatePath("/proposals")
  revalidatePath(`/leads/${leadId}`)

  return { success: true, data: proposal.id }
}
