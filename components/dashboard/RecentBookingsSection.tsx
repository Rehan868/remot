// filepath: c:\Users\admin\Downloads\V0.dev\components\dashboard\RecentBookingsSection.tsx
"use client"

import { useDashboardData } from "@/hooks/use-dashboard-data"
import { RecentBookings } from "@/components/dashboard/RecentBookings"

export function RecentBookingsSection() {
  const { recentBookings, isLoading, error } = useDashboardData()

  return <RecentBookings data={recentBookings} isLoading={isLoading} error={error} />
}