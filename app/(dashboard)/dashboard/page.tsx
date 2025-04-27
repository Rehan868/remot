import type React from "react"
import { BedDouble, CalendarPlus, ClipboardCheck, Receipt, Users, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Suspense } from "react"

// Import components
import { EnhancedPerformanceChart } from "@/components/dashboard/EnhancedPerformanceChart"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { TodayActivity } from "@/components/dashboard/TodayActivity"
import { RecentBookingsSection } from "@/components/dashboard/RecentBookingsSection"

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back to your hotel management dashboard</p>
      </div>

      {/* Stats Cards */}
      <Suspense
        fallback={
          <div className="h-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-full rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      {/* Performance Chart and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Hotel Performance</h2>
                <p className="text-sm text-muted-foreground">Yearly overview of occupancy rates and revenue</p>
              </div>
              <Suspense fallback={<div className="h-80 rounded-lg bg-muted animate-pulse" />}>
                <EnhancedPerformanceChart />
              </Suspense>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <QuickActionButton
                  href="/bookings/new"
                  icon={
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <CalendarPlus className="h-5 w-5" />
                    </div>
                  }
                  label="New Booking"
                  subLabel="Create reservation"
                />
                <QuickActionButton
                  href="/rooms"
                  icon={
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <BedDouble className="h-5 w-5" />
                    </div>
                  }
                  label="Rooms"
                  subLabel="Manage inventory"
                />
                <QuickActionButton
                  href="/cleaning"
                  icon={
                    <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                  }
                  label="Cleaning"
                  subLabel="Status & tasks"
                />
                <QuickActionButton
                  href="/expenses"
                  icon={
                    <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Receipt className="h-5 w-5" />
                    </div>
                  }
                  label="Expenses"
                  subLabel="Track finances"
                />
                <QuickActionButton
                  href="/users"
                  icon={
                    <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                  }
                  label="Users"
                  subLabel="Staff & access"
                />
                <QuickActionButton
                  href="/reports"
                  icon={
                    <div className="h-10 w-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                  }
                  label="Reports"
                  subLabel="View analytics"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Today's Activity */}
      <div className="mb-8">
        <Suspense fallback={<div className="h-80 rounded-lg bg-muted animate-pulse" />}>
          <TodayActivity />
        </Suspense>
      </div>

      {/* Recent Bookings */}
      <div className="mb-8">
        <Suspense fallback={<div className="h-80 rounded-lg bg-muted animate-pulse" />}>
          <RecentBookingsSection />
        </Suspense>
      </div>
    </div>
  )
}

// Quick Action Button Component
function QuickActionButton({
  href,
  icon,
  label,
  subLabel,
}: {
  href: string
  icon: React.ReactNode
  label: string
  subLabel: string
}) {
  return (
    <Link href={href}>
      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-3">
        {icon}
        <div>
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-muted-foreground">{subLabel}</div>
        </div>
      </div>
    </Link>
  )
}
