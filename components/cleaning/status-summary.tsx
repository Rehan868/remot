import type { CleaningStatus } from "@/hooks/use-cleaning-status"

interface StatusSummaryProps {
  cleanCount: number
  dirtyCount: number
  inProgressCount: number
}

export function StatusSummary({ cleanCount, dirtyCount, inProgressCount }: StatusSummaryProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <div className="bg-green-100 text-green-800 px-6 py-4 rounded-md flex items-center gap-3">
        <div className="h-4 w-4 rounded-full bg-green-500" />
        <span className="font-medium text-lg">{cleanCount} Clean</span>
      </div>
      <div className="bg-yellow-100 text-yellow-800 px-6 py-4 rounded-md flex items-center gap-3">
        <div className="h-4 w-4 rounded-full bg-yellow-500" />
        <span className="font-medium text-lg">{inProgressCount} In Progress</span>
      </div>
      <div className="bg-red-100 text-red-800 px-6 py-4 rounded-md flex items-center gap-3">
        <div className="h-4 w-4 rounded-full bg-red-500" />
        <span className="font-medium text-lg">{dirtyCount} Needs Cleaning</span>
      </div>
    </div>
  )
}

export function getStatusBadgeClass(status: CleaningStatus) {
  switch (status) {
    case "Clean":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "Dirty":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    case "In Progress":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
  }
}
