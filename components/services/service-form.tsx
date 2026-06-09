"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  SERVICE_STATUSES,
  serviceSchema,
  type ServiceFormValues,
} from "@/lib/validations/service"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface ServiceFormProps {
  defaultValues?: Partial<ServiceFormValues>
  onSubmit: (data: ServiceFormValues) => Promise<void>
  onCancel: () => void
  isPending?: boolean
}

export function ServiceForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
}: ServiceFormProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      category: "",
      status: "ACTIVE",
      shortDescription: "",
      fullDescription: "",
      startingPrice: undefined,
      defaultPrice: undefined,
      pricingNotes: "",
      timeline: "",
      deliverables: "",
      implementationSteps: "",
      idealClient: "",
      problemsSolved: "",
      commonObjections: "",
      aiContext: "",
      proposalInstructions: "",
      followUpInstructions: "",
      proposalDefaults: "",
      invoiceDefaults: "",
      notes: "",
      ...defaultValues,
    },
  })

  function priceField(
    name: "startingPrice" | "defaultPrice",
    label: string,
    placeholder: string
  ) {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder={placeholder}
                value={field.value ?? ""}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === "" ? undefined : event.target.value
                  )
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  function textAreaField(
    name: keyof ServiceFormValues,
    label: string,
    placeholder: string
  ) {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={placeholder}
                className="min-h-24"
                {...field}
                value={(field.value as string | undefined) ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Core Info
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="AI Voice Receptionist" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="AI Voice Agents" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SERVICE_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {textAreaField(
            "shortDescription",
            "Short Description",
            "One or two lines used in proposals, invoices, and service selectors."
          )}
          {textAreaField(
            "fullDescription",
            "Full Description",
            "Detailed explanation of the service scope and positioning."
          )}
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pricing
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {priceField("startingPrice", "Starting Price", "1500")}
            {priceField("defaultPrice", "Default Price", "2500")}
          </div>
          {textAreaField(
            "pricingNotes",
            "Pricing Notes",
            "Retainers, setup fees, exclusions, or pricing assumptions."
          )}
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Delivery
          </p>
          {textAreaField("timeline", "Timeline", "Typical delivery window.")}
          {textAreaField(
            "deliverables",
            "Deliverables",
            "Reusable deliverables for proposals and invoices."
          )}
          {textAreaField(
            "implementationSteps",
            "Implementation Steps",
            "Discovery, setup, testing, handoff, and optimization steps."
          )}
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sales
          </p>
          {textAreaField("idealClient", "Ideal Client", "Who this is best for.")}
          {textAreaField(
            "problemsSolved",
            "Problems Solved",
            "Operational pain points this service addresses."
          )}
          {textAreaField(
            "commonObjections",
            "Common Objections",
            "Price, timing, trust, complexity, and change-management objections."
          )}
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            AI
          </p>
          {textAreaField(
            "aiContext",
            "AI Context",
            "Compact service facts the AI should know before writing."
          )}
          {textAreaField(
            "proposalInstructions",
            "Proposal Instructions",
            "How this service should be positioned in proposals."
          )}
          {textAreaField(
            "followUpInstructions",
            "Follow-up Instructions",
            "How to follow up when this service is relevant."
          )}
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Templates
          </p>
          {textAreaField(
            "proposalDefaults",
            "Proposal Defaults",
            "Default scope, pricing, or copy snippets for proposal sections."
          )}
          {textAreaField(
            "invoiceDefaults",
            "Invoice Defaults",
            "Default invoice description, line item wording, and billing notes."
          )}
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Internal
          </p>
          {textAreaField("notes", "Notes", "Private service notes.")}
        </section>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Service"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
