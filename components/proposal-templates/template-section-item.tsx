"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import {
  removeProposalTemplateSection,
  reorderProposalTemplateSection,
  updateProposalTemplateSection,
} from "@/actions/proposal-templates"
import type { ProposalTemplateSection } from "@prisma/client"
import { PROPOSAL_SECTION_LABELS } from "@/lib/validations/proposal-template"
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
import { ChevronUp, ChevronDown, Pencil, Trash2, Sparkles, X, Check } from "lucide-react"
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
  const [draftContent, setDraftContent] = useState(section.contentTemplate)
  const router = useRouter()

  function handleMoveUp() {
    startTransition(async () => {
      await reorderProposalTemplateSection(templateId, section.id, "up")
    })
  }

  function handleMoveDown() {
    startTransition(async () => {
      await reorderProposalTemplateSection(templateId, section.id, "down")
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await removeProposalTemplateSection(section.id, templateId)
      router.refresh()
    })
  }

  function handleSave() {
    startTransition(async () => {
      await updateProposalTemplateSection(section.id, templateId, { contentTemplate: draftContent })
      setEditing(false)
    })
  }

  function handleCancel() {
    setDraftContent(section.contentTemplate)
    setEditing(false)
  }

  const label = PROPOSAL_SECTION_LABELS[section.type as keyof typeof PROPOSAL_SECTION_LABELS] ?? section.type

  return (
    <div
      className={cn(
        "rounded-lg border bg-card transition-colors",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Order controls */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={handleMoveUp}
            disabled={isFirst || isPending}
            aria-label="Move section up"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={handleMoveDown}
            disabled={isLast || isPending}
            aria-label="Move section down"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Section info */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="font-medium text-sm truncate">{section.title}</span>
          <Badge variant="outline" className="text-xs shrink-0 font-normal">
            {label}
          </Badge>
          {section.isAIGenerated && (
            <Badge variant="secondary" className="text-xs shrink-0 gap-1">
              <Sparkles className="h-3 w-3" />
              AI
            </Badge>
          )}
          {section.isRequired && (
            <span className="text-xs text-muted-foreground shrink-0">required</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!section.isAIGenerated && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setEditing(!editing)}
              aria-label="Edit content template"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                disabled={isPending}
                aria-label="Remove section"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove &ldquo;{section.title}&rdquo;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This section will be removed from the template. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remove section
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Content template editor (non-AI sections only) */}
      {editing && !section.isAIGenerated && (
        <div className="border-t px-4 py-3 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Content template — use{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">{"{{lead.name}}"}</code>,{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">{"{{lead.company}}"}</code>,{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">{"{{proposal.date}}"}</code>
            </Label>
            <Textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              rows={5}
              className="text-sm font-mono resize-none"
              placeholder="Enter the default content for this section. Use {{placeholders}} for dynamic values."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending}>
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}

      {/* Preview of content template (when not editing and has content) */}
      {!editing && !section.isAIGenerated && section.contentTemplate && (
        <div className="border-t px-4 py-2.5">
          <p className="text-xs text-muted-foreground font-mono whitespace-pre-wrap line-clamp-2">
            {section.contentTemplate}
          </p>
        </div>
      )}

      {/* AI section note */}
      {section.isAIGenerated && (
        <div className="border-t px-4 py-2.5">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            This section will be written by AI using lead data and context at generation time.
          </p>
        </div>
      )}
    </div>
  )
}
