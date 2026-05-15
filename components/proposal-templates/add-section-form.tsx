"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addProposalTemplateSection } from "@/actions/proposal-templates"
import {
  PROPOSAL_SECTION_TYPES,
  PROPOSAL_SECTION_LABELS,
  VISUAL_STYLE_OPTIONS,
  LAYOUT_TYPE_OPTIONS,
} from "@/lib/validations/proposal-template"
import { VISUAL_STYLE_LABELS, LAYOUT_TYPE_LABELS } from "@/lib/proposal/presets"
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
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

type AIMode = "generate" | "refine" | "static"

interface AddSectionFormProps {
  templateId: string
}

export function AddSectionForm({ templateId }: AddSectionFormProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<string>("")
  const [title, setTitle] = useState("")
  const [aiMode, setAiMode] = useState<AIMode>("static")
  const [visualStyle, setVisualStyle] = useState<string>("CLEAN")
  const [layoutType, setLayoutType] = useState<string>("FULL_WIDTH")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleTypeChange(val: string) {
    setType(val)
    if (!title) {
      setTitle(PROPOSAL_SECTION_LABELS[val as keyof typeof PROPOSAL_SECTION_LABELS] ?? "")
    }
    // Suggest sensible defaults
    if (val === "COVER") { setVisualStyle("HERO"); setLayoutType("CENTERED") }
    else if (val === "PROBLEM_STATEMENT") { setVisualStyle("HIGHLIGHT"); setLayoutType("FULL_WIDTH") }
    else if (val === "SCOPE_OF_WORK") { setVisualStyle("MODERN"); setLayoutType("FULL_WIDTH") }
    else if (val === "NEXT_STEPS") { setVisualStyle("MODERN"); setLayoutType("FULL_WIDTH") }
    else if (val === "TERMS" || val === "ABOUT_US") { setVisualStyle("MINIMAL"); setLayoutType("FULL_WIDTH") }
    else { setVisualStyle("CLEAN"); setLayoutType("FULL_WIDTH") }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type) { setError("Section type is required"); return }
    setError(null)
    startTransition(async () => {
      const result = await addProposalTemplateSection(templateId, {
        type: type as (typeof PROPOSAL_SECTION_TYPES)[number],
        title: title.trim(),
        isAIGenerated: aiMode === "generate",
        isAIRefinement: aiMode === "refine",
        isRequired: false,
        visualStyle: visualStyle as (typeof VISUAL_STYLE_OPTIONS)[number],
        layoutType: layoutType as (typeof LAYOUT_TYPE_OPTIONS)[number],
      })
      if (!result.success) { setError(result.error); return }
      setType(""); setTitle(""); setAiMode("static")
      setVisualStyle("CLEAN"); setLayoutType("FULL_WIDTH")
      setOpen(false)
      router.refresh()
    })
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="w-full">
        <Plus className="h-4 w-4 mr-2" />Add section
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
        {/* Type + Title */}
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

        {/* AI mode */}
        <div className="space-y-1.5">
          <Label className="text-xs">AI Mode</Label>
          <div className="flex gap-1.5">
            {(["static", "refine", "generate"] as AIMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setAiMode(m)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                  aiMode === m
                    ? "border-foreground bg-foreground text-background"
                    : "border-input text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                )}
              >
                {m === "static" ? "Static" : m === "refine" ? "AI Refine" : "AI Generate"}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {aiMode === "static" && "Placeholder-only — no AI. Good for cover, pricing, terms."}
            {aiMode === "refine" && "AI personalizes your template text using lead context."}
            {aiMode === "generate" && "AI writes this section from scratch using lead context."}
          </p>
        </div>

        {/* Visual style + layout */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Visual Style</Label>
            <select
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {VISUAL_STYLE_OPTIONS.map((s) => (
                <option key={s} value={s}>{VISUAL_STYLE_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Layout</Label>
            <select
              value={layoutType}
              onChange={(e) => setLayoutType(e.target.value)}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {LAYOUT_TYPE_OPTIONS.map((l) => (
                <option key={l} value={l}>{LAYOUT_TYPE_LABELS[l]}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" size="sm" disabled={isPending || !type || !title.trim()}>
            {isPending ? "Adding…" : "Add"}
          </Button>
        </div>
      </form>
    </div>
  )
}
