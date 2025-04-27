import { Loader } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-96">
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading users...</span>
    </div>
  )
}
