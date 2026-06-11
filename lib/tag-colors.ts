export const TAG_COLOR_VALUES = [
  "slate",
  "red",
  "orange",
  "amber",
  "emerald",
  "blue",
  "violet",
  "pink",
  "cyan",
] as const

export type TagColor = (typeof TAG_COLOR_VALUES)[number]

export const TAG_COLORS: { value: TagColor; label: string; classes: string; dot: string }[] = [
  { value: "slate",   label: "Slate",   classes: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",       dot: "bg-slate-500" },
  { value: "red",     label: "Red",     classes: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",            dot: "bg-red-500" },
  { value: "orange",  label: "Orange",  classes: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300", dot: "bg-orange-500" },
  { value: "amber",   label: "Amber",   classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",     dot: "bg-amber-500" },
  { value: "emerald", label: "Emerald", classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", dot: "bg-emerald-500" },
  { value: "blue",    label: "Blue",    classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",         dot: "bg-blue-500" },
  { value: "violet",  label: "Violet",  classes: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300", dot: "bg-violet-500" },
  { value: "pink",    label: "Pink",    classes: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",         dot: "bg-pink-500" },
  { value: "cyan",    label: "Cyan",    classes: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",         dot: "bg-cyan-500" },
]

export function tagColorClasses(color: string): string {
  return TAG_COLORS.find((c) => c.value === color)?.classes ?? TAG_COLORS[0].classes
}

export function tagColorDot(color: string): string {
  return TAG_COLORS.find((c) => c.value === color)?.dot ?? TAG_COLORS[0].dot
}
