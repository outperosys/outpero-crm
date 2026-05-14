"use client"

import Link from "next/link"

import type { ProposalWithMeta } from "@/actions/proposals"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, ArrowRight, Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { ProposalStatus } from "@prisma/client"

const STATUS_LABELS: Record<ProposalStatus, string> = {
  DRAFT: "Draft",
  REVIEW: "In Review",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
}

const STATUS_VARIANTS: Record<ProposalStatus, "secondary" | "outline" | "default" | "destructive"> = {
  DRAFT: "outline",
  REVIEW: "secondary",
  SENT: "secondary",
  ACCEPTED: "default",
  DECLINED: "destructive",
}

interface LeadProposalsSectionProps {
  proposals: ProposalWithMeta[]
  leadId: string
}

export function LeadProposalsSection({ proposals, leadId }: LeadProposalsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Proposals</h3>
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
          <Link href={`/proposals/new?leadId=${leadId}`}>
            <Plus className="h-3 w-3" />
            New
          </Link>
        </Button>
      </div>

      {proposals.length === 0 ? (
        <div className="rounded-lg border border-dashed py-6 text-center">
          <FileText className="size-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">No proposals yet</p>
          <Button asChild variant="ghost" size="sm" className="mt-2 text-xs h-7">
            <Link href={`/proposals/new?leadId=${leadId}`}>Generate first proposal</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {proposals.map((p) => (
            <Link
              key={p.id}
              href={`/proposals/${p.id}`}
              className="group flex items-center gap-3 rounded-md border bg-card px-3 py-2.5 hover:border-foreground/20 transition-colors"
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={STATUS_VARIANTS[p.status]} className="text-xs">
                  {STATUS_LABELS[p.status]}
                </Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
