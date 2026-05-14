"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addProposalTemplateSection } from "@/actions/proposal-templates"
import {
  PROPOSAL_SECTION_TYPES,
  PROPOSAL_SECTION_LABELS,
} from "@/lib/validations/proposal-template"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X } from "lucide-react"

interface AddSectionFormProps {
  templateId: string
}

export function AddSectionForm({ templateId }: AddSectionFormProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<string>("")
  const [title, setTitle] = useState("")
  const [isAI, setIsAI] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleTypeChange(val: string) {
    setType(val)
    // Auto-fill title from label if user hasn't typed one yet
    if (!title) {
      setTitle(PROPOSAL_SECTION_LABELS[val as keyof typeof PROPOSAL_SECTION_LABELS] ?? "")
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type) { setError("Section type is required"); return }
    setError(null)
    startTransition(async () => {
      const result = await addProposalTemplateSection(templateId, {
        type: type as (typeof PROPOSAL_SECTION_TYPES)[number],
        title: title.trim(),
        isAIGenerated: isAI,
        isRequired: false,
      })
      if (!result.success) { setError(result.error); return }
      // Reset form
      setType("")
      setTitle("")
      setIsAI(false)
      setOpen(false)
      router.refresh()
    })
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add section
      </Button>
    )
  }

  return (
    <div className="rounded-lg border border-dashed bg-muted/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Add section</p>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="section-type" className="text-xs">Type</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger id="section-type" className="h-8 text-sm">
                <SelectValue placeholder="Select type…" />
              </SelectTrigger>
              <SelectContent>
                {PROPOSAL_SECTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="text-sm">
                    {PROPOSAL_SECTION_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="section-title" className="text-xs">Title</Label>
            <Input
              id="section-title"
              className="h-8 text-sm"
              placeholder="Section heading"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="section-ai"
            checked={isAI}
            onCheckedChange={(checked) => setIsAI(!!checked)}
          />
          <Label htmlFor="section-ai" className="text-xs font-normal cursor-pointer">
            AI-generated — let AI write this section at proposal generation time
          </Label>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isPending || !type || !title.trim()}>
            {isPending ? "Adding…" : "Add"}
          </Button>
        </div>
      </form>
    </div>
  )
}
