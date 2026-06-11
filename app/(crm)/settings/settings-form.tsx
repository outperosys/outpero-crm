"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Plus, Trash2, Power, Pencil, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  updateBusinessSettings,
  updateBrandingSettings,
  updatePaymentSettings,
  updateAISettings,
  updateServicePreferences,
  updatePipelineSettings,
  createTeamMember,
  toggleTeamMemberActive,
  deleteTeamMember,
  type TeamMember,
} from "@/actions/settings"
import { createTag, updateTag, deleteTag } from "@/actions/tags"
import { tagSchema, type TagValues } from "@/lib/validations/tag"
import { TAG_COLORS, tagColorClasses, tagColorDot } from "@/lib/tag-colors"
import {
  businessSettingsSchema,
  brandingSettingsSchema,
  paymentSettingsSchema,
  aiSettingsSchema,
  TONE_OPTIONS,
  PROPOSAL_STYLE_OPTIONS,
  FOLLOW_UP_STYLE_OPTIONS,
  SERVICE_ORDERING_OPTIONS,
  PIPELINE_STAGE_KEYS,
  DEFAULT_STAGE_LABELS,
  teamMemberSchema,
  type BusinessSettingsValues,
  type BrandingSettingsValues,
  type PaymentSettingsValues,
  type AISettingsValues,
  type TeamMemberValues,
} from "@/lib/validations/settings"
import type { AgencySettings, Tag } from "@prisma/client"

// ─── Types ────────────────────────────────────────────────────────────────────

type Service = { id: string; name: string; category: string }

interface SettingsClientProps {
  settings: AgencySettings
  teamMembers: TeamMember[]
  services: Service[]
  tags: Tag[]
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

const NAV = [
  { key: "business",  label: "Business" },
  { key: "branding",  label: "Branding" },
  { key: "payments",  label: "Payments" },
  { key: "ai",        label: "AI Settings" },
  { key: "services",  label: "Services" },
  { key: "pipeline",  label: "Pipeline" },
  { key: "team",      label: "Team" },
  { key: "tags",      label: "Tags" },
] as const

type NavKey = typeof NAV[number]["key"]

// ─── Shared primitives ────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error"

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="pb-4 border-b">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  )
}

function SaveRow({ status, isPending }: { status: SaveStatus; isPending: boolean }) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div className="text-sm">
        {status === "saved" && (
          <span className="flex items-center gap-1.5 text-emerald-600">
            <Check className="size-3.5" /> Saved
          </span>
        )}
        {status === "error" && (
          <span className="text-destructive">Failed to save — try again</span>
        )}
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </div>
  )
}

function ColorField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string
}) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="flex items-center gap-2">
        <div
          className="h-9 w-9 shrink-0 rounded-md border"
          style={{ backgroundColor: value || "transparent" }}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </FormItem>
  )
}

// ─── Business ─────────────────────────────────────────────────────────────────

