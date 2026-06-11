import { Skeleton } from "@/components/ui/skeleton"

export default function MeetingsLoading() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  )
}
