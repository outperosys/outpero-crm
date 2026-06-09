"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LeadForm } from "./lead-form"
import { createLead } from "@/actions/leads"
import type { LeadFormValues } from "@/lib/validations/lead"

interface CreateLeadDialogProps {
  services?: { id: string; name: string }[]
  teamMembers?: { id: string; name: string }[]
}

export function CreateLeadDialog({ services = [], teamMembers = [] }: CreateLeadDialogProps) {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setError(null)
      setFormKey((k) => k + 1)
    }
  }

  function handleSubmit(data: LeadFormValues) {
    return new Promise<void>((resolve) => {
      setError(null)
      startTransition(async () => {
        const result = await createLead(data)
        if (!result.success) {
          setError(result.error)
        } else {
          setOpen(false)
        }
        resolve()
      })
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Lead</DialogTitle>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
            {error}
          </p>
        )}
        <LeadForm
          key={formKey}
          services={services}
          teamMembers={teamMembers}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
