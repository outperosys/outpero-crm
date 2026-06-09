"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { generateInvoiceSchema } from "@/lib/validations/financial"
import { InvoiceType, PaymentTerms } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus } from "lucide-react"

type GenerateInvoiceFormInputValues = z.infer<typeof generateInvoiceSchema>

export interface GenerateInvoiceFormProps {
  services: any[]
  onSubmit: (data: GenerateInvoiceFormInputValues) => void
  onCancel: () => void
  isPending: boolean
  defaultValues?: Partial<GenerateInvoiceFormInputValues>
  defaultBankDetails?: string
  defaultTerms?: string
  defaultGstNumber?: string
}

export function GenerateInvoiceForm({
  services,
  onSubmit,
  onCancel,
  isPending,
  defaultValues,
  defaultBankDetails,
  defaultTerms,
  defaultGstNumber,
}: GenerateInvoiceFormProps) {
  const form = useForm<GenerateInvoiceFormInputValues>({
    resolver: zodResolver(generateInvoiceSchema),
    defaultValues: {
      type: "FULL_PAYMENT",
      paymentTerms: "DUE_ON_RECEIPT",
      gstEnabled: false,
      gstNumber: defaultGstNumber || "",
      discountAmount: 0,
      bankDetails: defaultBankDetails || "",
      terms: defaultTerms || "",
      notes: "",
      items: defaultValues?.items?.length ? defaultValues.items : [{ description: "", quantity: 1, unitPrice: 0 }],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const [catalogKey, setCatalogKey] = useState(0)
  const watchGstEnabled = form.watch("gstEnabled")

  const handleServiceSelect = (val: string) => {
    const service = services.find((s: any) => s.id === val)
    if (!service) return

    const newItem = {
      description: service.name + (service.shortDescription ? `\n${service.shortDescription}` : ""),
      quantity: 1,
      unitPrice: service.defaultPrice || service.startingPrice || 0,
    }

    // Replace the only item if it's still blank; otherwise append a new row
    const current = form.getValues("items")
    if (current.length === 1 && !current[0].description && !current[0].unitPrice) {
      form.setValue("items.0.description", newItem.description)
      form.setValue("items.0.quantity", newItem.quantity)
      form.setValue("items.0.unitPrice", newItem.unitPrice)
    } else {
      append(newItem)
    }

    // Reset dropdown to placeholder so another service can be picked immediately
    setCatalogKey((k) => k + 1)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.error("Invoice form validation errors:", errors))} className="space-y-8">
        
        {/* SETUP */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            1. Configuration
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={InvoiceType.FULL_PAYMENT}>Full Payment</SelectItem>
                      <SelectItem value={InvoiceType.ADVANCE_PAYMENT}>Advance Payment</SelectItem>
                      <SelectItem value={InvoiceType.MILESTONE_PAYMENT}>Milestone Payment</SelectItem>
                      <SelectItem value={InvoiceType.FINAL_PAYMENT}>Final Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select terms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PaymentTerms.DUE_ON_RECEIPT}>Due on Receipt</SelectItem>
                      <SelectItem value={PaymentTerms.DAYS_7}>7 Days</SelectItem>
                      <SelectItem value={PaymentTerms.DAYS_14}>14 Days</SelectItem>
                      <SelectItem value={PaymentTerms.DAYS_30}>30 Days</SelectItem>
                      <SelectItem value={PaymentTerms.CUSTOM}>Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* GST SECTION */}
        <section className="space-y-4 border-t pt-6">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            2. Tax Information (Optional)
          </h3>
          <FormField
            control={form.control}
            name="gstEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable GST on this invoice</FormLabel>
                  <FormDescription>
                    Checking this will add tax calculation.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {watchGstEnabled && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client GSTIN (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter GST number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gstPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST %</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="18" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </section>

        {/* DISCOUNT SECTION */}
        <section className="space-y-4 border-t pt-6">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            3. Discount (Optional)
          </h3>
          <FormField
            control={form.control}
            name="discountAmount"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>Discount Amount (₹)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>Leave blank or 0 for no discount.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* ITEMS SECTION */}
        <section className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              4. Line Items
            </h3>
            
            <div className="w-[260px]">
              <Select key={catalogKey} onValueChange={handleServiceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Add from service catalog…" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}{s.defaultPrice ? ` — ₹${s.defaultPrice.toLocaleString("en-IN")}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start border p-4 rounded-md bg-muted/20">
                <div className="flex-1 space-y-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description / Service</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Service details" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive mt-8"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Item
            </Button>
          </div>
        </section>

        {/* NOTES & TERMS */}
        <section className="space-y-4 border-t pt-6">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            5. Notes & Information
          </h3>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g. 50% advance before implementation"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bankDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Info / Bank Details</FormLabel>
                <FormDescription>
                  This will appear at the bottom of the invoice.
                </FormDescription>
                <FormControl>
                  <Textarea 
                    placeholder="Bank: Tech Bank&#10;Account: 1234567890&#10;Routing: 098765432" 
                    className="resize-none"
                    rows={4}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terms & Conditions</FormLabel>
                <FormControl>
                  <Textarea 
                    className="resize-none"
                    rows={4}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Generating..." : "Generate Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
