import { getInvoices } from "@/actions/invoices"
import { getReceipts } from "@/actions/receipts"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { PlusCircle, FileText, Receipt as ReceiptIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function FinancialDashboard() {
  const [invoices, receipts] = await Promise.all([
    getInvoices(),
    getReceipts()
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Documents</h1>
          <p className="text-muted-foreground">Manage your invoices and payment receipts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/financial/receipts/new">
              <ReceiptIcon className="mr-2 h-4 w-4" />
              New Receipt
            </Link>
          </Button>
          <Button asChild>
            <Link href="/financial/invoices/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="receipts">Receipts ({receipts.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Payment requests sent to clients.</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No invoices found.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">
                            <Link href={`/financial/invoices/${inv.id}`} className="hover:underline">
                              {inv.invoiceNumber}
                            </Link>
                          </TableCell>
                          <TableCell>{inv.clientName}</TableCell>
                          <TableCell>{formatCurrency(inv.grandTotal)}</TableCell>
                          <TableCell>{formatDate(inv.issueDate)}</TableCell>
                          <TableCell>{formatDate(inv.dueDate)}</TableCell>
                          <TableCell>
                            <Badge variant={inv.status === 'PAID' ? 'default' : inv.status === 'OVERDUE' ? 'destructive' : 'secondary'}>
                              {inv.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipts</CardTitle>
              <CardDescription>Payment confirmations for received funds.</CardDescription>
            </CardHeader>
            <CardContent>
              {receipts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No receipts found.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Receipt #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Invoice Ref</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipts.map((rct) => (
                        <TableRow key={rct.id}>
                          <TableCell className="font-medium">
                            <Link href={`/financial/receipts/${rct.id}`} className="hover:underline">
                              {rct.receiptNumber}
                            </Link>
                          </TableCell>
                          <TableCell>{rct.clientName}</TableCell>
                          <TableCell className="text-green-600 font-medium">{formatCurrency(rct.amountReceived)}</TableCell>
                          <TableCell>{formatDate(rct.paymentDate)}</TableCell>
                          <TableCell>
                            {rct.invoice ? (
                              <Link href={`/financial/invoices/${rct.invoice.id}`} className="text-muted-foreground hover:underline">
                                {rct.invoice.invoiceNumber}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
