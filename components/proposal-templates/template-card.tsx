"use client"

import Link from "next/link"
import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { deleteProposalTemplate } from "@/actions/proposal-templates"
import type { ProposalTemplateWithSections } from "@/actions/proposal-templates"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Layers, ArrowRight, Trash2, Star } from "lucide-react"

interface TemplateCardProps {
  template: ProposalTemplateWithSections
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      await deleteProposalTemplate(template.id)
      router.refresh()
    })
  }

  const aiSectionCount = template.sections.filter((s) => s.isAIGenerated).length

  return (
    <div className="group relative flex flex-col gap-4 rounded-lg border bg-card p-5 hover:border-foreground/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
          <h3 className="font-medium truncate">{template.name}</h3>
          {template.isDefault && (
            <Badge variant="secondary" className="shrink-0">
              <Star className="h-3 w-3 mr-1" />
              Default
            </Badge>
          )}
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              disabled={isPending}
              aria-label="Delete template"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &ldquo;{template.name}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the template and all its sections. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending ? "Deleting…" : "Delete template"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {template.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{template.sections.length} sections</span>
        {aiSectionCount > 0 && <span>· {aiSectionCount} AI-generated</span>}
        {template._count.proposals > 0 && (
          <span>· {template._count.proposals} {template._count.proposals === 1 ? "proposal" : "proposals"}</span>
        )}
      </div>

      <Link href={`/templates/${template.id}`} className="mt-auto">
        <Button variant="outline" size="sm" className="w-full group/btn">
          Edit template
          <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover/btn:translate-x-0.5 transition-transform" />
        </Button>
      </Link>
    </div>
  )
}
