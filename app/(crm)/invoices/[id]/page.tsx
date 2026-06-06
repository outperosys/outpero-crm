import { notFound } from "next/navigation"
import Link from "next/link"
import { getInvoice } from "@/actions/invoices"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ExternalLink, Download } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { LogPaymentDialog } from "@/components/invoices/log-payment-dialog"
import type { InvoiceStatus } from "@prisma/client"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoice(id)
  return { title: invoice ? `Invoice ${invoice.invoiceNumber} — Outpero CRM` : "Invoice — Outpero CRM" }
}

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
}

const STATUS_VARIANTS: Record<InvoiceStatus, "secondary" | "outline" | "default" | "destructive"> = {
  DRAFT: "outline",
  SENT: "secondary",
  PARTIALLY_PAID: "secondary",
  PAID: "default",
  OVERDUE: "destructive",
  CANCELLED: "outline",
}

export default async function InvoiceWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoice(id)

  if (!invoice) notFound()

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amountReceived, 0)
  const remainingAmount = invoice.grandTotal - totalPaid

  return (
    <div className="max-w-4xl space-y-0 pb-12">
      {/* Top nav bar */}
      <div className="flex items-center justify-between py-1 mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/invoices">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Invoices
          </Link>
        </Button>
        <div className="flex gap-2">
          {invoice.proposal && (
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link href={`/proposals/${invoice.proposal.id}`}>
                Proposal
                <ExternalLink className="h-3 w-3 ml-1.5" />
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href={`/leads/${invoice.lead.id}`}>
              Lead
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{invoice.invoiceNumber}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            <Badge variant={STATUS_VARIANTS[invoice.status]}>{STATUS_LABELS[invoice.status]}</Badge>
            <span>·</span>
            <span>Issued: {formatDate(invoice.issueDate)}</span>
            <span>·</span>
            <span className={invoice.status === "OVERDUE" ? "text-destructive font-medium" : ""}>
              Due: {formatDate(invoice.dueDate)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {remainingAmount > 0 && invoice.status !== "CANCELLED" && (
            <LogPaymentDialog invoiceId={invoice.id} remainingAmount={remainingAmount} />
          )}
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" />
              Export PDF
            </a>
          </Button>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Document View */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-8 space-y-8">
          
          {/* Bill To */}
          <div className="flex justify-between">
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-base mb-2">Billed To:</p>
              <p className="font-medium">{invoice.clientName}</p>
              {invoice.companyName && <p className="text-muted-foreground">{invoice.companyName}</p>}
              {invoice.email && <p className="text-muted-foreground">{invoice.email}</p>}
              {invoice.billingAddress && <p className="text-muted-foreground whitespace-pre-wrap mt-2">{invoice.billingAddress}</p>}
            </div>
            
            <div className="space-y-1 text-sm text-right">
              {invoice.gstEnabled && invoice.gstNumber && (
                <>
                  <p className="text-muted-foreground">Client GST:</p>
                  <p className="font-medium mb-4">{invoice.gstNumber}</p>
                </>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground w-24">Qty</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground w-32">Price</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">${item.unitPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">${item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span>${invoice.subtotal.toLocaleString()}</span>
              </div>
              {invoice.gstEnabled && invoice.gstAmount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>GST ({invoice.gstPercentage}%):</span>
                  <span>${invoice.gstAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-3 border-t">
                <span>Grand Total:</span>
                <span>${invoice.grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-muted-foreground pt-1">
                <span>Amount Paid:</span>
                <span>${totalPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-1">
                <span>Amount Due:</span>
                <span>${remainingAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="pt-8 text-sm">
              <p className="font-medium mb-1">Notes</p>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
            </div>
          )}

        </div>
      </div>
      
      {/* Payments History */}
      {invoice.payments.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-medium">Payment History</h2>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reference</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{formatDate(p.paymentDate)}</td>
                    <td className="px-4 py-3 font-medium">${p.amountReceived.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.transactionReference || p.utrNumber ? (
                        <>
                          {p.transactionReference && <span>{p.transactionReference}</span>}
                          {p.transactionReference && p.utrNumber && <span> · </span>}
                          {p.utrNumber && <span>UTR: {p.utrNumber}</span>}
                        </>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
