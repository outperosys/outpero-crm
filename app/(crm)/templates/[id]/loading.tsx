import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function TemplateEditorLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Back nav skeleton */}
      <Skeleton className="h-8 w-28" />

      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>

      <Separator />

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>

      {/* Placeholder reference */}
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  )
}
