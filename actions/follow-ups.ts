"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { followUpSchema, type FollowUpFormValues } from "@/lib/validations/follow-up"
import type { ActionResult } from "@/types"
import type { FollowUp, FollowUpTemplate, Lead } from "@prisma/client"

export type FollowUpWithLead = FollowUp & {
  lead: Pick<Lead, "id" | "name" | "companyName" | "priority" | "pipelineStage" | "lastContacted">
  template: FollowUpTemplate | null
}

async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function getFollowUps(): Promise<FollowUpWithLead[]> {
  await requireAuth()
  return prisma.followUp.findMany({
    include: {
      lead: {
        select: {
          id: true,
          name: true,
          companyName: true,
          priority: true,
          pipelineStage: true,
          lastContacted: true,
        },
      },
      template: true,
    },
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
  })
}

export async function getLeadFollowUps(leadId: string): Promise<FollowUp[]> {
  await requireAuth()
  return prisma.followUp.findMany({
    where: { leadId },
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
  })
}

export async function createFollowUp(
  data: FollowUpFormValues
): Promise<ActionResult<FollowUp>> {
  await requireAuth()

  const parsed = followUpSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { leadId, title, notes, dueDate, assignedTo, templateId } = parsed.data

  const followUp = await prisma.followUp.create({
    data: {
      leadId,
      title,
      notes: notes || null,
      dueDate: new Date(dueDate),
      assignedTo: assignedTo || null,
      templateId: templateId || null,
    },
  })

  await prisma.activity.create({
    data: {
      leadId,
      type: "FOLLOW_UP",
      description: `Follow-up scheduled: ${title}${assignedTo ? ` → ${assignedTo}` : ""}`,
    },
  })

  await syncLeadNextFollowUp(leadId)

  revalidatePath("/follow-ups")
  revalidatePath(`/leads/${leadId}`)
  return { success: true, data: followUp }
}

export interface NextFollowUpData {
  dueDate: string
  title?: string
  notes?: string
  assignedTo?: string
}

export async function completeFollowUp(
  id: string,
  next?: NextFollowUpData
): Promise<ActionResult> {
  await requireAuth()

  const followUp = await prisma.followUp.findUnique({ where: { id } })
  if (!followUp) return { success: false, error: "Follow-up not found" }

  const now = new Date()

  await prisma.$transaction(async (tx) => {
    await tx.followUp.update({
      where: { id },
      data: { completed: true, completedAt: now },
    })

    await tx.activity.create({
      data: {
        leadId: followUp.leadId,
        type: "FOLLOW_UP",
        description: `Completed: ${followUp.title}`,
      },
    })

    await tx.lead.update({
      where: { id: followUp.leadId },
      data: { lastContacted: now },
    })

    if (next?.dueDate) {
      await tx.followUp.create({
        data: {
          leadId: followUp.leadId,
          title: next.title?.trim() || followUp.title,
          notes: next.notes?.trim() || null,
          dueDate: new Date(next.dueDate),
          assignedTo: next.assignedTo?.trim() || followUp.assignedTo,
        },
      })
    }
  })

  await syncLeadNextFollowUp(followUp.leadId)

  revalidatePath("/follow-ups")
  revalidatePath(`/leads/${followUp.leadId}`)
  return { success: true, data: undefined }
}

export async function deleteFollowUp(id: string): Promise<ActionResult> {
  await requireAuth()

  const followUp = await prisma.followUp.findUnique({
    where: { id },
    select: { leadId: true },
  })
  if (!followUp) return { success: false, error: "Not found" }

  await prisma.followUp.delete({ where: { id } })
  await syncLeadNextFollowUp(followUp.leadId)

  revalidatePath("/follow-ups")
  revalidatePath(`/leads/${followUp.leadId}`)
  return { success: true, data: undefined }
}

export async function getTemplates(): Promise<FollowUpTemplate[]> {
  await requireAuth()
  return prisma.followUpTemplate.findMany({ orderBy: { name: "asc" } })
}

async function syncLeadNextFollowUp(leadId: string) {
  const earliest = await prisma.followUp.findFirst({
    where: { leadId, completed: false },
    orderBy: { dueDate: "asc" },
    select: { dueDate: true },
  })
  await prisma.lead.update({
    where: { id: leadId },
    data: { nextFollowUp: earliest?.dueDate ?? null },
  })
}
