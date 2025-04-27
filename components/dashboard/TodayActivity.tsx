"use client"

import Link from "next/link"
import { ArrowDownToLine } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { TodayCheckins } from "@/components/dashboard/TodayCheckins"
import { TodayCheckouts } from "@/components/dashboard/TodayCheckouts"

export function TodayActivity() {
  const { todayCheckIns, todayCheckOuts, isLoading, error } = useDashboardData()

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Today's Activity</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Check-ins */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <ArrowDownToLine className="mr-2 h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">Today's Check-ins</h3>
                </div>
                <Link href="/bookings?filter=today-checkins">
                  <span className="text-sm text-blue-500 hover:underline">View All</span>
                </Link>
              </div>
              <TodayCheckins data={todayCheckIns} isLoading={isLoading} />
            </CardContent>
          </Card>

          {/* Check-outs */}
          <TodayCheckouts data={todayCheckOuts} isLoading={isLoading} />
        </div>
      </CardContent>
    </Card>
  )
}
