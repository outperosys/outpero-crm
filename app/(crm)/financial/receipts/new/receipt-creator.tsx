"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createReceipt } from "@/actions/receipts"
import { GenerateReceiptForm } from "@/components/financial/generate-receipt-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ReceiptCreatorProps {
  leads: any[]
  invoices: any[]
  defaultInvoiceId?: string
  defaultLeadId?: string
  defaultTerms?: string
}

export function ReceiptCreator({ leads, invoices, defaultInvoiceId, defaultLeadId, defaultTerms }: ReceiptCreatorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedLeadId, setSelectedLeadId] = useState<string>(defaultLeadId || "")
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(defaultInvoiceId || "manual")

  const handleInvoiceChange = (val: string) => {
    setSelectedInvoiceId(val)
    if (val !== "manual") {
      const inv = invoices.find(i => i.id === val)
      if (inv) setSelectedLeadId(inv.leadId)
    }
  }

  // Pre-fill values if an invoice is selected
  let defaultValues: any = {}
  if (selectedInvoiceId !== "manual") {
    const inv = invoices.find(i => i.id === selectedInvoiceId)
    if (inv) {
      const balance = Math.max(0, inv.grandTotal - (inv.receipts?.reduce((s: number, r: any) => s + r.amountReceived, 0) || 0))
      defaultValues.amountReceived = balance
      defaultValues.services = inv.items?.map((item: any) => item.description.split('\n')[0]).join(', ') || ""
    }
  }

  const handleSubmit = async (data: any) => {
    if (!selectedLeadId) return alert("Please select a lead/client")

    startTransition(async () => {
      const payload = {
        ...data,
        leadId: selectedLeadId,
        invoiceId: selectedInvoiceId !== "manual" ? selectedInvoiceId : undefined,
      }

      const result = await createReceipt(payload)
      if (result.success) {
        router.push(`/financial/receipts/${result.data.id}`)
      } else {
        alert(result.error)
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Selection Area */}
      <section className="space-y-4 border rounded-md p-4 bg-muted/10">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Source Invoice (Optional)</Label>
            <Select value={selectedInvoiceId} onValueChange={handleInvoiceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select invoice..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual (No Invoice)</SelectItem>
                {invoices.map(i => (
                  <SelectItem key={i.id} value={i.id}>{i.invoiceNumber} — ₹{i.grandTotal.toLocaleString("en-IN")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Client / Lead</Label>
            <Select 
              value={selectedLeadId} 
              onValueChange={setSelectedLeadId}
              disabled={selectedInvoiceId !== "manual"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client..." />
              </SelectTrigger>
              <SelectContent>
                {leads.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name} {l.companyName ? `(${l.companyName})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {selectedLeadId && (
        <GenerateReceiptForm
          key={selectedInvoiceId + selectedLeadId}
          defaultValues={{ ...defaultValues, leadId: selectedLeadId }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isPending={isPending}
          defaultTerms={defaultTerms}
        />
      )}
    </div>
  )
}
