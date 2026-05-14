import Link from "next/link"
import { getProposals } from "@/actions/proposals"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { FileText, Plus, ArrowRight } from "lucide-react"
import type { ProposalStatus } from "@prisma/client"

export const metadata = { title: "Proposals — Outpero CRM" }

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

export default async function ProposalsPage() {
  const proposals = await getProposals()

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proposals</h1>
          <p className="text-sm text-muted-foreground">
            {proposals.length === 0
              ? "No proposals yet"
              : `${proposals.length} ${proposals.length === 1 ? "proposal" : "proposals"}`}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/proposals/new">
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {proposals.length === 0 && (
        <div className="rounded-lg border border-dashed p-16 text-center">
          <FileText className="size-8 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">No proposals yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate your first AI proposal from a lead and template
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/proposals/new">
              <Plus className="h-4 w-4 mr-2" />
              New Proposal
            </Link>
          </Button>
        </div>
      )}

      {/* Proposals list */}
      {proposals.length > 0 && (
        <div className="space-y-2">
          {proposals.map((proposal) => (
            <Link
              key={proposal.id}
              href={`/proposals/${proposal.id}`}
              className="group flex items-center gap-4 rounded-lg border bg-card px-4 py-3.5 hover:border-foreground/20 transition-colors"
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{proposal.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {proposal.lead.name}
                  {proposal.lead.companyName ? ` · ${proposal.lead.companyName}` : ""}
                  {" · "}
                  {formatDate(proposal.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={STATUS_VARIANTS[proposal.status]}>
                  {STATUS_LABELS[proposal.status]}
                </Badge>
                {proposal.totalValue && (
                  <span className="text-sm text-muted-foreground">
                    ${proposal.totalValue.toLocaleString()}
                  </span>
                )}
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
