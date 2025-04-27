import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="bg-card border rounded-md p-1 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 p-1">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-md" />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <Skeleton className="h-[400px] rounded-md" />
        <Skeleton className="h-[300px] rounded-md" />
      </div>
    </div>
  )
}
