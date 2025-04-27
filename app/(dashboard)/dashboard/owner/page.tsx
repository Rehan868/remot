import { LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OwnerDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Owner Dashboard</h1>
      <p className="text-muted-foreground">Welcome to your owner dashboard.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="font-medium">Monthly Revenue</h3>
          <p className="text-sm text-muted-foreground">$45,250.00 this month</p>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="font-medium">Occupancy Rate</h3>
          <p className="text-sm text-muted-foreground">87% this month</p>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="font-medium">Expenses</h3>
          <p className="text-sm text-muted-foreground">$12,350.00 this month</p>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="font-medium">Quick Actions</h3>
          <div className="flex flex-col space-y-2">
            <Button variant="outline" asChild className="h-auto py-2 justify-start w-full">
              <Link href="/dashboard/owner">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
