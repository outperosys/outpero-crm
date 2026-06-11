"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toDateTimeLocal } from "@/lib/follow-up"

const PRESETS: { label: string; get: () => Date }[] = [
  {
    label: "Later today",
    get: () => {
      const d = new Date()
      d.setHours(Math.max(d.getHours() + 1, 10), 0, 0, 0)
      return d
    },
  },
  {
    label: "Tomorrow",
    get: () => {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      d.setHours(10, 0, 0, 0)
      return d
    },
  },
  {
    label: "In 3 days",
    get: () => {
      const d = new Date()
      d.setDate(d.getDate() + 3)
      d.setHours(10, 0, 0, 0)
      return d
    },
  },
  {
    label: "Next week",
    get: () => {
      const d = new Date()
      d.setDate(d.getDate() + 7)
      d.setHours(10, 0, 0, 0)
      return d
    },
  },
]

export function quickDueDate(label: (typeof PRESETS)[number]["label"]): string {
  const preset = PRESETS.find((p) => p.label === label) ?? PRESETS[1]
  return toDateTimeLocal(preset.get())
}

export function QuickDatePicks({
  value,
  onPick,
  className,
}: {
  value?: string
  onPick: (value: string) => void
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {PRESETS.map((preset) => {
        const presetValue = toDateTimeLocal(preset.get())
        const isActive = value === presetValue
        return (
          <Button
            key={preset.label}
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            className="h-7 px-2.5 text-xs font-normal"
            onClick={() => onPick(presetValue)}
          >
            {preset.label}
          </Button>
        )
      })}
    </div>
  )
}
