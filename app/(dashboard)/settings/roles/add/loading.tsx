import { Loader } from "lucide-react"

export default function AddRoleLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-medium">Loading</h3>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    </div>
  )
}
