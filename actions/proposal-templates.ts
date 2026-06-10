"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import {
  proposalTemplateSchema,
  proposalTemplateSectionSchema,
  type ProposalTemplateFormValues,
  type ProposalTemplateSectionFormValues,
} from "@/lib/validations/proposal-template"
import type { ActionResult } from "@/types"
import type { ProposalTemplate, ProposalTemplateSection } from "@prisma/client"

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ProposalTemplateWithSections = ProposalTemplate & {
  sections: ProposalTemplateSection[]
  _count: { proposals: number }
}

// ─── Queries ───────────────────────────────────────────────────────────────────

export async function getProposalTemplates(): Promise<ProposalTemplateWithSections[]> {
  await requireAuth()
  return prisma.proposalTemplate.findMany({
    include: {
      sections: { orderBy: { order: "asc" } },
      _count: { select: { proposals: true } },
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  })
}

export async function getProposalTemplate(id: string): Promise<ProposalTemplateWithSections | null> {
  await requireAuth()
  return prisma.proposalTemplate.findUnique({
    where: { id },
    include: {
      sections: { orderBy: { order: "asc" } },
      _count: { select: { proposals: true } },
    },
  })
}

// ─── Template CRUD ─────────────────────────────────────────────────────────────

export async function createProposalTemplate(
  data: ProposalTemplateFormValues
): Promise<ActionResult<ProposalTemplate>> {
  await requireAuth()

  const parsed = proposalTemplateSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    const template = await prisma.proposalTemplate.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        isDefault: parsed.data.isDefault ?? false,
      },
    })
    revalidatePath("/templates")
    return { success: true, data: template }
  } catch {
    return { success: false, error: "A template with this name already exists." }
  }
}

export async function updateProposalTemplate(
  id: string,
  data: ProposalTemplateFormValues
): Promise<ActionResult<ProposalTemplate>> {
  await requireAuth()

  const parsed = proposalTemplateSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    const template = await prisma.proposalTemplate.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        isDefault: parsed.data.isDefault ?? false,
      },
    })
    revalidatePath("/templates")
    revalidatePath(`/templates/${id}`)
    return { success: true, data: template }
  } catch {
    return { success: false, error: "A template with this name already exists." }
  }
}

export async function deleteProposalTemplate(id: string): Promise<ActionResult> {
  await requireAuth()
  await prisma.proposalTemplate.delete({ where: { id } })
  revalidatePath("/templates")
  return { success: true, data: undefined }
}

// ─── Section CRUD ──────────────────────────────────────────────────────────────

export async function addProposalTemplateSection(
  templateId: string,
  data: ProposalTemplateSectionFormValues
): Promise<ActionResult<ProposalTemplateSection>> {
  await requireAuth()

  const parsed = proposalTemplateSectionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  // Place at the end
  const last = await prisma.proposalTemplateSection.findFirst({
    where: { templateId },
    orderBy: { order: "desc" },
    select: { order: true },
  })
  const nextOrder = (last?.order ?? 0) + 1

  const section = await prisma.proposalTemplateSection.create({
    data: {
      templateId,
      type: parsed.data.type,
      title: parsed.data.title,
      templateText: parsed.data.templateText ?? "",
      aiInstructions: parsed.data.aiInstructions ?? null,
      order: nextOrder,
      isRequired: parsed.data.isRequired ?? false,
      isAIGenerated: parsed.data.isAIGenerated ?? false,
      isAIRefinement: parsed.data.isAIRefinement ?? false,
      visualStyle: parsed.data.visualStyle ?? "CLEAN",
      layoutType: parsed.data.layoutType ?? "FULL_WIDTH",
    },
  })

  revalidatePath(`/templates/${templateId}`)
  return { success: true, data: section }
}

export async function updateProposalTemplateSection(
  id: string,
  templateId: string,
  data: Partial<ProposalTemplateSectionFormValues>
): Promise<ActionResult<ProposalTemplateSection>> {
  await requireAuth()

  const section = await prisma.proposalTemplateSection.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.templateText !== undefined && { templateText: data.templateText }),
      ...(data.aiInstructions !== undefined && { aiInstructions: data.aiInstructions }),
      ...(data.isRequired !== undefined && { isRequired: data.isRequired }),
      ...(data.isAIGenerated !== undefined && { isAIGenerated: data.isAIGenerated }),
      ...(data.isAIRefinement !== undefined && { isAIRefinement: data.isAIRefinement }),
      ...(data.visualStyle !== undefined && { visualStyle: data.visualStyle }),
      ...(data.layoutType !== undefined && { layoutType: data.layoutType }),
    },
  })

  revalidatePath(`/templates/${templateId}`)
  return { success: true, data: section }
}

export async function removeProposalTemplateSection(id: string, templateId: string): Promise<ActionResult> {
  await requireAuth()
  await prisma.proposalTemplateSection.delete({ where: { id } })
  revalidatePath(`/templates/${templateId}`)
  return { success: true, data: undefined }
}

// ─── Section Reorder ───────────────────────────────────────────────────────────

export async function reorderProposalTemplateSection(
  templateId: string,
  sectionId: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  await requireAuth()

  const sections = await prisma.proposalTemplateSection.findMany({
    where: { templateId },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  })

  const idx = sections.findIndex((s) => s.id === sectionId)
  if (idx === -1) return { success: false, error: "Section not found" }

  const swapIdx = direction === "up" ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= sections.length) return { success: true, data: undefined } // already at boundary

  const current = sections[idx]
  const swap = sections[swapIdx]

  await prisma.$transaction([
    prisma.proposalTemplateSection.update({ where: { id: current.id }, data: { order: swap.order } }),
    prisma.proposalTemplateSection.update({ where: { id: swap.id }, data: { order: current.order } }),
  ])

  revalidatePath(`/templates/${templateId}`)
  return { success: true, data: undefined }
}
