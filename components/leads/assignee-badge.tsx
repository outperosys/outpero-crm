import { cn } from "@/lib/utils"

const ASSIGNEE_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
]

function colorForName(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return ASSIGNEE_COLORS[Math.abs(hash) % ASSIGNEE_COLORS.length]
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function AssigneeBadge({ name, className }: { name?: string | null; className?: string }) {
  if (!name) {
    return (
      <span className={cn("inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground", className)}>
        Unassigned
      </span>
    )
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", colorForName(name), className)}>
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-white/60 text-[9px] font-bold dark:bg-black/20">
        {initials(name)}
      </span>
      <span className="truncate">{name}</span>
    </span>
  )
}
