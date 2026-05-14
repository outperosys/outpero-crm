"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/types"
import type { Proposal, ProposalSection, ProposalStatus } from "@prisma/client"

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ProposalWithMeta = Proposal & {
  lead: { id: string; name: string; companyName: string | null }
  template: { id: string; name: string } | null
  _count: { sections: number }
}

export type ProposalWithSections = Proposal & {
  lead: { id: string; name: string; companyName: string | null }
  template: { id: string; name: string } | null
  sections: ProposalSection[]
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

// ─── Queries ───────────────────────────────────────────────────────────────────

export async function getProposals(): Promise<ProposalWithMeta[]> {
  await requireAuth()
  return prisma.proposal.findMany({
    include: {
      lead: { select: { id: true, name: true, companyName: true } },
      template: { select: { id: true, name: true } },
      _count: { select: { sections: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getProposal(id: string): Promise<ProposalWithSections | null> {
  await requireAuth()
  return prisma.proposal.findUnique({
    where: { id },
    include: {
      lead: { select: { id: true, name: true, companyName: true } },
      template: { select: { id: true, name: true } },
      sections: { where: { isVisible: true }, orderBy: { order: "asc" } },
    },
  })
}

/** Workspace view — fetches ALL sections including hidden ones */
export async function getProposalForWorkspace(id: string): Promise<ProposalWithSections | null> {
  await requireAuth()
  return prisma.proposal.findUnique({
    where: { id },
    include: {
      lead: { select: { id: true, name: true, companyName: true } },
      template: { select: { id: true, name: true } },
      sections: { orderBy: { order: "asc" } },
    },
  })
}

// ─── Title update ────────────────────────────────────────────────────────

export async function updateProposalTitle(
  id: string,
  title: string
): Promise<ActionResult<Proposal>> {
  await requireAuth()
  const proposal = await prisma.proposal.update({ where: { id }, data: { title: title.trim() } })
  revalidatePath(`/proposals/${id}`)
  revalidatePath("/proposals")
  return { success: true, data: proposal }
}

// ─── Status update ─────────────────────────────────────────────────────────────

export async function updateProposalStatus(
  id: string,
  status: ProposalStatus
): Promise<ActionResult<Proposal>> {
  await requireAuth()
  const proposal = await prisma.proposal.update({
    where: { id },
    data: {
      status,
      ...(status === "SENT" ? { sentAt: new Date() } : {}),
    },
  })
  revalidatePath("/proposals")
  revalidatePath(`/proposals/${id}`)
  return { success: true, data: proposal }
}

// ─── Section update ────────────────────────────────────────────────────────────

export async function updateProposalSection(
  id: string,
  proposalId: string,
  content: string
): Promise<ActionResult<ProposalSection>> {
  await requireAuth()
  const section = await prisma.proposalSection.update({
    where: { id },
    data: { content },
  })
  revalidatePath(`/proposals/${proposalId}`)
  return { success: true, data: section }
}

// ─── Section reorder ───────────────────────────────────────────────────────────

export async function reorderProposalSection(
  proposalId: string,
  sectionId: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  await requireAuth()

  const sections = await prisma.proposalSection.findMany({
    where: { proposalId, isVisible: true },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  })

  const idx = sections.findIndex((s) => s.id === sectionId)
  if (idx === -1) return { success: false, error: "Section not found" }

  const swapIdx = direction === "up" ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= sections.length) return { success: true, data: undefined }

  const current = sections[idx]
  const swap = sections[swapIdx]

  await prisma.$transaction([
    prisma.proposalSection.update({ where: { id: current.id }, data: { order: swap.order } }),
    prisma.proposalSection.update({ where: { id: swap.id }, data: { order: current.order } }),
  ])

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true, data: undefined }
}

// ─── Section visibility ────────────────────────────────────────────────────────

export async function toggleProposalSectionVisibility(
  id: string,
  proposalId: string
): Promise<ActionResult> {
  await requireAuth()
  const section = await prisma.proposalSection.findUnique({ where: { id }, select: { isVisible: true } })
  if (!section) return { success: false, error: "Section not found" }
  await prisma.proposalSection.update({ where: { id }, data: { isVisible: !section.isVisible } })
  revalidatePath(`/proposals/${proposalId}`)
  return { success: true, data: undefined }
}

// ─── Add custom section ──────────────────────────────────────────────────

export async function addProposalSection(
  proposalId: string,
  title: string,
  content: string
): Promise<ActionResult<ProposalSection>> {
  await requireAuth()
  const last = await prisma.proposalSection.findFirst({
    where: { proposalId },
    orderBy: { order: "desc" },
    select: { order: true },
  })
  const section = await prisma.proposalSection.create({
    data: {
      proposalId,
      type: "CUSTOM",
      title: title.trim() || "Custom Section",
      content,
      order: (last?.order ?? 0) + 1,
      isAIGenerated: false,
      isVisible: true,
    },
  })
  revalidatePath(`/proposals/${proposalId}`)
  return { success: true, data: section }
}

// ─── Lead proposals list ─────────────────────────────────────────────────

export async function getLeadProposals(leadId: string): Promise<ProposalWithMeta[]> {
  await requireAuth()
  return prisma.proposal.findMany({
    where: { leadId },
    include: {
      lead: { select: { id: true, name: true, companyName: true } },
      template: { select: { id: true, name: true } },
      _count: { select: { sections: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deleteProposal(id: string): Promise<ActionResult> {
  await requireAuth()
  await prisma.proposal.delete({ where: { id } })
  revalidatePath("/proposals")
  return { success: true, data: undefined }
}
