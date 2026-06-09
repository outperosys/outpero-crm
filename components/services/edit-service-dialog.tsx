"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateService } from "@/actions/services"
import { ServiceForm } from "./service-form"
import type { ServiceFormValues } from "@/lib/validations/service"
import type { Service } from "@prisma/client"

interface EditServiceDialogProps {
  service: Service | null
  onClose: () => void
}

export function EditServiceDialog({ service, onClose }: EditServiceDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(data: ServiceFormValues) {
    if (!service) return Promise.resolve()

    return new Promise<void>((resolve) => {
      setError(null)
      startTransition(async () => {
        const result = await updateService(service.id, data)
        if (!result.success) {
          setError(result.error)
        } else {
          onClose()
        }
        resolve()
      })
    })
  }

  const defaultValues: Partial<ServiceFormValues> | undefined = service
    ? {
        name: service.name,
        category: service.category,
        status: service.status,
        shortDescription: service.shortDescription,
        fullDescription: service.fullDescription ?? "",
        startingPrice: service.startingPrice ?? undefined,
        defaultPrice: service.defaultPrice ?? undefined,
        pricingNotes: service.pricingNotes ?? "",
        timeline: service.timeline ?? "",
        deliverables: service.deliverables ?? "",
        implementationSteps: service.implementationSteps ?? "",
        idealClient: service.idealClient ?? "",
        problemsSolved: service.problemsSolved ?? "",
        commonObjections: service.commonObjections ?? "",
        aiContext: service.aiContext ?? "",
        proposalInstructions: service.proposalInstructions ?? "",
        followUpInstructions: service.followUpInstructions ?? "",
        proposalDefaults: service.proposalDefaults ?? "",
        invoiceDefaults: service.invoiceDefaults ?? "",
        notes: service.notes ?? "",
      }
    : undefined

  return (
    <Dialog
      open={!!service}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
        </DialogHeader>
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {service && (
          <ServiceForm
            key={service.id}
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
