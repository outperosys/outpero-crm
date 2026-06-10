"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createInvoice } from "@/actions/invoices"
import { GenerateInvoiceForm } from "@/components/financial/generate-invoice-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface InvoiceCreatorProps {
  leads: any[]
  services: any[]
  defaultLeadId?: string
  defaultBankDetails?: string
  defaultTerms?: string
  defaultGstNumber?: string
}

export function InvoiceCreator({ leads, services, defaultLeadId, defaultBankDetails, defaultTerms, defaultGstNumber }: InvoiceCreatorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedLeadId, setSelectedLeadId] = useState<string>(defaultLeadId || "")

  const initialItems = [{ description: "", quantity: 1, unitPrice: 0 }]

  const handleSubmit = async (data: any) => {
    if (!selectedLeadId) return alert("Please select a lead/client")

    startTransition(async () => {
      const payload = {
        ...data,
        leadId: selectedLeadId,
      }

      const result = await createInvoice(payload)
      if (result.success) {
        router.push(`/financial/invoices/${result.data.id}`)
      } else {
        alert(result.error)
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Selection Area */}
      <section className="space-y-4 border rounded-md p-4 bg-muted/10">
        <div className="space-y-2">
          <Label>Client / Lead</Label>
          <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
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
      </section>

      {selectedLeadId && (
        <GenerateInvoiceForm
          key={selectedLeadId}
          defaultValues={{ items: initialItems, leadId: selectedLeadId }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isPending={isPending}
          services={services}
          defaultBankDetails={defaultBankDetails}
          defaultTerms={defaultTerms}
          defaultGstNumber={defaultGstNumber}
        />
      )}
    </div>
  )
}
