"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditLeadDialog } from "@/components/leads/edit-lead-dialog"
import { DeleteLeadDialog } from "@/components/leads/delete-lead-dialog"
import type { Lead } from "@prisma/client"

export function EditDeleteButtons({ lead }: { lead: Lead }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setEditOpen(true)}
      >
        <Pencil className="size-3.5" />
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="size-3.5" />
        Delete
      </Button>

      <EditLeadDialog
        lead={editOpen ? lead : null}
        onClose={() => setEditOpen(false)}
      />
      <DeleteLeadDialog
        lead={deleteOpen ? lead : null}
        onClose={() => setDeleteOpen(false)}
        onSuccess={() => router.push("/leads")}
      />
    </>
  )
}
