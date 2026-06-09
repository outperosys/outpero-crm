"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createInvoice } from "@/actions/invoices"
import { GenerateInvoiceForm } from "@/components/financial/generate-invoice-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface InvoiceCreatorProps {
  leads: any[]
  proposals: any[]
  services: any[]
  defaultProposalId?: string
  defaultLeadId?: string
  defaultBankDetails?: string
  defaultTerms?: string
  defaultGstNumber?: string
}

export function InvoiceCreator({ leads, proposals, services, defaultProposalId, defaultLeadId, defaultBankDetails, defaultTerms, defaultGstNumber }: InvoiceCreatorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedLeadId, setSelectedLeadId] = useState<string>(defaultLeadId || "")
  const [selectedProposalId, setSelectedProposalId] = useState<string>(defaultProposalId || "manual")

  // Initialize line items based on proposal services if applicable
  let initialItems = [{ description: "", quantity: 1, unitPrice: 0 }]
  if (selectedProposalId !== "manual") {
    const p = proposals.find(pr => pr.id === selectedProposalId)
    if (p && p.services && Array.isArray(p.services)) {
      initialItems = p.services.map((srv: any) => ({
        description: srv.name + (srv.description ? `\n${srv.description}` : ""),
        quantity: 1,
        unitPrice: srv.price || 0,
      }))
    }
  }

  const handleSubmit = async (data: any) => {
    if (!selectedLeadId) return alert("Please select a lead/client")

    startTransition(async () => {
      const payload = {
        ...data,
        leadId: selectedLeadId,
        proposalId: selectedProposalId !== "manual" ? selectedProposalId : undefined,
      }

      const result = await createInvoice(payload)
      if (result.success) {
        router.push(`/financial/invoices/${result.data.id}`)
      } else {
        alert(result.error)
      }
    })
  }

  const handleProposalChange = (val: string) => {
    setSelectedProposalId(val)
    if (val !== "manual") {
      const p = proposals.find(p => p.id === val)
      if (p) setSelectedLeadId(p.leadId)
    }
  }

  return (
    <div className="space-y-8">
      {/* Selection Area */}
      <section className="space-y-4 border rounded-md p-4 bg-muted/10">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Source Proposal</Label>
            <Select value={selectedProposalId} onValueChange={handleProposalChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select proposal..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual (No Proposal)</SelectItem>
                {proposals.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Client / Lead</Label>
            <Select 
              value={selectedLeadId} 
              onValueChange={setSelectedLeadId}
              disabled={selectedProposalId !== "manual"}
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
        <GenerateInvoiceForm
          key={selectedProposalId + selectedLeadId}
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
