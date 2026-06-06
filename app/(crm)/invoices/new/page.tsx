import Link from "next/link"
import { getLeads } from "@/actions/leads"
import { getProposals } from "@/actions/proposals"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { InvoiceCreator } from "./invoice-creator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "New Invoice — Outpero CRM" }

async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string; proposalId?: string }>
}) {
  await requireAuth()
  const { leadId: defaultLeadId, proposalId: defaultProposalId } = await searchParams
  
  const [leads, proposals] = await Promise.all([
    getLeads(),
    prisma.proposal.findMany({
      include: {
        lead: { select: { id: true, name: true, companyName: true } },
        template: { select: { id: true, name: true } },
        sections: { where: { isVisible: true }, orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    })
  ])

  return (
    <div className="max-w-xl space-y-8">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link href="/invoices">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Invoices
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Generate Invoice</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a proposal to auto-fill line items, or start manually.
        </p>
      </div>

      <InvoiceCreator 
        leads={leads} 
        proposals={proposals as any} 
        defaultLeadId={defaultLeadId}
        defaultProposalId={defaultProposalId}
      />
    </div>
  )
}
