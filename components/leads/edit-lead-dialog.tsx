"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LeadForm } from "./lead-form"
import { updateLead } from "@/actions/leads"
import type { Lead } from "@prisma/client"
import type { LeadFormValues } from "@/lib/validations/lead"

interface EditLeadDialogProps {
  lead: Lead | null
  onClose: () => void
}

export function EditLeadDialog({ lead, onClose }: EditLeadDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(data: LeadFormValues) {
    if (!lead) return Promise.resolve()
    return new Promise<void>((resolve) => {
      setError(null)
      startTransition(async () => {
        const result = await updateLead(lead.id, data)
        if (!result.success) {
          setError(result.error)
        } else {
          onClose()
        }
        resolve()
      })
    })
  }

  const defaultValues: Partial<LeadFormValues> | undefined = lead
    ? {
        name: lead.name,
        companyName: lead.companyName ?? "",
        phone: lead.phone ?? "",
        email: lead.email ?? "",
        source: lead.source ?? "",
        serviceInterested: lead.serviceInterested ?? "",
        industry: lead.industry ?? "",
        teamSize: lead.teamSize ?? "",
        socialProfiles: lead.socialProfiles ?? "",
        existingWebsite: lead.existingWebsite ?? "",
        currentProblem: lead.currentProblem ?? "",
        currentTools: lead.currentTools ?? "",
        priority: lead.priority,
        urgency: lead.urgency,
        pipelineStage: lead.pipelineStage,
        lastContacted: lead.lastContacted
          ? lead.lastContacted.toISOString().split("T")[0]
          : "",
        nextFollowUp: lead.nextFollowUp
          ? lead.nextFollowUp.toISOString().split("T")[0]
          : "",
        dealValue: lead.dealValue ?? null,
        proposalSent: lead.proposalSent,
        notes: lead.notes ?? "",
        assignedTo: lead.assignedTo ?? "",
      }
    : undefined

  return (
    <Dialog open={!!lead} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
            {error}
          </p>
        )}
        {lead && (
          <LeadForm
            key={lead.id}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isPending={isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
