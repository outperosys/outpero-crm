import { getLeads } from "@/actions/leads"
import { getInvoices } from "@/actions/invoices"
import { getSettings } from "@/actions/settings"
import { ReceiptCreator } from "./receipt-creator"

export default async function NewReceiptPage({
  searchParams
}: {
  searchParams: Promise<{ invoiceId?: string; leadId?: string }>
}) {
  const resolvedSearch = await searchParams
  const [leads, invoices, settings] = await Promise.all([
    getLeads(),
    getInvoices(),
    getSettings().catch(() => null),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = settings as any

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Receipt</h1>
        <p className="text-muted-foreground">Log a payment and generate a confirmation receipt.</p>
      </div>

      <ReceiptCreator
        leads={leads || []}
        invoices={invoices || []}
        defaultLeadId={resolvedSearch?.leadId}
        defaultInvoiceId={resolvedSearch?.invoiceId}
        defaultTerms={s?.paymentInstructions || s?.terms || undefined}
      />
    </div>
  )
}
