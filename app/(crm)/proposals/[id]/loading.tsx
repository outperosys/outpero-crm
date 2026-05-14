import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function ProposalWorkspaceLoading() {
  return (
    <div className="max-w-3xl space-y-0">
      {/* Nav bar */}
      <div className="flex items-center justify-between py-1 mb-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-36" />
      </div>

      {/* Document header */}
      <div className="space-y-3 pb-6">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Sections */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
