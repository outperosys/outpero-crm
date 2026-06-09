"use client"

import { useState, useTransition } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteService } from "@/actions/services"
import type { Service } from "@prisma/client"

interface DeleteServiceDialogProps {
  service: Service | null
  onClose: () => void
}

export function DeleteServiceDialog({
  service,
  onClose,
}: DeleteServiceDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!service) return

    setError(null)
    startTransition(async () => {
      const result = await deleteService(service.id)
      if (!result.success) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <AlertDialog
      open={!!service}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Service</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {service?.name}
            </span>
            ? Future proposals and invoices will need a catalog service to
            auto-fill from.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
