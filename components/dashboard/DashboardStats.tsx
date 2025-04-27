// filepath: c:\Users\admin\Downloads\V0.dev\components\dashboard\DashboardStats.tsx
"use client"

import { BedDouble, ArrowDownToLine, ArrowUpFromLine, Percent } from "lucide-react"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { StatCard } from "@/components/dashboard/StatCard"

export function DashboardStats() {
  const { stats, isLoading, error } = useDashboardData()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 mb-8 bg-red-50 text-red-800 rounded-lg">
        <p>Error loading dashboard statistics: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Available Rooms"
        value={stats.availableRooms}
        description={`Out of ${stats.totalRooms} total rooms`}
        icon={BedDouble}
      />
      <StatCard
        title="Today's Check-ins"
        value={stats.todayCheckIns}
        description="Expected arrivals today"
        icon={ArrowDownToLine}
      />
      <StatCard
        title="Today's Check-outs"
        value={stats.todayCheckOuts}
        description="Departures scheduled today"
        icon={ArrowUpFromLine}
      />
      <StatCard
        title="Occupancy Rate"
        value={`${stats.occupancyRate}%`}
        trend="up"
        trendValue={stats.weeklyOccupancyTrend}
        icon={Percent}
      />
    </div>
  )
}