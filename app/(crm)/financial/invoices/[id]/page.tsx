import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InvoiceStatusUpdater } from "./invoice-status-updater"
import { EntityTasksCard } from "@/components/tasks/entity-tasks-card"
import { getTeamMembers } from "@/actions/settings"
import { ArrowLeft, FileDown, Receipt, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  SENT: "secondary",
  PARTIALLY_PAID: "secondary",
  PAID: "default",
  OVERDUE: "destructive",
  CANCELLED: "outline",
}

const PAYMENT_TERMS_LABEL: Record<string, string> = {
  DUE_ON_RECEIPT: "Due on Receipt",
  DAYS_7: "7 Days",
  DAYS_14: "14 Days",
  DAYS_30: "30 Days",
  CUSTOM: "Custom",
}

const INVOICE_TYPE_LABEL: Record<string, string> = {
  FULL_PAYMENT: "Full Payment",
  ADVANCE_PAYMENT: "Advance Payment",
  MILESTONE_PAYMENT: "Milestone Payment",
  FINAL_PAYMENT: "Final Payment",
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { lead: true, proposal: true, items: true },
  })
  if (!invoice) notFound()

  const receipts: any[] = await (prisma as any).receipt.findMany({
    where: { invoiceId: id },
    orderBy: { createdAt: "asc" },
  }).catch(() => [])

  const teamMembers = await getTeamMembers().catch(() => [])

  const totalPaid = receipts.reduce((sum: number, r: any) => sum + r.amountReceived, 0)
  const balanceDue = Math.max(0, invoice.grandTotal - totalPaid)
  const isFullyPaid = balanceDue <= 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/financial"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{invoice.invoiceNumber}</h1>
              <Badge variant={STATUS_BADGE[invoice.status] ?? "outline"}>{invoice.status.replace(/_/g, " ")}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {INVOICE_TYPE_LABEL[invoice.type]} · Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isFullyPaid && invoice.status !== "CANCELLED" && (
            <Button variant="outline" asChild>
              <Link href={`/financial/receipts/new?invoiceId=${invoice.id}`}>
                <Receipt className="h-4 w-4 mr-2" />
                Log Payment
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={`/api/financial/invoices/${invoice.id}/pdf`} download>
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client info */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Billed To</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <p className="font-semibold">{invoice.clientName}</p>
              {invoice.companyName && <p className="text-sm text-muted-foreground">{invoice.companyName}</p>}
              {invoice.email && <p className="text-sm text-muted-foreground">{invoice.email}</p>}
              {invoice.phone && <p className="text-sm text-muted-foreground">{invoice.phone}</p>}
              {invoice.billingAddress && <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.billingAddress}</p>}
              {invoice.gstEnabled && invoice.gstNumber && (
                <p className="text-sm text-muted-foreground">GST: {invoice.gstNumber}</p>
              )}
              {invoice.lead && (
                <div className="pt-2">
                  <Link href={`/leads/${invoice.lead.id}`} className="text-xs text-muted-foreground hover:underline flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    View Lead
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line items */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Line Items</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right w-16">Qty</TableHead>
                    <TableHead className="text-right w-28">Unit Price</TableHead>
                    <TableHead className="text-right w-28">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-pre-line">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment history */}
          {receipts.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Payment History</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <Link href={`/financial/receipts/${r.id}`} className="font-medium hover:underline">
                            {r.receiptNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(r.paymentDate)}</TableCell>
                        <TableCell className="text-muted-foreground">{r.paymentMethod || "—"}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">{formatCurrency(r.amountReceived)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Notes & Bank Details */}
          {(invoice.notes || invoice.bankDetails || invoice.terms) && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                {invoice.notes && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
                  </div>
                )}
                {invoice.bankDetails && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Payment Info</p>
                    <p className="text-sm whitespace-pre-line">{invoice.bankDetails}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Terms & Conditions</p>
                    <p className="text-sm whitespace-pre-line">{invoice.terms}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — summary */}
        <div className="space-y-6">
          {/* Totals */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.gstEnabled && invoice.gstAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST ({invoice.gstPercentage}%)</span>
                  <span>{formatCurrency(invoice.gstAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Grand Total</span>
                <span>{formatCurrency(invoice.grandTotal)}</span>
              </div>
              {totalPaid > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Amount Paid</span>
                    <span>{formatCurrency(totalPaid)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Balance Due</span>
                    <span className={balanceDue > 0 ? "text-destructive" : "text-green-600"}>
                      {formatCurrency(balanceDue)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Meta */}
          <Card>
            <CardContent className="pt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Terms</span>
                <span>{PAYMENT_TERMS_LABEL[invoice.paymentTerms] ?? invoice.paymentTerms}</span>
              </div>
              {invoice.proposal && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proposal</span>
                  <Link href={`/proposals/${invoice.proposal.id}`} className="hover:underline truncate max-w-[130px]">
                    {invoice.proposal.title ?? "View"}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status updater */}
          <InvoiceStatusUpdater invoiceId={invoice.id} currentStatus={invoice.status} />

          {/* Tasks */}
          <EntityTasksCard relatedType="INVOICE" relatedId={invoice.id} teamMembers={teamMembers} />
        </div>
      </div>
    </div>
  )
}
