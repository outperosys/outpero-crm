"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { processTranscript } from "@/lib/ai/context"
import { meetingSchema, type MeetingFormValues } from "@/lib/validations/meeting"
import type { ActionResult } from "@/types"
import type { Meeting, MeetingStatus, Lead } from "@prisma/client"

export type MeetingWithLead = Meeting & {
  lead: Pick<Lead, "id" | "name" | "companyName">
  transcript: { id: string } | null
}

const meetingInclude = {
  lead: { select: { id: true, name: true, companyName: true } },
  transcript: { select: { id: true } },
} as const

export async function getMeetings(): Promise<MeetingWithLead[]> {
  await requireAuth()
  return prisma.meeting.findMany({
    include: meetingInclude,
    orderBy: { scheduledAt: "asc" },
  })
}

export async function getLeadMeetings(leadId: string): Promise<MeetingWithLead[]> {
  await requireAuth()
  return prisma.meeting.findMany({
    where: { leadId },
    include: meetingInclude,
    orderBy: { scheduledAt: "desc" },
  })
}

export async function createMeeting(data: MeetingFormValues): Promise<ActionResult<Meeting>> {
  await requireAuth()

  const parsed = meetingSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const v = parsed.data
  const meeting = await prisma.meeting.create({
    data: {
      leadId: v.leadId,
      title: v.title,
      type: v.type,
      scheduledAt: new Date(v.scheduledAt),
      durationMinutes: v.durationMinutes ? parseInt(v.durationMinutes, 10) : null,
      meetingLink: v.meetingLink || null,
      location: v.location || null,
      notes: v.notes || null,
      assignedTo: v.assignedTo || null,
    },
  })

  await prisma.activity.create({
    data: {
      leadId: v.leadId,
      type: "MEETING",
      description: `Meeting scheduled: ${v.title}`,
    },
  })

  revalidatePath("/meetings")
  revalidatePath(`/leads/${v.leadId}`)
  revalidatePath("/dashboard")
  return { success: true, data: meeting }
}

export async function updateMeeting(id: string, data: MeetingFormValues): Promise<ActionResult<Meeting>> {
  await requireAuth()

  const parsed = meetingSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const existing = await prisma.meeting.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Meeting not found" }

  const v = parsed.data
  const meeting = await prisma.meeting.update({
    where: { id },
    data: {
      leadId: v.leadId,
      title: v.title,
      type: v.type,
      scheduledAt: new Date(v.scheduledAt),
      durationMinutes: v.durationMinutes ? parseInt(v.durationMinutes, 10) : null,
      meetingLink: v.meetingLink || null,
      location: v.location || null,
      notes: v.notes || null,
      assignedTo: v.assignedTo || null,
    },
  })

  revalidatePath("/meetings")
  revalidatePath(`/leads/${v.leadId}`)
  if (existing.leadId !== v.leadId) revalidatePath(`/leads/${existing.leadId}`)
  revalidatePath("/dashboard")
  return { success: true, data: meeting }
}

export async function updateMeetingStatus(id: string, status: MeetingStatus): Promise<ActionResult<Meeting>> {
  await requireAuth()

  const existing = await prisma.meeting.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Meeting not found" }

  const now = new Date()
  const meeting = await prisma.$transaction(async (tx) => {
    const updated = await tx.meeting.update({
      where: { id },
      data: {
        status,
        completedAt: status === "COMPLETED" ? now : null,
      },
    })

    if (status === "COMPLETED") {
      await tx.activity.create({
        data: {
          leadId: existing.leadId,
          type: "MEETING",
          description: `Meeting completed: ${existing.title}`,
        },
      })
      await tx.lead.update({
        where: { id: existing.leadId },
        data: { lastContacted: now },
      })
    }

    return updated
  })

  revalidatePath("/meetings")
  revalidatePath(`/leads/${existing.leadId}`)
  revalidatePath("/dashboard")
  return { success: true, data: meeting }
}

export async function deleteMeeting(id: string): Promise<ActionResult> {
  await requireAuth()

  const existing = await prisma.meeting.findUnique({ where: { id }, select: { leadId: true } })
  if (!existing) return { success: false, error: "Meeting not found" }

  await prisma.meeting.delete({ where: { id } })

  revalidatePath("/meetings")
  revalidatePath(`/leads/${existing.leadId}`)
  revalidatePath("/dashboard")
  return { success: true, data: undefined }
}

export async function addMeetingTranscript(meetingId: string, rawText: string): Promise<ActionResult> {
  await requireAuth()

  if (!rawText.trim()) {
    return { success: false, error: "Transcript text is required" }
  }

  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } })
  if (!meeting) return { success: false, error: "Meeting not found" }

  let insights
  try {
    insights = await processTranscript(rawText)
  } catch {
    return { success: false, error: "Failed to process transcript" }
  }

  await prisma.meetingTranscript.upsert({
    where: { meetingId },
    create: {
      leadId: meeting.leadId,
      meetingId,
      rawText: rawText.slice(0, 8000),
      insights: insights as object,
      source: "MANUAL",
    },
    update: {
      rawText: rawText.slice(0, 8000),
      insights: insights as object,
      processedAt: new Date(),
    },
  })

  revalidatePath("/meetings")
  revalidatePath(`/leads/${meeting.leadId}`)
  return { success: true, data: undefined }
}
