"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import {
  removeProposalTemplateSection,
  reorderProposalTemplateSection,
  updateProposalTemplateSection,
} from "@/actions/proposal-templates"
import type { ProposalTemplateSection } from "@prisma/client"
import {
  PROPOSAL_SECTION_LABELS,
  VISUAL_STYLE_OPTIONS,
  LAYOUT_TYPE_OPTIONS,
} from "@/lib/validations/proposal-template"
import {
  VISUAL_STYLE_LABELS,
  LAYOUT_TYPE_LABELS,
} from "@/lib/proposal/presets"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ChevronUp, ChevronDown, Pencil, Trash2, Sparkles, X, Check, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TemplateSectionItemProps {
  section: ProposalTemplateSection
  templateId: string
  isFirst: boolean
  isLast: boolean
}

export function TemplateSectionItem({ section, templateId, isFirst, isLast }: TemplateSectionItemProps) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [draftText, setDraftText] = useState(section.templateText)
  const [draftInstructions, setDraftInstructions] = useState(section.aiInstructions ?? "")
  const [draftVisualStyle, setDraftVisualStyle] = useState(section.visualStyle)
  const [draftLayoutType, setDraftLayoutType] = useState(section.layoutType)
  const router = useRouter()

  const label = PROPOSAL_SECTION_LABELS[section.type as keyof typeof PROPOSAL_SECTION_LABELS] ?? section.type
  const isAIMode = section.isAIGenerated || section.isAIRefinement

  function handleMoveUp() {
    startTransition(async () => { await reorderProposalTemplateSection(templateId, section.id, "up") })
  }

  function handleMoveDown() {
    startTransition(async () => { await reorderProposalTemplateSection(templateId, section.id, "down") })
  }

  function handleDelete() {
    startTransition(async () => {
      await removeProposalTemplateSection(section.id, templateId)
      router.refresh()
    })
  }

  function handleSave() {
    startTransition(async () => {
      await updateProposalTemplateSection(section.id, templateId, {
        templateText: draftText,
        aiInstructions: draftInstructions || undefined,
        visualStyle: draftVisualStyle as (typeof VISUAL_STYLE_OPTIONS)[number],
        layoutType: draftLayoutType as (typeof LAYOUT_TYPE_OPTIONS)[number],
      })
      setEditing(false)
    })
  }

  function handleCancel() {
    setDraftText(section.templateText)
    setDraftInstructions(section.aiInstructions ?? "")
    setDraftVisualStyle(section.visualStyle)
    setDraftLayoutType(section.layoutType)
    setEditing(false)
  }

  return (
    <div className={cn("rounded-lg border bg-card transition-colors", isPending && "opacity-60 pointer-events-none")}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Order controls */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleMoveUp} disabled={isFirst || isPending}>
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleMoveDown} disabled={isLast || isPending}>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Section info */}
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{section.title}</span>
          <Badge variant="outline" className="text-xs shrink-0 font-normal">{label}</Badge>
          {section.isAIGenerated && (
            <Badge variant="secondary" className="text-xs shrink-0 gap-1">
              <Sparkles className="h-3 w-3" />AI Generate
            </Badge>
          )}
          {section.isAIRefinement && (
            <Badge variant="secondary" className="text-xs shrink-0 gap-1">
              <Wand2 className="h-3 w-3" />AI Refine
            </Badge>
          )}
          {section.isRequired && (
            <span className="text-xs text-muted-foreground shrink-0">required</span>
          )}
          <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
            {VISUAL_STYLE_LABELS[section.visualStyle as keyof typeof VISUAL_STYLE_LABELS] ?? section.visualStyle}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setEditing(!editing)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" disabled={isPending}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove &ldquo;{section.title}&rdquo;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This section will be removed from the template. Cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Collapsed preview */}
      {!editing && !isAIMode && section.templateText && (
        <div className="border-t px-4 py-2.5">
          <p className="text-xs text-muted-foreground font-mono whitespace-pre-wrap line-clamp-2">
            {section.templateText}
          </p>
        </div>
      )}

      {!editing && isAIMode && (
        <div className="border-t px-4 py-2.5 space-y-1">
          {section.isAIRefinement && section.templateText && (
            <p className="text-xs text-muted-foreground font-mono line-clamp-1">{section.templateText}</p>
          )}
          {section.aiInstructions && (
            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <Sparkles className="h-3 w-3 shrink-0 mt-0.5" />
              <span className="line-clamp-1 italic">{section.aiInstructions}</span>
            </p>
          )}
          {!section.aiInstructions && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 shrink-0" />
              {section.isAIGenerated ? "AI writes from scratch using lead context" : "AI refines template text using lead context"}
            </p>
          )}
        </div>
      )}

      {/* Edit panel */}
      {editing && (
        <div className="border-t px-4 py-4 space-y-4">
          {/* Visual style + layout selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Visual Style</Label>
              <select
                value={draftVisualStyle}
                onChange={(e) => setDraftVisualStyle(e.target.value as (typeof VISUAL_STYLE_OPTIONS)[number])}
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
                value={draftLayoutType}
                onChange={(e) => setDraftLayoutType(e.target.value as (typeof LAYOUT_TYPE_OPTIONS)[number])}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {LAYOUT_TYPE_OPTIONS.map((l) => (
                  <option key={l} value={l}>{LAYOUT_TYPE_LABELS[l]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Template text — shown for static + refinement sections */}
          {!section.isAIGenerated && (
            <div className="space-y-1.5">
              <Label className="text-xs">
                {section.isAIRefinement ? "Base Template (AI will refine this)" : "Content Template"}
              </Label>
              <p className="text-xs text-muted-foreground">
                Use <code className="bg-muted px-1 py-0.5 rounded">{"{{lead.company}}"}</code>,{" "}
                <code className="bg-muted px-1 py-0.5 rounded">{"{{lead.name}}"}</code>,{" "}
                <code className="bg-muted px-1 py-0.5 rounded">{"{{proposal.date}}"}</code>
              </p>
              <Textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                rows={5}
                className="text-sm font-mono resize-none"
                placeholder={section.isAIRefinement
                  ? "Write the base draft — AI will personalize it with lead context…"
                  : "Enter default content. Use {{placeholders}} for dynamic values."}
              />
            </div>
          )}

          {/* AI instructions — shown for any AI section */}
          {isAIMode && (
            <div className="space-y-1.5">
              <Label className="text-xs">
                AI Instructions{" "}
                <span className="text-muted-foreground font-normal">
                  — {section.isAIRefinement ? "how to refine the template above" : "what to write"}
                </span>
              </Label>
              <Textarea
                value={draftInstructions}
                onChange={(e) => setDraftInstructions(e.target.value)}
                rows={3}
                className="text-sm resize-none"
                placeholder={section.isAIRefinement
                  ? "e.g. Personalize to lead's industry and problem. Keep same structure…"
                  : "e.g. 2-3 paragraphs. Open with client's specific problem. Avoid clichés…"}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending}>
              <X className="h-3.5 w-3.5 mr-1.5" />Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
