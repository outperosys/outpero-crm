import { z } from "zod"
import { InvoiceType, PaymentTerms } from "@prisma/client"

export const financialItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative"),
})

export const generateInvoiceSchema = z.object({
  leadId: z.string().min(1, "Client/Lead is required"),
  proposalId: z.string().optional(),

  type: z.nativeEnum(InvoiceType),
  paymentTerms: z.nativeEnum(PaymentTerms),

  gstEnabled: z.boolean(),
  gstNumber: z.string().optional(),
  gstPercentage: z.coerce.number().optional().nullable(),

  discountAmount: z.coerce.number().min(0).optional().nullable(),

  bankDetails: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),

  items: z.array(financialItemSchema).min(1, "At least one item is required"),
})

export const generateReceiptSchema = z.object({
  leadId: z.string().min(1, "Client/Lead is required"),
  invoiceId: z.string().optional(),

  amountReceived: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentDate: z.coerce.date(),
  paymentMethod: z.string().optional(),
  transactionReference: z.string().optional(),
  utrNumber: z.string().optional(),

  services: z.string().min(1, "Please specify the services paid for"),

  notes: z.string().optional(),
  terms: z.string().optional(),
})
