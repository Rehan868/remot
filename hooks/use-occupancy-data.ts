"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"

export type OccupancyData = {
  month: string
  occupancyRate: number
  revenue: number
}

export type OccupancyFilters = {
  property?: string
  dateRange?: { from?: Date; to?: Date }
}

export function useOccupancyData(filters: OccupancyFilters = {}) {
  const [data, setData] = useState<OccupancyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchOccupancyData() {
      setIsLoading(true)
      setError(null)

      try {
        // Get current year or use date range if provided
        const currentYear = new Date().getFullYear()
        const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date(currentYear, 0, 1)
        const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date(currentYear, 11, 31)

        // Format dates for database query
        const startDateStr = startDate.toISOString().split("T")[0]
        const endDateStr = endDate.toISOString().split("T")[0]

        // Fetch bookings for the current year
        let bookingsQuery = supabase
          .from("bookings")
          .select("check_in, check_out, amount, property")
          .gte("check_in", startDateStr)
          .lte("check_out", endDateStr)

        // Apply property filter if specified
        if (filters.property && filters.property !== "all") {
          bookingsQuery = bookingsQuery.eq("property", filters.property)
        }

        const { data: bookings, error: bookingsError } = await bookingsQuery

        if (bookingsError) throw bookingsError

        // Fetch total rooms count - without filtering by property column
        // Just get the total count of rooms
        const { count: totalRooms, error: roomsCountError } = await supabase
          .from("rooms")
          .select("*", { count: "exact", head: true })

        if (roomsCountError) throw roomsCountError

        // Use a safe default if count is null
        const roomsCount = totalRooms || 1 // Avoid division by zero

        // Initialize monthly data
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        const monthlyData: Record<string, { occupiedDays: number; totalDays: number; revenue: number }> = {}

        months.forEach((month, index) => {
          monthlyData[month] = { occupiedDays: 0, totalDays: 0, revenue: 0 }
        })

        // Calculate occupancy and revenue by month
        if (bookings) {
          bookings.forEach((booking) => {
            const checkIn = new Date(booking.check_in)
            const checkOut = new Date(booking.check_out)
            const amount = booking.amount || 0

            // Skip if dates are invalid
            if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return

            // Calculate duration in days
            const duration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24))

            // Distribute the booking across months
            const currentDate = new Date(checkIn)
            while (currentDate < checkOut) {
              const monthIndex = currentDate.getMonth()
              const monthName = months[monthIndex]

              monthlyData[monthName].occupiedDays += 1
              monthlyData[monthName].revenue += amount / duration // Distribute revenue evenly across days

              // Move to next day
              currentDate.setDate(currentDate.getDate() + 1)
            }
          })
        }

        // Calculate days in each month for the current year
        months.forEach((month, index) => {
          const daysInMonth = new Date(currentYear, index + 1, 0).getDate()
          monthlyData[month].totalDays = daysInMonth * roomsCount
        })

        // Convert to array format for the chart
        const occupancyData = months.map((month) => {
          const monthData = monthlyData[month]
          const occupancyRate = monthData.totalDays > 0 ? (monthData.occupiedDays / monthData.totalDays) * 100 : 0

          return {
            month,
            occupancyRate: Math.round(occupancyRate),
            revenue: Math.round(monthData.revenue),
          }
        })

        setData(occupancyData)
      } catch (err) {
        console.error("Error fetching occupancy data:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch occupancy data"))

        // Fallback to sample data
        setData([
          { month: "Jan", occupancyRate: 65, revenue: 12400 },
          { month: "Feb", occupancyRate: 72, revenue: 15200 },
          { month: "Mar", occupancyRate: 80, revenue: 18600 },
          { month: "Apr", occupancyRate: 87, revenue: 21400 },
          { month: "May", occupancyRate: 74, revenue: 16800 },
          { month: "Jun", occupancyRate: 68, revenue: 14500 },
          { month: "Jul", occupancyRate: 78, revenue: 17900 },
          { month: "Aug", occupancyRate: 82, revenue: 19300 },
          { month: "Sep", occupancyRate: 76, revenue: 16700 },
          { month: "Oct", occupancyRate: 84, revenue: 20100 },
          { month: "Nov", occupancyRate: 70, revenue: 15800 },
          { month: "Dec", occupancyRate: 92, revenue: 24600 },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOccupancyData()
  }, [filters, supabase])

  return { data, isLoading, error }
}
