"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { generateInvoiceSchema } from "@/lib/validations/financial"
import type { ActionResult } from "@/types"
import { InvoiceStatus, ActivityType } from "@prisma/client"
import { calculateDueDate, calculateInvoiceTotals } from "@/lib/invoice/utils"
import { z } from "zod"

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function getInvoices() {
  await requireAuth()
  return prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { lead: true, proposal: true, items: true },
  })
}

export async function getInvoice(id: string) {
  await requireAuth()
  return prisma.invoice.findUnique({
    where: { id },
    include: { lead: true, proposal: true, items: true },
  })
}

export async function createInvoice(
  data: z.infer<typeof generateInvoiceSchema>
): Promise<ActionResult<{ id: string }>> {
  await requireAuth()

  const parsed = generateInvoiceSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { items, gstEnabled, gstPercentage, discountAmount, ...rest } = parsed.data

  // Compute per-item totals server-side
  const itemsWithTotals = items.map(item => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }))

  const issueDate = new Date()
  const dueDate = calculateDueDate(issueDate, rest.paymentTerms)
  const totals = calculateInvoiceTotals(itemsWithTotals, gstEnabled, gstPercentage, discountAmount)

  try {
    const newInvoice = await prisma.$transaction(async (tx) => {
      // Snapshot client info from lead
      const lead = await tx.lead.findUnique({ where: { id: rest.leadId } })
      if (!lead) throw new Error("Lead not found")

      // Generate INV-XXXX
      const latestInvoice = await tx.invoice.findFirst({
        orderBy: { invoiceNumber: "desc" },
      })

      let nextNumber = 1
      if (latestInvoice?.invoiceNumber.startsWith("INV-")) {
        const parsed = parseInt(latestInvoice.invoiceNumber.replace("INV-", ""), 10)
        if (!isNaN(parsed)) nextNumber = parsed + 1
      }
      const invoiceNumber = `INV-${nextNumber.toString().padStart(4, "0")}`

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          issueDate,
          dueDate,
          gstEnabled,
          gstPercentage,
          clientName: lead.name,
          companyName: lead.companyName ?? null,
          email: lead.email ?? null,
          phone: lead.phone ?? null,
          ...rest,
          ...totals,
          status: InvoiceStatus.DRAFT,
          items: {
            create: itemsWithTotals.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          },
        },
      })

      await tx.activity.create({
        data: {
          leadId: rest.leadId,
          type: ActivityType.INVOICE,
          description: `Invoice ${invoiceNumber} created — ₹${totals.grandTotal.toLocaleString("en-IN")}`,
          link: `/financial/invoices/${invoice.id}`,
        },
      })

      return invoice
    })

    revalidatePath("/financial")
    return { success: true, data: { id: newInvoice.id } }
  } catch (error: any) {
    console.error("Failed to create invoice", error)
    return { success: false, error: "Failed to create invoice. Please try again." }
  }
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<ActionResult> {
  await requireAuth()

  await prisma.invoice.update({ where: { id }, data: { status } })

  revalidatePath("/financial")
  revalidatePath(`/financial/invoices/${id}`)
  return { success: true, data: undefined }
}

export async function updateInvoice(
  id: string,
  data: z.infer<typeof generateInvoiceSchema>
): Promise<ActionResult<{ id: string }>> {
  await requireAuth()

  const parsed = generateInvoiceSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { items, gstEnabled, gstPercentage, discountAmount, ...rest } = parsed.data
  const itemsWithTotals = items.map(item => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }))
  const totals = calculateInvoiceTotals(itemsWithTotals, gstEnabled, gstPercentage, discountAmount)

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findUnique({ where: { id } })
      if (!existing) throw new Error("Invoice not found")

      await tx.invoice.update({
        where: { id },
        data: { gstEnabled, gstPercentage, ...rest, ...totals },
      })

      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } })
      await tx.invoiceItem.createMany({
        data: itemsWithTotals.map(item => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      })
    })

    revalidatePath("/financial")
    revalidatePath(`/financial/invoices/${id}`)
    return { success: true, data: { id } }
  } catch (error: any) {
    console.error("Failed to update invoice", error)
    return { success: false, error: "Failed to update invoice" }
  }
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  await requireAuth()

  try {
    await prisma.invoice.delete({ where: { id } })
    revalidatePath("/financial")
    return { success: true, data: undefined }
  } catch (error: any) {
    console.error("Failed to delete invoice", error)
    return { success: false, error: "Failed to delete invoice" }
  }
}
