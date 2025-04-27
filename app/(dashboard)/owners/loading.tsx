import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function OwnersLoading() {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 mb-8">
        <Skeleton className="h-10 w-full" />
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between border-b pb-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>

          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
