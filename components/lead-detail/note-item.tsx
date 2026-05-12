"use client"

import { useState, useTransition } from "react"
import { Pencil, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateNote, deleteNote } from "@/actions/notes"
import { formatDate } from "@/lib/utils"
import type { Note } from "@prisma/client"

export function NoteItem({ note }: { note: Note }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(note.content)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (!editValue.trim()) return
    startTransition(async () => {
      await updateNote(note.id, note.leadId, editValue.trim())
      setIsEditing(false)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteNote(note.id, note.leadId)
    })
  }

  function handleCancel() {
    setEditValue(note.content)
    setIsEditing(false)
  }

  return (
    <div className="space-y-2 rounded-lg border bg-card p-3.5">
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="resize-none text-sm"
            rows={3}
            autoFocus
            disabled={isPending}
          />
          <div className="flex gap-1.5">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending || !editValue.trim()}
              className="gap-1"
            >
              <Check className="size-3.5" />
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isPending}
              className="gap-1"
            >
              <X className="size-3.5" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {note.createdBy && <span>{note.createdBy} · </span>}
          {formatDate(note.createdAt)}
        </p>
        {!isEditing && (
          <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 [.rounded-lg:hover_&]:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsEditing(true)}
              disabled={isPending}
            >
              <Pencil className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              disabled={isPending}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
