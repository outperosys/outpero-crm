import { NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { prisma } from "@/lib/prisma"
import { ReceiptPdfDocument } from "@/lib/pdf/financial-document"

function slugify(text?: string) {
  if (!text) return "client"
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let receipt
  try {
    receipt = await (prisma as any).receipt.findUniqueOrThrow({ where: { id } })
  } catch {
    return new NextResponse("Receipt not found", { status: 404 })
  }

  // Fetch settings directly — no auth gate needed for PDF generation
  const settings = await (prisma as any).agencySettings.findFirst({ where: { id: "1" } }).catch(() => null)

  let buffer
  try {
    buffer = await renderToBuffer(
      ReceiptPdfDocument({
        receipt,
        business: {
          agencyName:   settings?.businessName || settings?.name || "Outpero",
          contactEmail: settings?.email         || undefined,
          website:      settings?.website       || undefined,
          address:      settings?.address       || undefined,
          logoUrl:      settings?.logoUrl       || undefined,
          primaryColor: settings?.primaryColor  || undefined,
        },
      }) as any
    )
  } catch (err) {
    console.error("PDF Render Error:", err)
    return new NextResponse("PDF generation failed", { status: 500 })
  }

  const clientSlug = slugify(receipt.companyName ?? receipt.clientName)
  const filename = `${receipt.receiptNumber}-${clientSlug}.pdf`.toLowerCase()

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
