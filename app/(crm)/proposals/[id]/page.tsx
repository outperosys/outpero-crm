import { notFound } from "next/navigation"
import Link from "next/link"
import { getProposalForWorkspace } from "@/actions/proposals"
import { ProposalHeaderActions } from "@/components/proposals/workspace/proposal-header-actions"
import { ProposalWorkspace } from "@/components/proposals/workspace/proposal-workspace"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const proposal = await getProposalForWorkspace(id)
  return { title: proposal ? `${proposal.title} — Outpero CRM` : "Proposal — Outpero CRM" }
}

export default async function ProposalWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const proposal = await getProposalForWorkspace(id)

  if (!proposal) notFound()

  return (
    <div className="max-w-3xl space-y-0">
      {/* Top nav bar */}
      <div className="flex items-center justify-between py-1 mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/proposals">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Proposals
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href={`/leads/${proposal.lead.id}`}>
            {proposal.lead.name}
            {proposal.lead.companyName ? ` · ${proposal.lead.companyName}` : ""}
            <ExternalLink className="h-3 w-3 ml-1.5" />
          </Link>
        </Button>
      </div>

      {/* Document header */}
      <div className="space-y-4 pb-6">
        <ProposalHeaderActions
          proposalId={proposal.id}
          title={proposal.title}
          status={proposal.status}
          leadName={proposal.lead.name}
          leadCompany={proposal.lead.companyName}
        />

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {proposal.template && <span>{proposal.template.name}</span>}
          <span>·</span>
          <span>Created {formatDate(proposal.createdAt)}</span>
          <span>·</span>
          <span>{proposal.sections.filter((s) => s.isVisible).length} sections</span>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Workspace */}
      <ProposalWorkspace proposalId={proposal.id} sections={proposal.sections} />
    </div>
  )
}
