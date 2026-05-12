"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { leadSchema, type LeadFormValues } from "@/lib/validations/lead"
import type { ActionResult } from "@/types"
import type { Lead } from "@prisma/client"

async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function getLeads(): Promise<Lead[]> {
  await requireAuth()
  return prisma.lead.findMany({ orderBy: { createdAt: "desc" } })
}

export async function getLead(id: string): Promise<Lead | null> {
  await requireAuth()
  return prisma.lead.findUnique({ where: { id } })
}

export async function createLead(
  data: LeadFormValues
): Promise<ActionResult<Lead>> {
  await requireAuth()

  const parsed = leadSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { lastContacted, nextFollowUp, ...rest } = parsed.data

  const lead = await prisma.lead.create({
    data: {
      ...rest,
      lastContacted: lastContacted ? new Date(lastContacted) : null,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
    },
  })

  revalidatePath("/leads")
  return { success: true, data: lead }
}

export async function updateLead(
  id: string,
  data: LeadFormValues
): Promise<ActionResult<Lead>> {
  await requireAuth()

  const parsed = leadSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { lastContacted, nextFollowUp, ...rest } = parsed.data

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...rest,
      lastContacted: lastContacted ? new Date(lastContacted) : null,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
    },
  })

  revalidatePath("/leads")
  revalidatePath(`/leads/${id}`)
  return { success: true, data: lead }
}

export async function deleteLead(id: string): Promise<ActionResult> {
  await requireAuth()
  await prisma.lead.delete({ where: { id } })
  revalidatePath("/leads")
  return { success: true, data: undefined }
}
