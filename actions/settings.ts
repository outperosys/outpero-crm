"use server"

import { revalidatePath } from "next/cache"
import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import type { ActionResult } from "@/types"
import type { AgencySettings } from "@prisma/client"
import {
  businessSettingsSchema,
  brandingSettingsSchema,
  paymentSettingsSchema,
  aiSettingsSchema,
  servicePreferencesSchema,
  pipelineSettingsSchema,
  teamMemberSchema,
  type BusinessSettingsValues,
  type BrandingSettingsValues,
  type PaymentSettingsValues,
  type AISettingsValues,
  type ServicePreferencesValues,
  type PipelineSettingsValues,
  type TeamMemberValues,
  agencySettingsSchema,
  type AgencySettingsFormValues,
} from "@/lib/validations/settings"

// TeamMember type — mirrors schema until prisma generate runs
export type TeamMember = {
  id: string
  name: string
  role: string
  email: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const db = prisma as any // eslint-disable-line @typescript-eslint/no-explicit-any

// ─── Singleton getter ─────────────────────────────────────────────────────────

export async function getSettings(): Promise<AgencySettings> {
  await requireAuth()
  return db.agencySettings.upsert({
    where: { id: "1" },
    create: { id: "1" },
    update: {},
  })
}

// ─── Section updaters ─────────────────────────────────────────────────────────

export async function updateBusinessSettings(data: BusinessSettingsValues): Promise<ActionResult> {
  await requireAuth()
  const parsed = businessSettingsSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }
  try {
    await db.agencySettings.upsert({
      where: { id: "1" },
      create: { id: "1", ...parsed.data },
      update: parsed.data,
    })
    revalidatePath("/settings")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Failed to save business settings" }
  }
}

export async function updateBrandingSettings(data: BrandingSettingsValues): Promise<ActionResult> {
  await requireAuth()
  const parsed = brandingSettingsSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }
  try {
    await db.agencySettings.upsert({
      where: { id: "1" },
      create: { id: "1", ...parsed.data },
      update: parsed.data,
    })
    revalidatePath("/settings")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Failed to save branding settings" }
  }
}

export async function updatePaymentSettings(data: PaymentSettingsValues): Promise<ActionResult> {
  await requireAuth()
  const parsed = paymentSettingsSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }
  try {
    await db.agencySettings.upsert({
      where: { id: "1" },
      create: { id: "1", ...parsed.data },
      update: parsed.data,
    })
    revalidatePath("/settings")
    revalidatePath("/financial/invoices/new")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Failed to save payment settings" }
  }
}

export async function updateAISettings(data: AISettingsValues): Promise<ActionResult> {
  await requireAuth()
  const parsed = aiSettingsSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }
  try {
    await db.agencySettings.upsert({
      where: { id: "1" },
      create: { id: "1", ...parsed.data },
      update: parsed.data,
    })
    revalidatePath("/settings")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Failed to save AI settings" }
  }
}

export async function updateServicePreferences(data: ServicePreferencesValues): Promise<ActionResult> {
  await requireAuth()
  const parsed = servicePreferencesSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }
  try {
    const payload = {
      defaultServiceId:   parsed.data.defaultServiceId ?? null,
      featuredServiceIds: parsed.data.featuredServiceIds,
      serviceOrdering:    parsed.data.serviceOrdering ?? null,
    }
    await db.agencySettings.upsert({
      where: { id: "1" },
      create: { id: "1", ...payload },
      update: payload,
    })
    revalidatePath("/settings")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Failed to save service preferences" }
  }
}

export async function updatePipelineSettings(data: PipelineSettingsValues): Promise<ActionResult> {
  await requireAuth()
  const parsed = pipelineSettingsSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }
  try {
    const payload = {
      pipelineStageLabels: parsed.data.pipelineStageLabels,
      defaultWonStage:     parsed.data.defaultWonStage ?? "WON",
      defaultLostStage:    parsed.data.defaultLostStage ?? "LOST",
    }
    await db.agencySettings.upsert({
      where: { id: "1" },
      create: { id: "1", ...payload },
      update: payload,
    })
    revalidatePath("/settings")
    revalidatePath("/pipeline")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Failed to save pipeline settings" }
  }
}

// ─── Team CRUD ────────────────────────────────────────────────────────────────

export const getTeamMembers = cache(async (): Promise<TeamMember[]> => {
  await requireAuth()
  return db.teamMember.findMany({ orderBy: { createdAt: "asc" } })
})

export async function createTeamMember(data: TeamMemberValues): Promise<ActionResult<TeamMember>> {
  await requireAuth()
  const parsed = teamMemberSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }
  try {
    const member = await db.teamMember.create({ data: parsed.data })
    revalidatePath("/settings")
    return { success: true, data: member }
  } catch (e: unknown) {
    const msg = e instanceof Error && e.message.includes("Unique constraint")
      ? "A team member with this email already exists"
      : "Failed to add team member"
    return { success: false, error: msg }
  }
}

export async function toggleTeamMemberActive(id: string): Promise<ActionResult> {
  await requireAuth()
  try {
    const member = await db.teamMember.findUnique({ where: { id }, select: { isActive: true } })
    if (!member) return { success: false, error: "Team member not found" }
    await db.teamMember.update({ where: { id }, data: { isActive: !member.isActive } })
    revalidatePath("/settings")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Failed to update team member" }
  }
}

export async function deleteTeamMember(id: string): Promise<ActionResult> {
  await requireAuth()
  try {
    await db.teamMember.delete({ where: { id } })
    revalidatePath("/settings")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Failed to delete team member" }
  }
}

// ─── Legacy ───────────────────────────────────────────────────────────────────

export async function getAgencySettings(): Promise<ActionResult<AgencySettings | null>> {
  await requireAuth()
  try {
    const settings = await db.agencySettings.findUnique({ where: { id: "1" } })
    return { success: true, data: settings }
  } catch {
    return { success: true, data: null }
  }
}

export async function updateAgencySettings(data: AgencySettingsFormValues): Promise<ActionResult<AgencySettings>> {
  await requireAuth()
  const parsed = agencySettingsSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }
  try {
    const settings = await db.agencySettings.upsert({
      where: { id: "1" },
      update: parsed.data,
      create: { id: "1", ...parsed.data },
    })
    revalidatePath("/settings")
    return { success: true, data: settings }
  } catch {
    return { success: false, error: "Failed to update settings" }
  }
}
