import { z } from "zod"
import { TAG_COLOR_VALUES } from "@/lib/tag-colors"

export const tagSchema = z.object({
  name: z.string().min(1, "Name is required").max(24, "Keep it short"),
  color: z.enum(TAG_COLOR_VALUES),
})

export type TagValues = z.infer<typeof tagSchema>
