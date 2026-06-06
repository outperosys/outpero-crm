import React from "react"
import { type NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { InvoicePdfDocument } from "@/lib/pdf/invoice-document"

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // ── Fetch invoice ────────────────────────────────────────────────────────
  const { id } = await params
  let invoice: Awaited<ReturnType<typeof prisma.invoice.findUnique>> & {
    items: Awaited<ReturnType<typeof prisma.invoiceItem.findMany>>
  } | null

  try {
    invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
      },
    }) as typeof invoice
  } catch {
    return new NextResponse("Database error", { status: 500 })
  }

  if (!invoice) {
    return new NextResponse("Invoice not found", { status: 404 })
  }

  // ── Render PDF ────────────────────────────────────────────────────────────
  let buffer: Buffer
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buffer = await renderToBuffer(
      React.createElement(InvoicePdfDocument, {
        invoice: invoice as Parameters<typeof InvoicePdfDocument>[0]["invoice"],
        business: { 
          agencyName: "Outpero",
          contactEmail: "hello@outpero.com",
          website: "outpero.com",
          address: "123 Automation Lane, AI City",
          bankDetails: "Bank: Tech Bank\nAccount: 1234567890\nRouting: 098765432"
        },
      }) as any
    )
  } catch (err) {
    console.error("[PDF export error]", err)
    return new NextResponse("PDF generation failed", { status: 500 })
  }

  // ── File naming: INV-0001-client-name.pdf ────────────────────────────────
  const clientSlug = slugify(invoice.companyName ?? invoice.clientName)
  const filename = `${invoice.invoiceNumber}-${clientSlug}.pdf`.toLowerCase()

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
