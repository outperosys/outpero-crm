import { getLeads } from "@/actions/leads"
import { getProposals } from "@/actions/proposals"
import { getServices } from "@/actions/services"
import { getSettings } from "@/actions/settings"
import { InvoiceCreator } from "./invoice-creator"

export default async function NewInvoicePage({
  searchParams
}: {
  searchParams: Promise<{ proposalId?: string; leadId?: string }>
}) {
  const resolvedSearch = await searchParams
  const [leads, proposals, services, settings] = await Promise.all([
    getLeads(),
    getProposals(),
    getServices(),
    getSettings().catch(() => null),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = settings as any
  const bankParts: string[] = []
  if (s?.bankName)        bankParts.push(`Bank: ${s.bankName}`)
  if (s?.accountHolder)   bankParts.push(`Name: ${s.accountHolder}`)
  if (s?.accountNumber)   bankParts.push(`Account: ${s.accountNumber}`)
  if (s?.ifscCode)        bankParts.push(`IFSC: ${s.ifscCode}`)
  if (s?.upiId)           bankParts.push(`UPI: ${s.upiId}`)
  const defaultBankDetails = bankParts.length > 0
    ? bankParts.join("\n")
    : (s?.bankDetails || undefined)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
        <p className="text-muted-foreground">Generate a new payment request for a client.</p>
      </div>

      <InvoiceCreator
        leads={leads || []}
        proposals={proposals || []}
        services={services || []}
        defaultLeadId={resolvedSearch?.leadId}
        defaultProposalId={resolvedSearch?.proposalId}
        defaultBankDetails={defaultBankDetails}
        defaultTerms={s?.paymentInstructions || s?.terms || undefined}
        defaultGstNumber={s?.gstNumber || undefined}
      />
    </div>
  )
}
