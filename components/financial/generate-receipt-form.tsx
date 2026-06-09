"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { generateReceiptSchema } from "@/lib/validations/financial"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type GenerateReceiptFormInputValues = z.infer<typeof generateReceiptSchema>

export interface GenerateReceiptFormProps {
  onSubmit: (data: GenerateReceiptFormInputValues) => void
  onCancel: () => void
  isPending: boolean
  defaultValues?: Partial<GenerateReceiptFormInputValues>
  defaultTerms?: string
}

export function GenerateReceiptForm({
  onSubmit,
  onCancel,
  isPending,
  defaultValues,
  defaultTerms,
}: GenerateReceiptFormProps) {
  const form = useForm<GenerateReceiptFormInputValues>({
    resolver: zodResolver(generateReceiptSchema),
    defaultValues: {
      amountReceived: 0,
      paymentDate: new Date(),
      paymentMethod: "",
      transactionReference: "",
      utrNumber: "",
      services: "",
      notes: "",
      terms: defaultTerms || "",
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.error("Receipt form validation errors:", errors))} className="space-y-8">
        
        {/* PAYMENT DETAILS */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            1. Payment Details
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="amountReceived"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Received ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      value={field.value ? (field.value as unknown as Date).toISOString().split('T')[0] : ""}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Bank Transfer, Stripe, Cash" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transactionReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Reference</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. TXN-123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="utrNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UTR Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Unique Transaction Reference" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* SERVICES */}
        <section className="space-y-4 border-t pt-6">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            2. Services Paid For
          </h3>

          <FormField
            control={form.control}
            name="services"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Services Summary</FormLabel>
                <FormDescription>
                  Briefly describe what this payment covers (e.g. "50% Advance for AI Voice Agent").
                </FormDescription>
                <FormControl>
                  <Input placeholder="Services..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* NOTES & TERMS */}
        <section className="space-y-4 border-t pt-6">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            3. Notes & Information
          </h3>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g. Thank you for your payment!"
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
            {isPending ? "Generating..." : "Generate Receipt"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
