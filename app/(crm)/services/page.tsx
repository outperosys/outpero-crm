import { Wrench } from "lucide-react"
import { getServices } from "@/actions/services"
import { getSettings, getTeamMembers } from "@/actions/settings"
import { Badge } from "@/components/ui/badge"
import { CreateServiceDialog } from "@/components/services/create-service-dialog"
import { ServicesCatalogClient } from "@/components/services/services-catalog-client"

export const metadata = { title: "Services - Outpero CRM" }

export default async function ServicesPage() {
  const [services, settings, teamMembers] = await Promise.all([
    getServices(),
    getSettings().catch(() => null),
    getTeamMembers().catch(() => []),
  ])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = settings as any
  const serviceOrdering: string = s?.serviceOrdering || "manual"
  const featuredServiceIds: string[] = Array.isArray(s?.featuredServiceIds) ? s.featuredServiceIds : []
  const activeCount = services.filter((service) => service.status === "ACTIVE").length
  const draftCount = services.filter((service) => service.status === "DRAFT").length
  const categories = new Set(services.map((service) => service.category)).size

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground">
            Central catalog for proposals, invoices, AI context, and service
            positioning.
          </p>
        </div>
        <CreateServiceDialog />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active Services</p>
          <p className="mt-1 text-2xl font-semibold">{activeCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Drafts</p>
          <p className="mt-1 text-2xl font-semibold">{draftCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Categories</p>
          <p className="mt-1 text-2xl font-semibold">{categories}</p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="rounded-lg border border-dashed p-16 text-center">
          <Wrench className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">No services yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Add your first catalog service so proposals, invoices, and AI
            generation can reuse the same source of truth.
          </p>
          <div className="mt-4">
            <CreateServiceDialog />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Proposal-ready context</Badge>
            <Badge variant="outline">Invoice defaults</Badge>
            <Badge variant="outline">AI instructions</Badge>
            <Badge variant="outline">Sales positioning</Badge>
          </div>
          <ServicesCatalogClient services={services} serviceOrdering={serviceOrdering} featuredServiceIds={featuredServiceIds} teamMembers={teamMembers} />
        </>
      )}
    </div>
  )
}
