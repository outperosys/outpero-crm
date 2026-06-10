import { notFound } from "next/navigation"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileDown, ExternalLink } from "lucide-react"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EntityTasksCard } from "@/components/tasks/entity-tasks-card"
import { getTeamMembers } from "@/actions/settings"

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await getAuthUser()
  if (!user) notFound()

  let receipt: any
  try {
    receipt = await (prisma as any).receipt.findUniqueOrThrow({
      where: { id },
      include: {
        lead: true,
        invoice: { include: { items: true } },
      },
    })
  } catch {
    notFound()
  }

  const teamMembers = await getTeamMembers().catch(() => [])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/financial"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{receipt.receiptNumber}</h1>
              <Badge variant="default">Receipt</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Payment received on {formatDate(receipt.paymentDate)}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <a href={`/api/financial/receipts/${receipt.id}/pdf`} download>
            <FileDown className="h-4 w-4 mr-2" />
            Export PDF
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Received From
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-semibold">{receipt.clientName}</p>
              {receipt.companyName && <p className="text-sm text-muted-foreground">{receipt.companyName}</p>}
              {receipt.lead && (
                <div className="pt-2">
                  <Link href={`/leads/${receipt.lead.id}`} className="text-xs text-muted-foreground hover:underline flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    View Lead
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Services Paid For
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{receipt.services}</p>
            </CardContent>
          </Card>

          {/* Linked Invoice */}
          {receipt.invoice && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Linked Invoice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <Link href={`/financial/invoices/${receipt.invoice.id}`} className="font-medium hover:underline">
                    {receipt.invoice.invoiceNumber}
                  </Link>
                  <Badge variant="outline">{receipt.invoice.status.replace(/_/g, " ")}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Invoice Total: {formatCurrency(receipt.invoice.grandTotal)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {receipt.notes && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm whitespace-pre-line">{receipt.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — payment summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Amount Received</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(receipt.amountReceived)}</p>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{formatDate(receipt.paymentDate)}</span>
                </div>
                {receipt.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span>{receipt.paymentMethod}</span>
                  </div>
                )}
                {receipt.transactionReference && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Txn Ref</span>
                    <span className="font-mono text-xs">{receipt.transactionReference}</span>
                  </div>
                )}
                {receipt.utrNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UTR</span>
                    <span className="font-mono text-xs">{receipt.utrNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <EntityTasksCard relatedType="RECEIPT" relatedId={receipt.id} teamMembers={teamMembers} />
        </div>
      </div>
    </div>
  )
}
