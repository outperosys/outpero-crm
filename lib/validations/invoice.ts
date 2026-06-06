import { z } from "zod"
import { InvoiceType, PaymentTerms, InvoiceStatus } from "@prisma/client"

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
  total: z.coerce.number().min(0),
})

export const generateInvoiceSchema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  proposalId: z.string().optional(),
  
  // The 4 questions
  type: z.nativeEnum(InvoiceType),
  paymentTerms: z.nativeEnum(PaymentTerms),
  
  gstEnabled: z.boolean(),
  gstNumber: z.string().optional(),
  gstPercentage: z.coerce.number().optional(),
  
  notes: z.string().optional(),
  
  // Pre-filled
  clientName: z.string().min(1, "Client Name is required"),
  companyName: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  billingAddress: z.string().optional(),
  
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
}).superRefine((data, ctx) => {
  if (data.gstEnabled) {
    if (!data.gstPercentage || data.gstPercentage <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GST Percentage is required when GST is enabled",
        path: ["gstPercentage"],
      })
    }
  }
})

export const generateInvoiceFormSchema = z.object({
  type: z.nativeEnum(InvoiceType),
  paymentTerms: z.nativeEnum(PaymentTerms),
  gstEnabled: z.boolean(),
  gstNumber: z.string().optional(),
  gstPercentage: z.coerce.number().optional(),
  notes: z.string().optional(),
  
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),

  paymentDetails: z.object({
    amount: z.coerce.number().min(0).optional(),
    mode: z.string().optional(),
    transactionReference: z.string().optional(),
    paymentDate: z.date().optional(),
  }).optional()
}).superRefine((data, ctx) => {
  if (data.gstEnabled) {
    if (!data.gstPercentage || data.gstPercentage <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GST Percentage is required when GST is enabled",
        path: ["gstPercentage"],
      })
    }
  }
})

export const logPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  amountReceived: z.coerce.number().min(1, "Amount must be greater than 0"),
  paymentDate: z.date({
    required_error: "Payment date is required",
  }),
  transactionReference: z.string().optional(),
  utrNumber: z.string().optional(),
  notes: z.string().optional(),
})

export type GenerateInvoiceFormValues = z.infer<typeof generateInvoiceSchema>
export type GenerateInvoiceFormInputValues = z.infer<typeof generateInvoiceFormSchema>
export type LogPaymentFormValues = z.infer<typeof logPaymentSchema>
