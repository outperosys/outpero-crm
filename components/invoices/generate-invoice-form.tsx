"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generateInvoiceFormSchema, type GenerateInvoiceFormInputValues } from "@/lib/validations/invoice"
import { InvoiceType, PaymentTerms, type Service } from "@prisma/client"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

interface GenerateInvoiceFormProps {
  defaultValues: Partial<GenerateInvoiceFormInputValues>
  onSubmit: (data: GenerateInvoiceFormInputValues) => Promise<void>
  onCancel: () => void
  isPending?: boolean
  services?: Service[]
  isEditing?: boolean
  defaultLeadId?: string
  defaultProposalId?: string
  defaultBankDetails?: string
  defaultTerms?: string
}

export function GenerateInvoiceForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  services = [],
  isEditing = false,
  defaultLeadId,
  defaultProposalId,
  defaultBankDetails,
  defaultTerms,
}: GenerateInvoiceFormProps) {
  const form = useForm<GenerateInvoiceFormInputValues>({
    resolver: zodResolver(generateInvoiceFormSchema),
    defaultValues: {
      documentType: "INVOICE",
      type: "ONE_TIME_PROJECT",
      paymentTerms: "DUE_ON_RECEIPT",
      gstEnabled: false,
      gstPercentage: 0,
      bankDetails: defaultBankDetails || "",
      terms: defaultTerms || "",
      gstNumber: "",
      notes: "",
      items: defaultValues.items?.length ? defaultValues.items : [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
      paymentDetails: defaultValues.paymentDetails ?? {
        amount: undefined,
        mode: "",
        transactionReference: "",
        paymentDate: new Date(),
      },
      ...defaultValues,
    },
  })

  const docType = form.watch("documentType")
  const isReceipt = docType === "RECEIPT"

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const gstEnabled = form.watch("gstEnabled")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        
        {/* SETUP */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            1. Configuration
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INVOICE">Invoice</SelectItem>
                      <SelectItem value="RECEIPT">Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <SelectItem value={InvoiceType.ONE_TIME_PROJECT}>One-Time Project</SelectItem>
                      <SelectItem value={InvoiceType.MONTHLY_RETAINER}>Monthly Retainer</SelectItem>
                      <SelectItem value={InvoiceType.SETUP_FEE}>Setup Fee</SelectItem>
                      <SelectItem value={InvoiceType.CUSTOM}>Custom</SelectItem>
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

          <div className="space-y-4 border rounded-md p-4 bg-muted/10">
            <FormField
              control={form.control}
              name="gstEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      GST Enabled?
                    </FormLabel>
                    <FormDescription>
                      Check this to apply GST to the subtotal.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {gstEnabled && (
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <FormField
                  control={form.control}
                  name="gstNumber"
                  render={({ field }) => (
                     <FormItem>
                      <FormLabel>Client GST Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 22AAAAA0000A1Z5" {...field} />
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
                      <FormLabel>GST Percentage (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="18" 
                          value={field.value ?? ""}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        </section>

        {/* LINE ITEMS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              2. Line Items
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: "", quantity: 1, unitPrice: 0, total: 0 })}
              className="h-8 gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3 border rounded-md p-3 bg-muted/5">
                <div className="flex-1 space-y-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field: descField }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Item Description" 
                              {...descField} 
                            />
                            {services.length > 0 && (
                              <Select 
                                onValueChange={(val) => {
                                  descField.onChange(val)
                                  const svc = services.find(s => s.name === val)
                                  if (svc) {
                                    const price = svc.defaultPrice || svc.startingPrice || 0
                                    form.setValue(`items.${index}.unitPrice`, price)
                                    const qty = form.getValues(`items.${index}.quantity`) || 1
                                    form.setValue(`items.${index}.total`, price * qty)
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[180px] shrink-0">
                                  <SelectValue placeholder="Catalog" />
                                </SelectTrigger>
                                <SelectContent>
                                  {services.map(s => (
                                    <SelectItem key={s.id} value={s.name}>
                                      {s.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field: qtyField }) => (
                        <FormItem className="w-24">
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Qty" 
                              min="1"
                              value={qtyField.value}
                              onChange={e => {
                                const val = parseInt(e.target.value) || 0
                                qtyField.onChange(val)
                                const price = form.getValues(`items.${index}.unitPrice`)
                                form.setValue(`items.${index}.total`, val * price)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field: priceField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="Price" 
                              value={priceField.value}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0
                                priceField.onChange(val)
                                const qty = form.getValues(`items.${index}.quantity`)
                                form.setValue(`items.${index}.total`, qty * val)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* PAYMENT DETAILS */}
        {!isEditing && (
          <section className="space-y-4 border-t pt-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                3. Initial Payment (Optional)
              </p>
              <p className="text-sm text-muted-foreground">
                If the client has already paid, record the details here so the invoice acts as a receipt.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 border rounded-md p-4 bg-muted/10">
              <FormField
                control={form.control}
                name="paymentDetails.amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Received</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        value={field.value ?? ""}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDetails.mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Mode</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="e.g. Bank Transfer, UPI..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDetails.transactionReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction ID / Ref</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. TXN12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDetails.paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? field.value.toISOString().split('T')[0] : ""}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>
        )}

        {/* NOTES */}
        <section className="space-y-4 border-t pt-6">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>4. Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g. Thank you for your business!"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isReceipt && (
            <FormField
              control={form.control}
              name="bankDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Info / Bank Details</FormLabel>
                  <FormDescription>
                    This will appear at the bottom of the invoice. You can edit this per-invoice if needed.
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
          )}

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terms & Conditions</FormLabel>
                <FormDescription>
                  Standard terms added to the bottom of the document.
                </FormDescription>
                <FormControl>
                  <Textarea 
                    placeholder="1. Payment is due within 14 days." 
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
            {isPending ? (isEditing ? "Saving..." : "Creating Invoice...") : (isEditing ? "Save Changes" : "Generate Invoice")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
