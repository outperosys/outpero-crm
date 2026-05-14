"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addProposalSection } from "@/actions/proposals"
import type { ProposalSection } from "@prisma/client"
import { ProposalSectionCard } from "@/components/proposals/workspace/proposal-section-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Plus, X, Check } from "lucide-react"

interface ProposalWorkspaceProps {
  proposalId: string
  sections: ProposalSection[]
}

export function ProposalWorkspace({ proposalId, sections }: ProposalWorkspaceProps) {
  const [showHidden, setShowHidden] = useState(false)
  const [addingSection, setAddingSection] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [addError, setAddError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const visibleSections = sections.filter((s) => s.isVisible)
  const hiddenSections = sections.filter((s) => !s.isVisible)

  // When not showing hidden: render only visible. When showing: render all in order.
  const displaySections = showHidden ? sections : visibleSections

  // First/last indices based on visible only (for reorder boundaries)
  function isFirstVisible(section: ProposalSection) {
    return visibleSections[0]?.id === section.id
  }
  function isLastVisible(section: ProposalSection) {
    return visibleSections[visibleSections.length - 1]?.id === section.id
  }

  function handleAddSection(e: React.FormEvent) {
    e.preventDefault()
    setAddError(null)
    startTransition(async () => {
      const result = await addProposalSection(proposalId, newTitle, newContent)
      if (!result.success) { setAddError(result.error); return }
      setNewTitle("")
      setNewContent("")
      setAddingSection(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      {/* Hidden sections toggle */}
      {hiddenSections.length > 0 && (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground gap-1.5"
            onClick={() => setShowHidden(!showHidden)}
          >
            {showHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showHidden
              ? "Hide hidden sections"
              : `Show ${hiddenSections.length} hidden section${hiddenSections.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}

      {/* Section list */}
      {displaySections.length === 0 && (
        <div className="rounded-xl border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No sections visible — add one or restore hidden sections.</p>
        </div>
      )}

      <div className="space-y-3">
        {displaySections.map((section, idx) => {
          const visIdx = visibleSections.indexOf(section)
          return (
            <ProposalSectionCard
              key={section.id}
              section={section}
              proposalId={proposalId}
              isFirst={section.isVisible ? visIdx === 0 : false}
              isLast={section.isVisible ? visIdx === visibleSections.length - 1 : false}
            />
          )
        })}
      </div>

      {/* Add custom section */}
      {!addingSection ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed"
          onClick={() => setAddingSection(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add custom section
        </Button>
      ) : (
        <div className="rounded-xl border bg-card px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Add custom section</p>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAddingSection(false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <form onSubmit={handleAddSection} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="new-section-title">Title</Label>
              <Input
                id="new-section-title"
                className="h-8 text-sm"
                placeholder="e.g. Guarantee, Testimonials, FAQ"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="new-section-content">Content</Label>
              <Textarea
                id="new-section-content"
                className="text-sm resize-none"
                placeholder="Write the section content…"
                rows={4}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
            </div>
            {addError && <p className="text-xs text-destructive">{addError}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setAddingSection(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={isPending}>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                {isPending ? "Adding…" : "Add section"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
