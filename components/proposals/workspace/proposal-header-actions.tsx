"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import {
  updateProposalStatus,
  updateProposalTitle,
  deleteProposal,
} from "@/actions/proposals"
import type { ProposalStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Trash2, Pencil, Check, X, Download, Loader2 } from "lucide-react"

const STATUS_OPTIONS: { value: ProposalStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "REVIEW", label: "In Review" },
  { value: "SENT", label: "Sent" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "DECLINED", label: "Declined" },
]

const STATUS_COLORS: Record<ProposalStatus, string> = {
  DRAFT: "text-muted-foreground",
  REVIEW: "text-amber-600 dark:text-amber-400",
  SENT: "text-blue-600 dark:text-blue-400",
  ACCEPTED: "text-green-600 dark:text-green-400",
  DECLINED: "text-red-600 dark:text-red-400",
}

interface ProposalHeaderActionsProps {
  proposalId: string
  title: string
  status: ProposalStatus
  leadName: string
  leadCompany: string | null
}

function toFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60)
}

export function ProposalHeaderActions({ proposalId, title, status, leadName, leadCompany }: ProposalHeaderActionsProps) {
  const downloadFilename = `${toFilename(leadCompany ?? leadName)}-proposal.pdf`
  const [isPending, startTransition] = useTransition()
  const [editingTitle, setEditingTitle] = useState(false)
  const [draftTitle, setDraftTitle] = useState(title)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const router = useRouter()

  async function handleExportPdf() {
    setIsExporting(true)
    setExportError(null)
    try {
      const res = await fetch(`/api/proposals/${proposalId}/pdf`)
      const contentType = res.headers.get("content-type") ?? ""

      if (!res.ok || !contentType.includes("application/pdf")) {
        const text = await res.text()
        setExportError(`Export failed: ${text.slice(0, 120)}`)
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = downloadFilename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setExportError(`Export failed — ${err instanceof Error ? err.message : "please try again"}`)
    } finally {
      setIsExporting(false)
    }
  }

  function handleStatusChange(val: string) {
    startTransition(async () => {
      await updateProposalStatus(proposalId, val as ProposalStatus)
    })
  }

  function handleTitleSave() {
    if (!draftTitle.trim()) return
    startTransition(async () => {
      await updateProposalTitle(proposalId, draftTitle)
      setEditingTitle(false)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteProposal(proposalId)
      router.push("/proposals")
    })
  }

  return (
    <div className="space-y-1.5">
      {/* Title */}
      {editingTitle ? (
        <div className="flex items-center gap-2">
          <Input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            className="text-xl font-semibold h-9 max-w-lg"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSave()
              if (e.key === "Escape") { setDraftTitle(title); setEditingTitle(false) }
            }}
          />
          <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleTitleSave} disabled={isPending}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setDraftTitle(title); setEditingTitle(false) }}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="group flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
            onClick={() => setEditingTitle(true)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Status + Delete row */}
      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
          <SelectTrigger className={`h-7 w-36 text-xs border-0 bg-transparent px-0 shadow-none focus:ring-0 ${STATUS_COLORS[status]}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-sm">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground text-xs">·</span>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              disabled={isPending}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this proposal?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the proposal and all its sections. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete proposal
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {exportError && (
          <span className="text-xs text-destructive ml-1">{exportError}</span>
        )}

        <span className="text-muted-foreground text-xs">·</span>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground"
          onClick={handleExportPdf}
          disabled={isPending || isExporting}
          type="button"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Exporting…
            </>
          ) : (
            <>
              <Download className="h-3 w-3 mr-1" />
              Export PDF
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
