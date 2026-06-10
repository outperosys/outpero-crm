"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { noteSchema } from "@/lib/validations/note"
import type { ActionResult } from "@/types"
import type { Note } from "@prisma/client"

export async function getNotes(leadId: string): Promise<Note[]> {
  await requireAuth()
  return prisma.note.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
  })
}

export async function createNote(
  leadId: string,
  data: { content: string; createdBy?: string }
): Promise<ActionResult<Note>> {
  await requireAuth()

  const parsed = noteSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const note = await prisma.note.create({
    data: { leadId, ...parsed.data },
  })

  revalidatePath(`/leads/${leadId}`)
  return { success: true, data: note }
}

export async function updateNote(
  id: string,
  leadId: string,
  content: string
): Promise<ActionResult<Note>> {
  await requireAuth()

  if (!content.trim()) {
    return { success: false, error: "Note cannot be empty" }
  }

  const note = await prisma.note.update({
    where: { id },
    data: { content },
  })

  revalidatePath(`/leads/${leadId}`)
  return { success: true, data: note }
}

export async function deleteNote(
  id: string,
  leadId: string
): Promise<ActionResult> {
  await requireAuth()
  await prisma.note.delete({ where: { id } })
  revalidatePath(`/leads/${leadId}`)
  return { success: true, data: undefined }
}
