"use client"

import { useMemo, useState } from "react"
import { Edit, ListTodo, Search, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { SERVICE_STATUSES } from "@/lib/validations/service"
import { EditServiceDialog } from "./edit-service-dialog"
import { DeleteServiceDialog } from "./delete-service-dialog"
import { TaskDialog } from "@/components/tasks/task-dialog"
import type { Service, ServiceStatus } from "@prisma/client"

interface ServicesCatalogClientProps {
  services: Service[]
  serviceOrdering?: string
  featuredServiceIds?: string[]
  teamMembers?: { id: string; name: string }[]
}

const STATUS_LABELS: Record<ServiceStatus, string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
}

const STATUS_VARIANTS: Record<
  ServiceStatus,
  "secondary" | "outline" | "default"
> = {
  ACTIVE: "default",
  DRAFT: "secondary",
  ARCHIVED: "outline",
}

function fieldBlock(label: string, value: string | null) {
  if (!value) return null

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="whitespace-pre-wrap text-sm leading-6">{value}</p>
    </div>
  )
}

function priceLabel(service: Service) {
  if (service.defaultPrice !== null) {
    return formatCurrency(service.defaultPrice)
  }

  if (service.startingPrice !== null) {
    return `Starts at ${formatCurrency(service.startingPrice)}`
  }

  return "Pricing unset"
}

export function ServicesCatalogClient({ services, serviceOrdering = "manual", featuredServiceIds = [], teamMembers = [] }: ServicesCatalogClientProps) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<ServiceStatus | "ALL">("ALL")
  const [category, setCategory] = useState("ALL")
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingService, setDeletingService] = useState<Service | null>(null)

  const categories = useMemo(
    () => Array.from(new Set(services.map((service) => service.category))).sort(),
    [services]
  )

  const sortedServices = useMemo(() => {
    const copy = [...services]
    if (serviceOrdering === "alphabetical") {
      copy.sort((a, b) => a.name.localeCompare(b.name))
    } else if (serviceOrdering === "price_asc") {
      copy.sort((a, b) => (a.defaultPrice ?? a.startingPrice ?? 0) - (b.defaultPrice ?? b.startingPrice ?? 0))
    } else if (serviceOrdering === "price_desc") {
      copy.sort((a, b) => (b.defaultPrice ?? b.startingPrice ?? 0) - (a.defaultPrice ?? a.startingPrice ?? 0))
    }
    return copy
  }, [services, serviceOrdering])

  const filteredServices = sortedServices.filter((service) => {
    const searchable = [
      service.name,
      service.category,
      service.shortDescription,
      service.fullDescription,
      service.deliverables,
      service.idealClient,
      service.problemsSolved,
      service.aiContext,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return (
      searchable.includes(query.toLowerCase()) &&
      (status === "ALL" || service.status === status) &&
      (category === "ALL" || service.category === category)
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search services, deliverables, problems, or AI context"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as ServiceStatus | "ALL")}
        >
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {SERVICE_STATUSES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {categories.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredServices.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="font-medium">No services found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adjust the search or filters, or add a new catalog service.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filteredServices.map((service) => (
          <article
            key={service.id}
            className="rounded-lg border bg-card p-4 transition-colors hover:border-foreground/20"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold">{service.name}</h2>
                  <Badge variant={STATUS_VARIANTS[service.status]}>
                    {STATUS_LABELS[service.status]}
                  </Badge>
                  <Badge variant="outline">{service.category}</Badge>
                  {featuredServiceIds.includes(service.id) && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                </div>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  {service.shortDescription}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                <p className="mr-auto text-sm font-medium sm:mr-2">
                  {priceLabel(service)}
                </p>
                <TaskDialog
                  defaultRelatedType="SERVICE"
                  defaultRelatedId={service.id}
                  lockRelated
                  teamMembers={teamMembers}
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <ListTodo className="size-4" />
                      <span className="sr-only">Add task</span>
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditingService(service)}
                >
                  <Edit className="size-4" />
                  <span className="sr-only">Edit service</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeletingService(service)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete service</span>
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 border-t pt-4 lg:grid-cols-3">
              <div className="space-y-4">
                {fieldBlock("Pricing Notes", service.pricingNotes)}
                {fieldBlock("Timeline", service.timeline)}
                {fieldBlock("Deliverables", service.deliverables)}
                {fieldBlock("Implementation Steps", service.implementationSteps)}
              </div>
              <div className="space-y-4">
                {fieldBlock("Ideal Client", service.idealClient)}
                {fieldBlock("Problems Solved", service.problemsSolved)}
                {fieldBlock("Common Objections", service.commonObjections)}
              </div>
              <div className="space-y-4">
                {fieldBlock("AI Context", service.aiContext)}
                {fieldBlock(
                  "Proposal Instructions",
                  service.proposalInstructions
                )}
                {fieldBlock(
                  "Follow-up Instructions",
                  service.followUpInstructions
                )}
                {fieldBlock("Proposal Defaults", service.proposalDefaults)}
                {fieldBlock("Invoice Defaults", service.invoiceDefaults)}
              </div>
            </div>
          </article>
        ))}
      </div>

      <EditServiceDialog
        service={editingService}
        onClose={() => setEditingService(null)}
      />
      <DeleteServiceDialog
        service={deletingService}
        onClose={() => setDeletingService(null)}
      />
    </div>
  )
}
