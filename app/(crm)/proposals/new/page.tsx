import Link from "next/link"
import { getLeads } from "@/actions/leads"
import { getProposalTemplates } from "@/actions/proposal-templates"
import { GenerateProposalForm } from "@/components/proposals/generate-proposal-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "New Proposal — Outpero CRM" }

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>
}) {
  const { leadId: defaultLeadId } = await searchParams
  const [leads, templates] = await Promise.all([
    getLeads(),
    getProposalTemplates(),
  ])

  const leadOptions = leads.map((l) => ({
    id: l.id,
    name: l.name,
    companyName: l.companyName,
  }))

  return (
    <div className="max-w-lg space-y-8">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link href="/proposals">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Proposals
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Proposal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a lead and template — AI will generate the proposal sections.
        </p>
      </div>

      {/* No leads state */}
      {leads.length === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">No leads yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add a lead before generating a proposal.
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/leads">Go to Leads</Link>
          </Button>
        </div>
      )}

      {/* No templates state */}
      {templates.length === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">No proposal templates</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a template before generating a proposal.
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/templates">Go to Templates</Link>
          </Button>
        </div>
      )}

      {/* Generation form */}
      {leads.length > 0 && templates.length > 0 && (
        <GenerateProposalForm leads={leadOptions} templates={templates} defaultLeadId={defaultLeadId} />
      )}
    </div>
  )
}
