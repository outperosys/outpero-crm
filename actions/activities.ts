"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { activitySchema } from "@/lib/validations/activity"
import type { ActionResult } from "@/types"
import type { Activity } from "@prisma/client"

export async function getActivities(leadId: string): Promise<Activity[]> {
  await requireAuth()
  return prisma.activity.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
  })
}

export async function createActivity(
  leadId: string,
  data: { type: string; description: string; createdBy?: string }
): Promise<ActionResult<Activity>> {
  await requireAuth()

  const parsed = activitySchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const activity = await prisma.activity.create({
    data: { leadId, ...parsed.data },
  })

  revalidatePath(`/leads/${leadId}`)
  return { success: true, data: activity }
}

export async function deleteActivity(
  id: string,
  leadId: string
): Promise<ActionResult> {
  await requireAuth()
  await prisma.activity.delete({ where: { id } })
  revalidatePath(`/leads/${leadId}`)
  return { success: true, data: undefined }
}
