import { z } from "zod"

export const noteSchema = z.object({
  content: z.string().min(1, "Note cannot be empty"),
  createdBy: z.string().optional(),
})

export type NoteFormValues = z.infer<typeof noteSchema>
