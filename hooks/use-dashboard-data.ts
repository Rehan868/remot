"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"

export type DashboardStats = {
  availableRooms: number
  totalRooms: number
  todayCheckIns: number
  todayCheckOuts: number
  occupancyRate: number
  weeklyOccupancyTrend: string
}

export type CheckInOut = {
  id: string
  guest_name: string
  room_number: string
  property: string
  adults: number
  children: number
  status: string
  time?: string
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    availableRooms: 0,
    totalRooms: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    occupancyRate: 0,
    weeklyOccupancyTrend: "+0%",
  })
  const [todayCheckIns, setTodayCheckIns] = useState<CheckInOut[]>([])
  const [todayCheckOuts, setTodayCheckOuts] = useState<CheckInOut[]>([])
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true)
      setError(null)
      const supabase = createClient()

      try {
        // Get today's date in ISO format (YYYY-MM-DD)
        const today = new Date().toISOString().split("T")[0]

        // Fetch room statistics
        const { data: rooms, error: roomsError } = await supabase.from("rooms").select("id, status")

        if (roomsError) throw roomsError

        const totalRooms = rooms?.length || 0
        const availableRooms = rooms?.filter((room) => room.status === "available").length || 0
        const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0

        // Fetch today's check-ins
        const { data: checkIns, error: checkInsError } = await supabase
          .from("bookings")
          .select("id, guest_name, room_number, property, adults, children, status")
          .eq("check_in", today)
          .order("guest_name")

        if (checkInsError) throw checkInsError

        // Fetch today's check-outs
        const { data: checkOuts, error: checkOutsError } = await supabase
          .from("bookings")
          .select("id, guest_name, room_number, property, adults, children, status")
          .eq("check_out", today)
          .order("guest_name")

        if (checkOutsError) throw checkOutsError

        // Fetch recent bookings
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select("id, guest_name, room_number, property, check_in, check_out, status")
          .order("created_at", { ascending: false })
          .limit(5)

        if (bookingsError) throw bookingsError

        // Update state with fetched data
        setStats({
          availableRooms,
          totalRooms,
          todayCheckIns: checkIns?.length || 0,
          todayCheckOuts: checkOuts?.length || 0,
          occupancyRate,
          weeklyOccupancyTrend: occupancyRate > 70 ? "+5%" : "+2%", // Placeholder calculation
        })

        setTodayCheckIns(checkIns || [])
        setTodayCheckOuts(checkOuts || [])
        setRecentBookings(bookings || [])
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch dashboard data"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return { stats, todayCheckIns, todayCheckOuts, recentBookings, isLoading, error }
}
