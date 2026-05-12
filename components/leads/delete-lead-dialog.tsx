"use client"

import { useTransition } from "react"
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
import { deleteLead } from "@/actions/leads"
import type { Lead } from "@prisma/client"

interface DeleteLeadDialogProps {
  lead: Lead | null
  onClose: () => void
  onSuccess?: () => void // called after successful delete (defaults to onClose)
}

export function DeleteLeadDialog({ lead, onClose, onSuccess }: DeleteLeadDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!lead) return
    startTransition(async () => {
      await deleteLead(lead.id)
      if (onSuccess) onSuccess()
      else onClose()
    })
  }

  return (
    <AlertDialog open={!!lead} onOpenChange={(open) => { if (!open) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Lead</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{lead?.name}</span>
            {lead?.companyName ? ` from ${lead.companyName}` : ""}? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
