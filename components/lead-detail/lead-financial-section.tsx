import Link from "next/link"
import { Receipt, FileText, Plus, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  DRAFT:          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  SENT:           "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  PARTIALLY_PAID: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  PAID:           "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  OVERDUE:        "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  CANCELLED:      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500",
}

export function LeadFinancialSection({
  invoices,
  receipts,
  leadId,
}: {
  invoices: any[]
  receipts: any[]
  leadId: string
}) {
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
  const totalReceived = receipts.reduce((sum, r) => sum + r.amountReceived, 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="size-4 text-muted-foreground" />
          <h2 className="font-semibold">Financial</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/financial/receipts/new?leadId=${leadId}`}>
              <Plus className="size-3.5 mr-1" />
              Receipt
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/financial/invoices/new?leadId=${leadId}`}>
              <Plus className="size-3.5 mr-1" />
              Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary row */}
      {(invoices.length > 0 || receipts.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">Total Invoiced</p>
            <p className="text-sm font-semibold">{formatCurrency(totalInvoiced)}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">Total Received</p>
            <p className="text-sm font-semibold text-emerald-600">{formatCurrency(totalReceived)}</p>
          </div>
        </div>
      )}

      {/* Invoices */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <FileText className="size-3.5 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoices</h3>
        </div>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No invoices yet</p>
        ) : (
          <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
            {invoices.map((inv: any) => (
              <Link
                key={inv.id}
                href={`/financial/invoices/${inv.id}`}
                className="flex items-center justify-between rounded-lg border px-3 py-2.5 hover:bg-muted/50 transition-colors group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{inv.invoiceNumber}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[inv.status] ?? STATUS_COLORS.DRAFT}`}>
                      {inv.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(inv.issueDate)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold">{formatCurrency(inv.grandTotal)}</span>
                  <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Receipts */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Receipt className="size-3.5 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payments Received</h3>
        </div>
        {receipts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No payments logged yet</p>
        ) : (
          <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
            {receipts.map((r: any) => (
              <Link
                key={r.id}
                href={`/financial/receipts/${r.id}`}
                className="flex items-center justify-between rounded-lg border px-3 py-2.5 hover:bg-muted/50 transition-colors group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{r.receiptNumber}</span>
                    {r.paymentMethod && (
                      <span className="text-xs text-muted-foreground">{r.paymentMethod}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.paymentDate)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-emerald-600">{formatCurrency(r.amountReceived)}</span>
                  <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
