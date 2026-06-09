"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { generateReceiptSchema } from "@/lib/validations/financial"
import type { ActionResult } from "@/types"
import { ActivityType } from "@prisma/client"
import { z } from "zod"

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function getReceipts() {
  await requireAuth()
  return (prisma as any).receipt.findMany({
    orderBy: { createdAt: "desc" },
    include: { lead: true, invoice: true },
  })
}

export async function getReceipt(id: string) {
  await requireAuth()
  return (prisma as any).receipt.findUnique({
    where: { id },
    include: { lead: true, invoice: { include: { items: true } } },
  })
}

export async function createReceipt(
  data: z.infer<typeof generateReceiptSchema>
): Promise<ActionResult<{ id: string }>> {
  await requireAuth()

  const parsed = generateReceiptSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { invoiceId, leadId, ...rest } = parsed.data

  try {
    const newReceipt = await (prisma as any).$transaction(async (tx: any) => {
      const lead = await tx.lead.findUnique({ where: { id: leadId } })
      if (!lead) throw new Error("Lead not found")

      // Generate RCT-XXXX
      const latestReceipt = await tx.receipt.findFirst({
        orderBy: { receiptNumber: "desc" },
      })

      let nextNumber = 1
      if (latestReceipt?.receiptNumber?.startsWith("RCT-")) {
        const parsed = parseInt(latestReceipt.receiptNumber.replace("RCT-", ""), 10)
        if (!isNaN(parsed)) nextNumber = parsed + 1
      }
      const receiptNumber = `RCT-${nextNumber.toString().padStart(4, "0")}`

      const receipt = await tx.receipt.create({
        data: {
          receiptNumber,
          receiptDate: new Date(),
          leadId,
          invoiceId: invoiceId || null,
          clientName: lead.name,
          companyName: lead.companyName ?? null,
          ...rest,
        },
      })

      // Update invoice status if linked
      if (invoiceId) {
        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId },
        })
        const allReceipts = await tx.receipt.findMany({
          where: { invoiceId },
        })

        if (invoice) {
          const totalPaid = allReceipts.reduce((sum: number, r: any) => sum + r.amountReceived, 0)
          let newStatus = invoice.status
          if (totalPaid >= invoice.grandTotal) {
            newStatus = "PAID"
          } else if (totalPaid > 0) {
            newStatus = "PARTIALLY_PAID"
          }
          if (newStatus !== invoice.status) {
            await tx.invoice.update({ where: { id: invoiceId }, data: { status: newStatus } })
          }
        }
      }

      await tx.activity.create({
        data: {
          leadId,
          type: ActivityType.PAYMENT,
          description: `Payment received: ₹${rest.amountReceived.toLocaleString("en-IN")}${invoiceId ? ` for invoice` : ""}`,
          link: `/financial/receipts/${receipt.id}`,
        },
      })

      return receipt
    })

    revalidatePath("/financial")
    if (invoiceId) revalidatePath(`/financial/invoices/${invoiceId}`)
    return { success: true, data: { id: newReceipt.id } }
  } catch (error: any) {
    console.error("Failed to create receipt", error)
    return { success: false, error: error.message || "Failed to create receipt" }
  }
}

export async function deleteReceipt(id: string): Promise<ActionResult> {
  await requireAuth()
  try {
    await (prisma as any).receipt.delete({ where: { id } })
    revalidatePath("/financial")
    return { success: true, data: undefined }
  } catch (error: any) {
    console.error("Failed to delete receipt", error)
    return { success: false, error: "Failed to delete receipt" }
  }
}
