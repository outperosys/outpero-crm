"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Tag as TagIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { toggleLeadTag } from "@/actions/tags"
import { TagBadge } from "./tag-badge"
import type { Tag } from "@prisma/client"

interface LeadTagsPopoverProps {
  leadId: string
  allTags: Tag[]
  selectedTagIds: string[]
  trigger?: React.ReactNode
}

export function LeadTagsPopover({ leadId, allTags, selectedTagIds, trigger }: LeadTagsPopoverProps) {
  const [selected, setSelected] = useState(() => new Set(selectedTagIds))
  const [, startTransition] = useTransition()

  function handleToggle(tagId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(tagId)) next.delete(tagId)
      else next.add(tagId)
      return next
    })
    startTransition(async () => { await toggleLeadTag(leadId, tagId) })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon-sm" aria-label="Manage tags">
            <TagIcon className="size-3.5" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56" align="start">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Tags</p>
        {allTags.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No tags yet —{" "}
            <Link href="/settings" className="text-primary hover:underline">
              add some in Settings
            </Link>
          </p>
        ) : (
          <div className="max-h-64 space-y-0.5 overflow-y-auto">
            {allTags.map((tag) => (
              <label
                key={tag.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-muted/50"
              >
                <Checkbox
                  checked={selected.has(tag.id)}
                  onCheckedChange={() => handleToggle(tag.id)}
                />
                <TagBadge name={tag.name} color={tag.color} />
              </label>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