function BusinessSection({ settings }: { settings: AgencySettings }) {
  const [status, setStatus] = useState<SaveStatus>("idle")
  const [, startTransition] = useTransition()
  const s = settings as any // eslint-disable-line @typescript-eslint/no-explicit-any

  const form = useForm<BusinessSettingsValues>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      businessName: s.businessName ?? "",
      website:      s.website      ?? "",
      email:        s.email        ?? "",
      phone:        s.phone        ?? "",
      address:      s.address      ?? "",
      gstNumber:    s.gstNumber    ?? "",
      tagline:      s.tagline      ?? "",
    },
  })

  function onSubmit(data: BusinessSettingsValues) {
    setStatus("saving")
    startTransition(async () => {
      const res = await updateBusinessSettings(data)
      setStatus(res.success ? "saved" : "error")
      if (res.success) setTimeout(() => setStatus("idle"), 2500)
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Business" description="Core agency details used across all documents and AI outputs" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="businessName" render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl><Input placeholder="Outpero" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="tagline" render={({ field }) => (
              <FormItem>
                <FormLabel>Tagline</FormLabel>
                <FormControl><Input placeholder="AI automation for growing businesses" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="hello@outpero.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="website" render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl><Input placeholder="https://outpero.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl><Textarea placeholder="123 Street, City, State, PIN" rows={2} className="resize-none" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="gstNumber" render={({ field }) => (
            <FormItem>
              <FormLabel>GST Number</FormLabel>
              <FormControl><Input placeholder="22AAAAA0000A1Z5" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <SaveRow status={status} isPending={form.formState.isSubmitting} />
        </form>
      </Form>
    </div>
  )
}

// ─── Branding ─────────────────────────────────────────────────────────────────

function BrandingSection({ settings }: { settings: AgencySettings }) {
  const [status, setStatus] = useState<SaveStatus>("idle")
  const [, startTransition] = useTransition()
  const s = settings as any // eslint-disable-line @typescript-eslint/no-explicit-any

  const form = useForm<BrandingSettingsValues>({
    resolver: zodResolver(brandingSettingsSchema),
    defaultValues: {
      logoUrl:          s.logoUrl          ?? "",
      primaryColor:     s.primaryColor     ?? "",
      secondaryColor:   s.secondaryColor   ?? "",
      accentColor:      s.accentColor      ?? "",
      brandDescription: s.brandDescription ?? "",
    },
  })

  function onSubmit(data: BrandingSettingsValues) {
    setStatus("saving")
    startTransition(async () => {
      const res = await updateBrandingSettings(data)
      setStatus(res.success ? "saved" : "error")
      if (res.success) setTimeout(() => setStatus("idle"), 2500)
    })
  }

  const watchColors = form.watch(["primaryColor", "secondaryColor", "accentColor"])

  return (
    <div className="space-y-6">
      <SectionHeader title="Branding" description="Visual identity used in PDFs and client-facing documents" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="logoUrl" render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormDescription>Direct link to your logo image (PNG/SVG recommended)</FormDescription>
              <FormControl><Input placeholder="https://outpero.com/logo.png" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-3 gap-4">
            <FormField control={form.control} name="primaryColor" render={({ field }) => (
              <ColorField label="Primary" value={field.value ?? ""} onChange={field.onChange} placeholder="#111827" />
            )} />
            <FormField control={form.control} name="secondaryColor" render={({ field }) => (
              <ColorField label="Secondary" value={field.value ?? ""} onChange={field.onChange} placeholder="#6B7280" />
            )} />
            <FormField control={form.control} name="accentColor" render={({ field }) => (
              <ColorField label="Accent" value={field.value ?? ""} onChange={field.onChange} placeholder="#3B82F6" />
            )} />
          </div>
          {(watchColors[0] || watchColors[1] || watchColors[2]) && (
            <div className="flex gap-2 p-3 rounded-md border bg-muted/30">
              {watchColors.map((c, i) => c ? (
                <div key={i} className="h-6 w-10 rounded border" style={{ backgroundColor: c }} />
              ) : null)}
              <span className="text-xs text-muted-foreground self-center ml-1">Preview</span>
            </div>
          )}
          <FormField control={form.control} name="brandDescription" render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Description</FormLabel>
              <FormDescription>How your brand sounds and feels — used in AI-generated content</FormDescription>
              <FormControl>
                <Textarea
                  placeholder="Modern, minimal, and results-focused. We communicate with clarity and confidence."
                  rows={3}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <SaveRow status={status} isPending={form.formState.isSubmitting} />
        </form>
      </Form>
    </div>
  )
}

// ─── Payments ─────────────────────────────────────────────────────────────────

function PaymentsSection({ settings }: { settings: AgencySettings }) {
  const [status, setStatus] = useState<SaveStatus>("idle")
  const [, startTransition] = useTransition()
  const s = settings as any // eslint-disable-line @typescript-eslint/no-explicit-any

  const form = useForm<PaymentSettingsValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      bankName:            s.bankName            ?? "",
      accountHolder:       s.accountHolder       ?? "",
      accountNumber:       s.accountNumber       ?? "",
      ifscCode:            s.ifscCode            ?? "",
      upiId:               s.upiId               ?? "",
      paymentInstructions: s.paymentInstructions ?? "",
    },
  })

  function onSubmit(data: PaymentSettingsValues) {
    setStatus("saving")
    startTransition(async () => {
      const res = await updatePaymentSettings(data)
      setStatus(res.success ? "saved" : "error")
      if (res.success) setTimeout(() => setStatus("idle"), 2500)
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Payments" description="Pre-filled on all invoices and financial documents" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="bankName" render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <FormControl><Input placeholder="HDFC Bank" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="accountHolder" render={({ field }) => (
              <FormItem>
                <FormLabel>Account Holder</FormLabel>
                <FormControl><Input placeholder="Outpero Systems LLP" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="accountNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl><Input placeholder="1234567890" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ifscCode" render={({ field }) => (
              <FormItem>
                <FormLabel>IFSC Code</FormLabel>
                <FormControl><Input placeholder="HDFC0001234" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="upiId" render={({ field }) => (
            <FormItem>
              <FormLabel>UPI ID</FormLabel>
              <FormControl><Input placeholder="outpero@hdfc" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="paymentInstructions" render={({ field }) => (
            <FormItem>
              <FormLabel>Default Payment Instructions</FormLabel>
              <FormDescription>Shown at the bottom of every invoice</FormDescription>
              <FormControl>
                <Textarea
                  placeholder="Please transfer to the account above and share the UTR number via WhatsApp."
                  rows={3}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <SaveRow status={status} isPending={form.formState.isSubmitting} />
        </form>
      </Form>
    </div>
  )
}

// ─── AI Settings ─────────────────────────────────────────────────────────────

function AISection({ settings }: { settings: AgencySettings }) {
  const [status, setStatus] = useState<SaveStatus>("idle")
  const [, startTransition] = useTransition()
  const s = settings as any // eslint-disable-line @typescript-eslint/no-explicit-any

  const form = useForm<AISettingsValues>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: {
      defaultTone:          s.defaultTone          ?? "",
      defaultProposalStyle: s.defaultProposalStyle ?? "",
      defaultFollowUpStyle: s.defaultFollowUpStyle ?? "",
      aiBrandVoice:         s.aiBrandVoice         ?? "",
    },
  })

  function onSubmit(data: AISettingsValues) {
    setStatus("saving")
    startTransition(async () => {
      const res = await updateAISettings(data)
      setStatus(res.success ? "saved" : "error")
      if (res.success) setTimeout(() => setStatus("idle"), 2500)
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="AI Settings" description="Defaults injected into every AI-generated proposal and follow-up" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField control={form.control} name="defaultTone" render={({ field }) => (
              <FormItem>
                <FormLabel>Default Tone</FormLabel>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select tone" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TONE_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="defaultProposalStyle" render={({ field }) => (
              <FormItem>
                <FormLabel>Proposal Style</FormLabel>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROPOSAL_STYLE_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="defaultFollowUpStyle" render={({ field }) => (
              <FormItem>
                <FormLabel>Follow-up Style</FormLabel>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FOLLOW_UP_STYLE_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="aiBrandVoice" render={({ field }) => (
            <FormItem>
              <FormLabel>AI Brand Voice</FormLabel>
              <FormDescription>
                Custom instructions injected into every AI prompt — define personality, vocabulary rules, things to avoid
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder={`We are a 3-person AI automation agency. Write in first-person plural ("we"). Avoid buzzwords like "cutting-edge" or "leverage". Be specific and outcome-focused.`}
                  rows={5}
                  className="resize-none text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <SaveRow status={status} isPending={form.formState.isSubmitting} />
        </form>
      </Form>
    </div>
  )
}

// ─── Service Preferences ─────────────────────────────────────────────────────

function ServicesSection({ settings, services }: { settings: AgencySettings; services: Service[] }) {
  const [status, setStatus] = useState<SaveStatus>("idle")
  const [isPending, startTransition] = useTransition()
  const s = settings as any // eslint-disable-line @typescript-eslint/no-explicit-any

  const NONE = "__none__"
  const [defaultServiceId, setDefaultServiceId] = useState<string>(s.defaultServiceId ?? NONE)
  const [featured, setFeatured] = useState<string[]>((s.featuredServiceIds as string[] | null) ?? [])
  const [ordering, setOrdering] = useState<string>(s.serviceOrdering ?? "manual")

  function handleSave() {
    setStatus("saving")
    startTransition(async () => {
      const res = await updateServicePreferences({
        defaultServiceId: defaultServiceId === NONE ? undefined : defaultServiceId,
        featuredServiceIds: featured,
        serviceOrdering: ordering || undefined,
      })
      setStatus(res.success ? "saved" : "error")
      if (res.success) setTimeout(() => setStatus("idle"), 2500)
    })
  }

  function toggleFeatured(id: string) {
    setFeatured(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Service Preferences" description="Controls which services are highlighted across proposals and invoices" />

      <div className="space-y-2">
        <label className="text-sm font-medium">Default Service</label>
        <p className="text-xs text-muted-foreground">Pre-selected when creating new proposals or invoices</p>
        <Select value={defaultServiceId} onValueChange={setDefaultServiceId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="No default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>No default</SelectItem>
            {services.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {services.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Featured Services</label>
          <p className="text-xs text-muted-foreground">Highlighted in proposals and the service catalog</p>
          <div className="space-y-1.5 rounded-md border p-3">
            {services.map(svc => (
              <label key={svc.id} className="flex items-center gap-2.5 cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  checked={featured.includes(svc.id)}
                  onChange={() => toggleFeatured(svc.id)}
                  className="size-3.5 rounded border accent-foreground"
                />
                <span className="text-sm">{svc.name}</span>
                <span className="text-xs text-muted-foreground">· {svc.category}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Default Ordering</label>
        <Select value={ordering} onValueChange={setOrdering}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Manual" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_ORDERING_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm">
          {status === "saved" && (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Check className="size-3.5" /> Saved
            </span>
          )}
          {status === "error" && <span className="text-destructive">Failed to save</span>}
        </div>
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  )
}

// ─── Pipeline Settings ────────────────────────────────────────────────────────

function PipelineSection({ settings }: { settings: AgencySettings }) {
  const [status, setStatus] = useState<SaveStatus>("idle")
  const [isPending, startTransition] = useTransition()
  const s = settings as any // eslint-disable-line @typescript-eslint/no-explicit-any

  const savedLabels = (s.pipelineStageLabels as Record<string, string> | null) ?? {}
  const [labels, setLabels] = useState<Record<string, string>>(savedLabels)
  const [wonStage, setWonStage] = useState<string>(s.defaultWonStage ?? "WON")
  const [lostStage, setLostStage] = useState<string>(s.defaultLostStage ?? "LOST")

  function handleSave() {
    setStatus("saving")
    startTransition(async () => {
      const res = await updatePipelineSettings({
        pipelineStageLabels: labels,
        defaultWonStage:     wonStage,
        defaultLostStage:    lostStage,
      })
      setStatus(res.success ? "saved" : "error")
      if (res.success) setTimeout(() => setStatus("idle"), 2500)
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Pipeline"
        description="Custom stage labels (enum keys are fixed; only display names change)"
      />

      <div className="space-y-2">
        <div className="grid grid-cols-[140px_160px_1fr] gap-3 pb-1.5 border-b">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stage Key</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Default Label</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Custom Label</span>
        </div>
        {PIPELINE_STAGE_KEYS.map(key => (
          <div key={key} className="grid grid-cols-[140px_160px_1fr] gap-3 items-center">
            <span className="text-xs font-mono text-muted-foreground">{key}</span>
            <span className="text-sm text-muted-foreground">{DEFAULT_STAGE_LABELS[key]}</span>
            <Input
              value={labels[key] ?? ""}
              onChange={e => setLabels(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={DEFAULT_STAGE_LABELS[key]}
              className="h-8 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Default Won Stage</label>
          <p className="text-xs text-muted-foreground">Stage that represents a closed deal</p>
          <Select value={wonStage} onValueChange={setWonStage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PIPELINE_STAGE_KEYS.map(key => (
                <SelectItem key={key} value={key}>
                  {labels[key] || DEFAULT_STAGE_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Default Lost Stage</label>
          <p className="text-xs text-muted-foreground">Stage that represents a lost deal</p>
          <Select value={lostStage} onValueChange={setLostStage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PIPELINE_STAGE_KEYS.map(key => (
                <SelectItem key={key} value={key}>
                  {labels[key] || DEFAULT_STAGE_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm">
          {status === "saved" && (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Check className="size-3.5" /> Saved
            </span>
          )}
          {status === "error" && <span className="text-destructive">Failed to save</span>}
        </div>
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  )
}

// ─── Team ─────────────────────────────────────────────────────────────────────

function TeamSection({ teamMembers: initial }: { teamMembers: TeamMember[] }) {
  const [members, setMembers] = useState<TeamMember[]>(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [addError, setAddError] = useState("")
  const [, startTransition] = useTransition()

  const form = useForm<TeamMemberValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: { name: "", role: "", email: "", isActive: true },
  })

  function onAdd(data: TeamMemberValues) {
    setAddError("")
    startTransition(async () => {
      const res = await createTeamMember(data)
      if (res.success) {
        setMembers(prev => [...prev, res.data])
        form.reset()
        setShowAdd(false)
      } else {
        setAddError(res.error)
      }
    })
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      const res = await toggleTeamMemberActive(id)
      if (res.success) {
        setMembers(prev =>
          prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m)
        )
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteTeamMember(id)
      if (res.success) {
        setMembers(prev => prev.filter(m => m.id !== id))
      }
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Team" description="Members who use this CRM — reference for assignments and tracking" />

      {members.length === 0 && !showAdd && (
        <p className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-md">
          No team members yet
        </p>
      )}

      {members.length > 0 && (
        <div className="rounded-md border divide-y">
          {members.map(member => (
            <div key={member.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{member.name}</span>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                    member.isActive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {member.role} · {member.email}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title={member.isActive ? "Deactivate" : "Activate"}
                  onClick={() => handleToggle(member.id)}
                >
                  <Power className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  title="Delete"
                  onClick={() => handleDelete(member.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onAdd)} className="rounded-md border p-4 space-y-4 bg-muted/20">
            <p className="text-sm font-medium">Add Team Member</p>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="Vatsal Shah" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl><Input placeholder="Co-founder" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="vatsal@outpero.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {addError && <p className="text-sm text-destructive">{addError}</p>}
            <div className="flex items-center gap-2 pt-1">
              <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Adding…" : "Add"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setShowAdd(false); form.reset(); setAddError("") }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="size-3.5 mr-1.5" />
          Add Member
        </Button>
      )}
    </div>
  )
}

// ─── Tags ────────────────────────────────────────────────────────────────────

function TagForm({ defaultValues, onSubmit, onCancel, submitLabel }: {
  defaultValues: TagValues
  onSubmit: (data: TagValues) => void
  onCancel?: () => void
  submitLabel: string
}) {
  const form = useForm<TagValues>({
    resolver: zodResolver(tagSchema),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input placeholder="VIP" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="color" render={({ field }) => (
          <FormItem>
            <FormLabel>Color</FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => field.onChange(c.value)}
                    title={c.label}
                    className={cn(
                      "size-6 rounded-full ring-offset-2 ring-offset-background transition-shadow",
                      tagColorDot(c.value),
                      field.value === c.value ? "ring-2 ring-foreground" : "hover:ring-2 hover:ring-muted-foreground/40"
                    )}
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

function TagsSection({ tags: initial }: { tags: Tag[] }) {
  const [tags, setTags] = useState<Tag[]>(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [, startTransition] = useTransition()

  function handleAdd(data: TagValues) {
    setError("")
    startTransition(async () => {
      const res = await createTag(data)
      if (res.success) {
        setTags(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
        setShowAdd(false)
      } else {
        setError(res.error)
      }
    })
  }

  function handleEdit(id: string, data: TagValues) {
    setError("")
    startTransition(async () => {
      const res = await updateTag(id, data)
      if (res.success) {
        setTags(prev => prev.map(t => t.id === id ? res.data : t).sort((a, b) => a.name.localeCompare(b.name)))
        setEditingId(null)
      } else {
        setError(res.error)
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteTag(id)
      if (res.success) {
        setTags(prev => prev.filter(t => t.id !== id))
      }
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Tags" description="Custom labels you can apply to leads — visible in the pipeline and lead list" />

      {tags.length === 0 && !showAdd && (
        <p className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-md">
          No tags yet
        </p>
      )}

      {tags.length > 0 && (
        <div className="rounded-md border divide-y">
          {tags.map(tag => (
            <div key={tag.id} className="px-4 py-3">
              {editingId === tag.id ? (
                <TagForm
                  defaultValues={{ name: tag.name, color: tag.color as TagValues["color"] }}
                  submitLabel="Save"
                  onSubmit={(data) => handleEdit(tag.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                      tagColorClasses(tag.color)
                    )}>
                      {tag.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Edit"
                      onClick={() => setEditingId(tag.id)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      title="Delete"
                      onClick={() => handleDelete(tag.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showAdd ? (
        <div className="rounded-md border p-4 space-y-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Add Tag</p>
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setShowAdd(false); setError("") }}>
              <X className="size-3.5" />
            </Button>
          </div>
          <TagForm
            defaultValues={{ name: "", color: "slate" }}
            submitLabel="Add"
            onSubmit={handleAdd}
          />
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="size-3.5 mr-1.5" />
          Add Tag
        </Button>
      )}
    </div>
  )
}

// ─── Root client component ────────────────────────────────────────────────────

export function SettingsClient({ settings, teamMembers, services, tags }: SettingsClientProps) {
  const [active, setActive] = useState<NavKey>("business")

  return (
    <div className="flex gap-8">
      <nav className="w-40 shrink-0">
        <div className="space-y-0.5">
          {NAV.map(item => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                active === item.key
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex-1 min-w-0 max-w-2xl">
        {active === "business"  && <BusinessSection  settings={settings} />}
        {active === "branding"  && <BrandingSection  settings={settings} />}
        {active === "payments"  && <PaymentsSection  settings={settings} />}
        {active === "ai"        && <AISection        settings={settings} />}
        {active === "services"  && <ServicesSection  settings={settings} services={services} />}
        {active === "pipeline"  && <PipelineSection  settings={settings} />}
        {active === "team"      && <TeamSection      teamMembers={teamMembers} />}
        {active === "tags"      && <TagsSection      tags={tags} />}
      </div>
    </div>
  )
}
