"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { generateProposal } from "@/actions/ai"
import type { Lead } from "@prisma/client"
import type { ProposalTemplateWithSections } from "@/actions/proposal-templates"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sparkles, Loader2 } from "lucide-react"

interface GenerateProposalFormProps {
  leads: Pick<Lead, "id" | "name" | "companyName">[]
  templates: ProposalTemplateWithSections[]
  defaultLeadId?: string
}

export function GenerateProposalForm({ leads, templates, defaultLeadId }: GenerateProposalFormProps) {
  // Compute defaultTemplate first so we can initialize templateId state with it
  const defaultTemplate = templates.find((t) => t.isDefault)

  const [leadId, setLeadId] = useState(defaultLeadId ?? "")
  const [templateId, setTemplateId] = useState(defaultTemplate?.id ?? "")
  const [customInstructions, setCustomInstructions] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!leadId || !templateId) return
    setError(null)

    startTransition(async () => {
      const result = await generateProposal(leadId, templateId, {
        customInstructions: customInstructions.trim() || undefined,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      router.push(`/proposals/${result.data}`)
    })
  }

  const selectedTemplate = templates.find((t) => t.id === templateId) ?? defaultTemplate
  const aiSectionCount = selectedTemplate?.sections.filter((s) => s.isAIGenerated).length ?? 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Lead selector */}
      <div className="space-y-2">
        <Label htmlFor="lead-select">Lead</Label>
        <Select value={leadId} onValueChange={setLeadId} disabled={isPending}>
          <SelectTrigger id="lead-select" className="w-full">
            <SelectValue placeholder="Select a lead…" />
          </SelectTrigger>
          <SelectContent>
            {leads.map((lead) => (
              <SelectItem key={lead.id} value={lead.id}>
                {lead.name}
                {lead.companyName ? ` — ${lead.companyName}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template selector */}
      <div className="space-y-2">
        <Label htmlFor="template-select">Template</Label>
        <Select value={templateId} onValueChange={setTemplateId} disabled={isPending}>
          <SelectTrigger id="template-select" className="w-full">
            <SelectValue placeholder="Select a template…" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
                {t.isDefault ? " (default)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedTemplate && (
          <p className="text-xs text-muted-foreground">
            {selectedTemplate.sections.length} sections
            {aiSectionCount > 0 && ` · ${aiSectionCount} AI-generated`}
            {selectedTemplate.description ? ` — ${selectedTemplate.description}` : ""}
          </p>
        )}
      </div>

      {/* Custom instructions */}
      <div className="space-y-2">
        <Label htmlFor="custom-instructions">
          Custom instructions{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="custom-instructions"
          placeholder="e.g. Focus on ROI and cost savings. Keep it brief. Emphasise the WhatsApp automation angle."
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          rows={3}
          disabled={isPending}
          className="resize-none text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Guides the AI on emphasis, tone, or specific points to highlight. Applied to all AI-generated sections.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Generate button */}
      <div className="pt-2">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isPending || !leadId || !templateId}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating proposal…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate proposal
            </>
          )}
        </Button>
        {isPending && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            AI is writing your sections — this takes 5–15 seconds
          </p>
        )}
      </div>
    </form>
  )
}
