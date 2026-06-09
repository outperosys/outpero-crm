import { NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { prisma } from "@/lib/prisma"
import { InvoicePdfDocument } from "@/lib/pdf/financial-document"

function slugify(text?: string) {
  if (!text) return "client"
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let invoice
  try {
    invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id },
      include: {
        items: true,
        proposal: { select: { title: true } },
        lead: { select: { name: true } },
      },
    }) as any
  } catch {
    return new NextResponse("Invoice not found", { status: 404 })
  }

  // Fetch settings directly — no auth gate needed for PDF generation
  const settings = await (prisma as any).agencySettings.findFirst({ where: { id: "1" } }).catch(() => null)

  // Sum receipts
  let totalPaid = 0
  try {
    const receipts = await (prisma as any).receipt.findMany({ where: { invoiceId: id } })
    totalPaid = receipts.reduce((sum: number, r: any) => sum + r.amountReceived, 0)
  } catch {
    // receipts table not yet migrated — totalPaid stays 0
  }

  // Build structured bank details, falling back to legacy free-text or invoice snapshot
  const bankParts: string[] = []
  if (settings?.bankName)      bankParts.push(`Bank: ${settings.bankName}`)
  if (settings?.accountHolder) bankParts.push(`Name: ${settings.accountHolder}`)
  if (settings?.accountNumber) bankParts.push(`Account: ${settings.accountNumber}`)
  if (settings?.ifscCode)      bankParts.push(`IFSC: ${settings.ifscCode}`)
  if (settings?.upiId)         bankParts.push(`UPI: ${settings.upiId}`)
  const bankDetails = bankParts.length > 0
    ? bankParts.join("\n")
    : (invoice.bankDetails || settings?.bankDetails || "")

  let buffer
  try {
    buffer = await renderToBuffer(
      InvoicePdfDocument({
        invoice,
        business: {
          agencyName:   settings?.businessName || settings?.name || "Outpero",
          contactEmail: settings?.email         || undefined,
          website:      settings?.website       || undefined,
          address:      settings?.address       || undefined,
          gstNumber:    settings?.gstNumber     || undefined,
          bankDetails,
          logoUrl:      settings?.logoUrl       || undefined,
          primaryColor: settings?.primaryColor  || undefined,
        },
        totalPaid,
      }) as any
    )
  } catch (err: any) {
    const msg = err?.message ?? String(err)
    console.error("PDF Render Error:", msg, err?.stack)
    return new NextResponse(`PDF generation failed: ${msg}`, { status: 500 })
  }

  const clientSlug = slugify(invoice.companyName ?? invoice.clientName)
  const filename = `${invoice.invoiceNumber}-${clientSlug}.pdf`.toLowerCase()

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
