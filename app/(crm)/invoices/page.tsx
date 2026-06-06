import Link from "next/link"
import { getInvoices } from "@/actions/invoices"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { FileText, Plus, ArrowRight } from "lucide-react"
import type { InvoiceStatus } from "@prisma/client"

export const metadata = { title: "Invoices — Outpero CRM" }

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

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            {invoices.length === 0
              ? "No invoices yet"
              : `${invoices.length} ${invoices.length === 1 ? "invoice" : "invoices"}`}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/invoices/new">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {invoices.length === 0 && (
        <div className="rounded-lg border border-dashed p-16 text-center">
          <FileText className="size-8 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">No invoices yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate your first invoice from a lead or proposal
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/invoices/new">
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Link>
          </Button>
        </div>
      )}

      {/* Invoices list */}
      {invoices.length > 0 && (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/invoices/${invoice.id}`}
              className="group flex items-center gap-4 rounded-lg border bg-card px-4 py-3.5 hover:border-foreground/20 transition-colors"
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{invoice.invoiceNumber} — {invoice.clientName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {invoice.proposal?.title ? `Proposal: ${invoice.proposal.title} · ` : ""}
                  Issued: {formatDate(invoice.issueDate)}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={STATUS_VARIANTS[invoice.status]}>
                  {STATUS_LABELS[invoice.status]}
                </Badge>
                <span className="text-sm font-medium">
                  ${invoice.grandTotal.toLocaleString()}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
