"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { taskSchema } from "@/lib/validations/task"
import type { ActionResult } from "@/types"
import type { Task } from "@prisma/client"

async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function getTasks(leadId: string): Promise<Task[]> {
  await requireAuth()
  return prisma.task.findMany({
    where: { leadId },
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
  })
}

export async function createTask(
  leadId: string,
  data: { title: string; dueDate?: string; assignedTo?: string }
): Promise<ActionResult<Task>> {
  await requireAuth()

  const parsed = taskSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const task = await prisma.task.create({
    data: {
      leadId,
      title: parsed.data.title,
      assignedTo: parsed.data.assignedTo || null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  })

  revalidatePath(`/leads/${leadId}`)
  return { success: true, data: task }
}

export async function toggleTask(
  id: string,
  leadId: string,
  completed: boolean
): Promise<ActionResult<Task>> {
  await requireAuth()

  const task = await prisma.task.update({
    where: { id },
    data: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  })

  revalidatePath(`/leads/${leadId}`)
  return { success: true, data: task }
}

export async function deleteTask(
  id: string,
  leadId: string
): Promise<ActionResult> {
  await requireAuth()
  await prisma.task.delete({ where: { id } })
  revalidatePath(`/leads/${leadId}`)
  return { success: true, data: undefined }
}
