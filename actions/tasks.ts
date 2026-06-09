"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { taskSchema, taskCommentSchema } from "@/lib/validations/task"
import type { ActionResult } from "@/types"
import type { Task, TaskStatus, TaskPriority, TaskRelatedType } from "@prisma/client"

async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function getCurrentUserName(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  return profile?.name || profile?.email || user.email || null
}

const taskInclude = {
  lead: { select: { id: true, name: true, companyName: true } },
  invoice: { select: { id: true, invoiceNumber: true } },
  receipt: { select: { id: true, receiptNumber: true } },
  service: { select: { id: true, name: true } },
  _count: { select: { comments: true } },
} as const

export type TaskWithRelations = Task & {
  lead: { id: string; name: string; companyName: string | null } | null
  invoice: { id: string; invoiceNumber: string } | null
  receipt: { id: string; receiptNumber: string } | null
  service: { id: string; name: string } | null
  _count: { comments: number }
}

function relatedRevalidate(task: { relatedType: TaskRelatedType; leadId: string | null; invoiceId: string | null; receiptId: string | null }) {
  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  if (task.relatedType === "LEAD" && task.leadId) revalidatePath(`/leads/${task.leadId}`)
  if (task.relatedType === "INVOICE" && task.invoiceId) revalidatePath(`/financial/invoices/${task.invoiceId}`)
  if (task.relatedType === "RECEIPT" && task.receiptId) revalidatePath(`/financial/receipts/${task.receiptId}`)
}

// ─── Reads ──────────────────────────────────────────────────────────────────

export async function getTasks(): Promise<TaskWithRelations[]> {
  await requireAuth()
  return prisma.task.findMany({
    include: taskInclude,
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  })
}

export async function getTask(id: string): Promise<TaskWithRelations | null> {
  await requireAuth()
  return prisma.task.findUnique({ where: { id }, include: taskInclude })
}

export async function getLeadTasks(leadId: string): Promise<Task[]> {
  await requireAuth()
  return prisma.task.findMany({
    where: { leadId, relatedType: "LEAD" },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
  })
}

export async function getEntityTasks(
  relatedType: TaskRelatedType,
  relatedId: string
): Promise<Task[]> {
  await requireAuth()
  const idField =
    relatedType === "LEAD" ? "leadId"
    : relatedType === "INVOICE" ? "invoiceId"
    : relatedType === "RECEIPT" ? "receiptId"
    : relatedType === "SERVICE" ? "serviceId"
    : null

  if (!idField) return []

  return prisma.task.findMany({
    where: { relatedType, [idField]: relatedId },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
  })
}

export interface TaskCounts {
  dueToday: number
  overdue: number
  myOpen: number
}

export async function getTaskCounts(): Promise<TaskCounts> {
  await requireAuth()
  const userName = await getCurrentUserName()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  const [dueToday, overdue, myOpen] = await Promise.all([
    prisma.task.count({
      where: { status: { not: "DONE" }, dueDate: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.task.count({
      where: { status: { not: "DONE" }, dueDate: { lt: todayStart } },
    }),
    userName
      ? prisma.task.count({ where: { status: { not: "DONE" }, assignedTo: userName } })
      : Promise.resolve(0),
  ])

  return { dueToday, overdue, myOpen }
}

// ─── Comments ───────────────────────────────────────────────────────────────

export async function getTaskComments(taskId: string) {
  await requireAuth()
  return prisma.taskComment.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
  })
}

export async function addTaskComment(
  taskId: string,
  data: { content: string }
): Promise<ActionResult> {
  await requireAuth()
  const parsed = taskCommentSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const userName = await getCurrentUserName()
  await prisma.taskComment.create({
    data: { taskId, content: parsed.data.content, createdBy: userName || undefined },
  })

  revalidatePath("/tasks")
  return { success: true, data: undefined }
}

// ─── Create / Update / Delete ──────────────────────────────────────────────

interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  assignedTo?: string
  relatedType?: TaskRelatedType
  leadId?: string
  invoiceId?: string
  receiptId?: string
  serviceId?: string
}

