import { FileText } from "lucide-react"
import type { Note } from "@prisma/client"
import { AddNoteForm } from "./add-note-form"
import { NoteItem } from "./note-item"

interface NotesSectionProps {
  notes: Note[]
  leadId: string
}

export function NotesSection({ notes, leadId }: NotesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="size-4 text-muted-foreground" />
        <h2 className="font-semibold">Notes</h2>
        {notes.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {notes.length}
          </span>
        )}
      </div>

      <AddNoteForm leadId={leadId} />

      {notes.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No notes yet
        </p>
      ) : (
        <div className="space-y-2.5">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}
