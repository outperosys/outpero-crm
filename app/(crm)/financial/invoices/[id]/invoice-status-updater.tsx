"use client"

import { useTransition } from "react"
import { updateInvoiceStatus } from "@/actions/invoices"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
]

export function InvoiceStatusUpdater({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string
  currentStatus: string
}) {
  const [isPending, startTransition] = useTransition()

  const handleChange = (value: string) => {
    startTransition(async () => {
      await updateInvoiceStatus(invoiceId, value as any)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Update Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={currentStatus} onValueChange={handleChange} disabled={isPending}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
