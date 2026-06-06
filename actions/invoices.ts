"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { generateInvoiceSchema, logPaymentSchema, type GenerateInvoiceFormValues, type LogPaymentFormValues } from "@/lib/validations/invoice"
import type { ActionResult } from "@/types"
import { InvoiceStatus, type Invoice, type Payment } from "@prisma/client"
import { calculateDueDate, calculateInvoiceTotals } from "@/lib/invoice/utils"

async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function getInvoices() {
  await requireAuth()
  return prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { lead: true, proposal: true, items: true, payments: true }
  })
}

export async function getInvoice(id: string) {
  await requireAuth()
  return prisma.invoice.findUnique({
    where: { id },
    include: { lead: true, proposal: true, items: true, payments: true }
  })
}

export async function createInvoice(
  data: GenerateInvoiceFormValues
): Promise<ActionResult<{ id: string }>> {
  await requireAuth()

  const parsed = generateInvoiceSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { items, gstEnabled, gstPercentage, paymentDetails, ...rest } = parsed.data
  const issueDate = new Date()
  const dueDate = calculateDueDate(issueDate, rest.paymentTerms)
  const totals = calculateInvoiceTotals(items, gstEnabled, gstPercentage)

  try {
    const newInvoice = await prisma.$transaction(async (tx) => {
      // Generate INV-XXXX
      const latestInvoice = await tx.invoice.findFirst({
        orderBy: { invoiceNumber: 'desc' }
      })
      
      let nextNumber = 1
      if (latestInvoice && latestInvoice.invoiceNumber.startsWith('INV-')) {
        const numPart = latestInvoice.invoiceNumber.replace('INV-', '')
        const parsedNum = parseInt(numPart, 10)
        if (!isNaN(parsedNum)) {
          nextNumber = parsedNum + 1
        }
      }
      const invoiceNumber = `INV-${nextNumber.toString().padStart(4, '0')}`

      // Create the invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          issueDate,
          dueDate,
          gstEnabled,
          gstPercentage,
          ...rest,
          ...totals,
          status: InvoiceStatus.DRAFT,
          items: {
            create: items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total
            }))
          }
        }
      })

      // If initial payment details are provided
      let finalStatus = InvoiceStatus.DRAFT
      if (paymentDetails && paymentDetails.amount && paymentDetails.amount > 0) {
        await tx.payment.create({
          data: {
            invoiceId: invoice.id,
            amountReceived: paymentDetails.amount,
            paymentMode: paymentDetails.mode,
            transactionReference: paymentDetails.transactionReference,
            paymentDate: paymentDetails.paymentDate || new Date(),
          }
        })

        if (paymentDetails.amount >= totals.grandTotal) {
          finalStatus = InvoiceStatus.PAID
        } else {
          finalStatus = InvoiceStatus.PARTIALLY_PAID
        }
      }

      if (finalStatus !== InvoiceStatus.DRAFT) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: finalStatus }
        })
      }

      return invoice
    })

    revalidatePath("/invoices")
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
  
  await prisma.invoice.update({
    where: { id },
    data: { status }
  })
  
  revalidatePath("/invoices")
  revalidatePath(`/invoices/${id}`)
  return { success: true, data: undefined }
}

export async function logPayment(
  data: LogPaymentFormValues
): Promise<ActionResult<Payment>> {
  await requireAuth()

  const parsed = logPaymentSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    const payment = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: parsed.data.invoiceId },
        include: { payments: true }
      })

      if (!invoice) throw new Error("Invoice not found")

      const newPayment = await tx.payment.create({
        data: parsed.data
      })

      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amountReceived, 0) + newPayment.amountReceived
      
      let newStatus = invoice.status
      if (totalPaid >= invoice.grandTotal) {
        newStatus = InvoiceStatus.PAID
      } else if (totalPaid > 0) {
        newStatus = InvoiceStatus.PARTIALLY_PAID
      }

      if (newStatus !== invoice.status) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: newStatus }
        })
      }

      return newPayment
    })

    revalidatePath("/invoices")
    revalidatePath(`/invoices/${parsed.data.invoiceId}`)
    return { success: true, data: payment }
  } catch (error: any) {
    console.error("Failed to log payment", error)
    return { success: false, error: error.message || "Failed to log payment" }
  }
}
