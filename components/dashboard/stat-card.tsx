import Link from "next/link"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
  href?: string
  tone?: "default" | "destructive" | "success"
  className?: string
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "",
  destructive: "text-destructive",
  success: "text-emerald-600 dark:text-emerald-400",
}

export function StatCard({ label, value, sublabel, href, tone = "default", className }: StatCardProps) {
  const content = (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 space-y-1",
        href && "transition-colors hover:border-primary/40 hover:bg-muted/30",
        className
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn("text-2xl font-semibold tabular-nums", TONE_CLASSES[tone])}>{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  return content
}
