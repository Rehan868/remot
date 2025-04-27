import { Skeleton } from "@/components/ui/skeleton"

export default function AuditLogsLoading() {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 mt-4 md:mt-0" />
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[240px]" />
          </div>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-border">
        <div className="bg-muted">
          <div className="grid grid-cols-6 px-6 py-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 grid grid-cols-6">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-32" />
            </div>
          ))}
        </div>
        <div className="bg-muted/30 px-6 py-4">
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
    </div>
  )
}
