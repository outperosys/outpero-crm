"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { tagSchema, type TagValues } from "@/lib/validations/tag"
import type { ActionResult } from "@/types"
import type { Tag } from "@prisma/client"

export async function getTags(): Promise<Tag[]> {
  await requireAuth()
  return prisma.tag.findMany({ orderBy: { name: "asc" } })
}

export async function createTag(data: TagValues): Promise<ActionResult<Tag>> {
  await requireAuth()

  const parsed = tagSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    const tag = await prisma.tag.create({ data: parsed.data })
    revalidatePath("/settings")
    revalidatePath("/leads")
    revalidatePath("/pipeline")
    return { success: true, data: tag }
  } catch (e: unknown) {
    const msg = e instanceof Error && e.message.includes("Unique constraint")
      ? "A tag with this name already exists"
      : "Failed to create tag"
    return { success: false, error: msg }
  }
}

export async function updateTag(id: string, data: TagValues): Promise<ActionResult<Tag>> {
  await requireAuth()

  const parsed = tagSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    const tag = await prisma.tag.update({ where: { id }, data: parsed.data })
    revalidatePath("/settings")
    revalidatePath("/leads")
    revalidatePath("/pipeline")
    return { success: true, data: tag }
  } catch (e: unknown) {
    const msg = e instanceof Error && e.message.includes("Unique constraint")
      ? "A tag with this name already exists"
      : "Failed to update tag"
    return { success: false, error: msg }
  }
}

export async function deleteTag(id: string): Promise<ActionResult> {
  await requireAuth()
  await prisma.tag.delete({ where: { id } })
  revalidatePath("/settings")
  revalidatePath("/leads")
  revalidatePath("/pipeline")
  return { success: true, data: undefined }
}

export async function toggleLeadTag(
  leadId: string,
  tagId: string
): Promise<ActionResult<{ added: boolean }>> {
  await requireAuth()

  const existing = await prisma.leadTag.findUnique({
    where: { leadId_tagId: { leadId, tagId } },
  })

  if (existing) {
    await prisma.leadTag.delete({ where: { leadId_tagId: { leadId, tagId } } })
  } else {
    await prisma.leadTag.create({ data: { leadId, tagId } })
  }

  revalidatePath("/leads")
  revalidatePath(`/leads/${leadId}`)
  revalidatePath("/pipeline")
  return { success: true, data: { added: !existing } }
}
