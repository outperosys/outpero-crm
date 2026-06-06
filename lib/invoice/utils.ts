import { PaymentTerms } from "@prisma/client"
import { parsePricingContent } from "../proposal/renderer"

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function calculateDueDate(issueDate: Date, terms: PaymentTerms): Date {
  switch (terms) {
    case "DUE_ON_RECEIPT":
      return issueDate
    case "DAYS_7":
      return addDays(issueDate, 7)
    case "DAYS_14":
      return addDays(issueDate, 14)
    case "DAYS_30":
      return addDays(issueDate, 30)
    case "CUSTOM":
      return issueDate // User must override this manually in UI if custom, but for now we default to issue date
    default:
      return issueDate
  }
}

export function extractLineItemsFromProposalPricing(pricingContent: string) {
  const rows = parsePricingContent(pricingContent)
  return rows.map(row => {
    // Extract numbers from price string (e.g., "$1,000" -> 1000)
    const priceNumber = parseFloat(row.price.replace(/[^0-9.-]+/g, "")) || 0
    return {
      description: row.item + (row.notes ? ` - ${row.notes}` : ""),
      quantity: 1,
      unitPrice: priceNumber,
      total: priceNumber,
    }
  })
}

export function calculateInvoiceTotals(
  items: { total: number }[],
  gstEnabled: boolean,
  gstPercentage?: number
) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  let gstAmount = 0
  
  if (gstEnabled && gstPercentage && gstPercentage > 0) {
    gstAmount = subtotal * (gstPercentage / 100)
  }
  
  const grandTotal = subtotal + gstAmount
  
  return {
    subtotal,
    gstAmount,
    grandTotal
  }
}
