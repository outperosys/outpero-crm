"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { GenerateInvoiceForm } from "@/components/invoices/generate-invoice-form"
import { createInvoice } from "@/actions/invoices"
import { extractLineItemsFromProposalPricing } from "@/lib/invoice/utils"
import type { GenerateInvoiceFormValues, GenerateInvoiceFormInputValues } from "@/lib/validations/invoice"
import type { ProposalWithSections } from "@/actions/proposals"
import type { Lead } from "@prisma/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface InvoiceCreatorProps {
  leads: Lead[]
  proposals: ProposalWithSections[]
  defaultProposalId?: string
  defaultLeadId?: string
}

export function InvoiceCreator({ leads, proposals, defaultProposalId, defaultLeadId }: InvoiceCreatorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedLeadId, setSelectedLeadId] = useState<string>(defaultLeadId || "")
  const [selectedProposalId, setSelectedProposalId] = useState<string>(defaultProposalId || "manual")

  const selectedLead = leads.find((l) => l.id === selectedLeadId)
  const selectedProposal = proposals.find((p) => p.id === selectedProposalId)

  // Extract items for defaultValues when a proposal is selected
  let initialItems = [{ description: "Custom Service", quantity: 1, unitPrice: 0, total: 0 }]
  if (selectedProposal) {
    const pricingSection = selectedProposal.sections.find(s => s.type === "PRICING")
    if (pricingSection && pricingSection.content) {
      const extracted = extractLineItemsFromProposalPricing(pricingSection.content)
      if (extracted.length > 0) initialItems = extracted
    }
  }

  const handleSubmit = async (data: GenerateInvoiceFormInputValues) => {
    startTransition(async () => {
      const payload: GenerateInvoiceFormValues = {
        ...data,
        leadId: selectedLeadId,
        proposalId: selectedProposalId !== "manual" ? selectedProposalId : undefined,
        clientName: selectedLead?.name || "Unknown",
        companyName: selectedLead?.companyName || undefined,
        email: selectedLead?.email || undefined,
        phone: selectedLead?.phone || undefined,
        items: data.items,
      }

      const result = await createInvoice(payload)
      if (result.success) {
        router.push(`/invoices/${result.data.id}`)
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
            <Label>Lead</Label>
            <Select 
              value={selectedLeadId} 
              onValueChange={setSelectedLeadId}
              disabled={selectedProposalId !== "manual"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select lead..." />
              </SelectTrigger>
              <SelectContent>
                {leads.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name} {l.companyName ? `(${l.companyName})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {selectedLeadId && (
        <GenerateInvoiceForm 
          key={selectedProposalId} // Remount when proposal changes to re-initialize default values
          defaultValues={{ items: initialItems }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isPending={isPending}
        />
      )}
    </div>
  )
}
