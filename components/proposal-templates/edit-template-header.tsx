"use client"

import { useState, useTransition } from "react"
import { updateProposalTemplate } from "@/actions/proposal-templates"
import type { ProposalTemplate } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Check, X } from "lucide-react"

interface EditTemplateHeaderProps {
  template: ProposalTemplate
}

export function EditTemplateHeader({ template }: EditTemplateHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(template.name)
  const [description, setDescription] = useState(template.description ?? "")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateProposalTemplate(template.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        isDefault: template.isDefault,
      })
      if (!result.success) { setError(result.error); return }
      setEditing(false)
    })
  }

  function handleCancel() {
    setName(template.name)
    setDescription(template.description ?? "")
    setError(null)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-start gap-3 group">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
          onClick={() => setEditing(true)}
          aria-label="Edit template name"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-lg font-semibold h-9 max-w-sm"
          placeholder="Template name"
          autoFocus
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-9 text-sm"
          placeholder="Description (optional)"
        />
        <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSave} disabled={isPending || !name.trim()}>
          <Check className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
