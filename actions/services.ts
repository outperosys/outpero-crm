"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/types"
import type { Service } from "@prisma/client"
import { serviceSchema, type ServiceFormValues } from "@/lib/validations/service"

async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function getServices() {
  await requireAuth()
  return prisma.service.findMany({
    orderBy: { name: "asc" }
  })
}

export async function getActiveServices() {
  await requireAuth()
  return prisma.service.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}

export async function createService(data: ServiceFormValues): Promise<ActionResult<Service>> {
  await requireAuth()
  
  const parsed = serviceSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    const existing = await prisma.service.findUnique({ where: { name: parsed.data.name } })
    if (existing) {
      return { success: false, error: "Service with this name already exists" }
    }

    const service = await prisma.service.create({
      data: parsed.data
    })
    
    revalidatePath("/settings")
    revalidatePath("/invoices/new")
    return { success: true, data: service }
  } catch (error: any) {
    console.error("Failed to create service", error)
    return { success: false, error: "Failed to create service" }
  }
}

export async function updateService(id: string, data: ServiceFormValues): Promise<ActionResult<Service>> {
  await requireAuth()
  
  const parsed = serviceSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    const existing = await prisma.service.findUnique({ where: { name: parsed.data.name } })
    if (existing && existing.id !== id) {
      return { success: false, error: "Service with this name already exists" }
    }

    const service = await prisma.service.update({
      where: { id },
      data: parsed.data
    })
    
    revalidatePath("/settings")
    revalidatePath("/invoices/new")
    return { success: true, data: service }
  } catch (error: any) {
    console.error("Failed to update service", error)
    return { success: false, error: "Failed to update service" }
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  await requireAuth()
  
  try {
    await prisma.service.delete({
      where: { id }
    })
    
    revalidatePath("/settings")
    revalidatePath("/invoices/new")
    return { success: true, data: undefined }
  } catch (error: any) {
    console.error("Failed to delete service", error)
    return { success: false, error: "Failed to delete service" }
  }
}
