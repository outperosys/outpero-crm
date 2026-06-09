import React from "react"
import { type NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { ProposalPdfDocument } from "@/lib/pdf/proposal-document"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

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

  // ── Fetch proposal ────────────────────────────────────────────────────────
  const { id } = await params
  let proposal: Awaited<ReturnType<typeof prisma.proposal.findUnique>> & {
    lead: { id: string; name: string; companyName: string | null }
    template: { id: string; name: string } | null
    sections: Awaited<ReturnType<typeof prisma.proposalSection.findMany>>
  } | null

  try {
    proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        lead: { select: { id: true, name: true, companyName: true } },
        template: { select: { id: true, name: true } },
        sections: { orderBy: { order: "asc" } },
      },
    }) as typeof proposal
  } catch {
    return new NextResponse("Database error", { status: 500 })
  }

  if (!proposal) {
    return new NextResponse("Proposal not found", { status: 404 })
  }

  // ── Validate sections ─────────────────────────────────────────────────────
  if (!proposal.sections || proposal.sections.length === 0) {
    return new NextResponse("Proposal has no sections to export", { status: 422 })
  }

  // ── Fetch agency settings ─────────────────────────────────────────────────
  const s = await db.agencySettings.findUnique({ where: { id: "1" } }).catch(() => null)

  // ── Render PDF ────────────────────────────────────────────────────────────
  let buffer: Buffer
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buffer = await renderToBuffer(
      React.createElement(ProposalPdfDocument, {
        proposal: proposal as Parameters<typeof ProposalPdfDocument>[0]["proposal"],
        business: {
          agencyName:   s?.businessName  || "Outpero",
          contactEmail: s?.email         || undefined,
          website:      s?.website       || undefined,
          logoUrl:      s?.logoUrl       || undefined,
          primaryColor: s?.primaryColor  || undefined,
        },
      }) as any
    )
  } catch (err) {
    console.error("[PDF export error]", err)
    return new NextResponse("PDF generation failed", { status: 500 })
  }

  // ── File naming: client-name-proposal.pdf ────────────────────────────────
  const clientSlug = slugify(proposal.lead.companyName ?? proposal.lead.name)
  const filename = `${clientSlug}-proposal.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
