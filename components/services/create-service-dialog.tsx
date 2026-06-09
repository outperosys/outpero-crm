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
import { createService } from "@/actions/services"
import { ServiceForm } from "./service-form"
import type { ServiceFormValues } from "@/lib/validations/service"

export function CreateServiceDialog() {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setError(null)
      setFormKey((key) => key + 1)
    }
  }

  function handleSubmit(data: ServiceFormValues) {
    return new Promise<void>((resolve) => {
      setError(null)
      startTransition(async () => {
        const result = await createService(data)
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
          New Service
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Service</DialogTitle>
        </DialogHeader>
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <ServiceForm
          key={formKey}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
