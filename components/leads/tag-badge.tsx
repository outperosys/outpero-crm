import { cn } from "@/lib/utils"
import { tagColorClasses } from "@/lib/tag-colors"

export function TagBadge({
  name,
  color,
  className,
}: {
  name: string
  color: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        tagColorClasses(color),
        className
      )}
    >
      {name}
    </span>
  )
}