export async function createTask(data: CreateTaskInput): Promise<ActionResult<Task>> {
  await requireAuth()

  const parsed = taskSchema.safeParse({
    title: data.title,
    description: data.description,
    status: data.status ?? "TODO",
    priority: data.priority ?? "MEDIUM",
    dueDate: data.dueDate,
    assignedTo: data.assignedTo,
    relatedType: data.relatedType ?? "GENERAL",
    leadId: data.leadId,
    invoiceId: data.invoiceId,
    receiptId: data.receiptId,
    serviceId: data.serviceId,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const userName = await getCurrentUserName()
  const v = parsed.data

  const task = await prisma.task.create({
    data: {
      title: v.title,
      description: v.description || null,
      status: v.status,
      priority: v.priority,
      dueDate: v.dueDate ? new Date(v.dueDate) : null,
      assignedTo: v.assignedTo || null,
      createdBy: userName || null,
      relatedType: v.relatedType,
      leadId: v.relatedType === "LEAD" ? v.leadId || null : null,
      invoiceId: v.relatedType === "INVOICE" ? v.invoiceId || null : null,
      receiptId: v.relatedType === "RECEIPT" ? v.receiptId || null : null,
      serviceId: v.relatedType === "SERVICE" ? v.serviceId || null : null,
      completedAt: v.status === "DONE" ? new Date() : null,
    },
  })

  relatedRevalidate(task)
  return { success: true, data: task }
}

interface UpdateTaskInput {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  assignedTo?: string
  relatedType: TaskRelatedType
  leadId?: string
  invoiceId?: string
  receiptId?: string
  serviceId?: string
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<ActionResult<Task>> {
  await requireAuth()

  const parsed = taskSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const existing = await prisma.task.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Task not found" }

  const v = parsed.data
  const wasNotDone = existing.status !== "DONE"
  const isNowDone = v.status === "DONE"

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: v.title,
      description: v.description || null,
      status: v.status,
      priority: v.priority,
      dueDate: v.dueDate ? new Date(v.dueDate) : null,
      assignedTo: v.assignedTo || null,
      relatedType: v.relatedType,
      leadId: v.relatedType === "LEAD" ? v.leadId || null : null,
      invoiceId: v.relatedType === "INVOICE" ? v.invoiceId || null : null,
      receiptId: v.relatedType === "RECEIPT" ? v.receiptId || null : null,
      serviceId: v.relatedType === "SERVICE" ? v.serviceId || null : null,
      completedAt: isNowDone ? (wasNotDone ? new Date() : existing.completedAt) : null,
    },
  })

  relatedRevalidate(task)
  relatedRevalidate(existing)
  return { success: true, data: task }
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<ActionResult<Task>> {
  await requireAuth()

  const existing = await prisma.task.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Task not found" }

  const task = await prisma.task.update({
    where: { id },
    data: {
      status,
      completedAt: status === "DONE" ? new Date() : null,
    },
  })

  relatedRevalidate(task)
  return { success: true, data: task }
}

export async function reassignTask(id: string, assignedTo: string): Promise<ActionResult<Task>> {
  await requireAuth()

  const task = await prisma.task.update({
    where: { id },
    data: { assignedTo: assignedTo || null },
  })

  relatedRevalidate(task)
  return { success: true, data: task }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  await requireAuth()

  const existing = await prisma.task.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Task not found" }

  await prisma.task.delete({ where: { id } })

  relatedRevalidate(existing)
  return { success: true, data: undefined }
}

// ─── Backward-compat helper for lead detail "Add Task" form ───────────────

export async function createLeadTask(
  leadId: string,
  data: { title: string; dueDate?: string; assignedTo?: string }
): Promise<ActionResult<Task>> {
  return createTask({ ...data, relatedType: "LEAD", leadId })
}
