"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { isSameDay, isWithinInterval, parseISO } from "date-fns"

interface BookedPeriod {
  id: string
  checkIn: Date
  checkOut: Date
}

export function useRoomAvailability(propertyName?: string, roomNumber?: string, currentBookingId?: string) {
  const [bookedPeriods, setBookedPeriods] = useState<BookedPeriod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchBookedPeriods() {
      if (!propertyName || !roomNumber) {
        setBookedPeriods([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        let query = supabase
          .from("bookings")
          .select("id, check_in, check_out")
          .eq("property", propertyName)
          .eq("room_number", roomNumber)
          .in("status", ["confirmed", "checked-in", "pending"])

        // Only add the neq condition if currentBookingId is provided
        if (currentBookingId) {
          query = query.neq("id", currentBookingId)
        }

        const { data, error } = await query

        if (error) {
          throw new Error(`Error fetching room availability: ${error.message}`)
        }

        const periods = data.map((booking) => ({
          id: booking.id,
          checkIn: parseISO(booking.check_in),
          checkOut: parseISO(booking.check_out),
        }))

        setBookedPeriods(periods)
      } catch (err) {
        console.error("Error fetching room availability:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookedPeriods()
  }, [propertyName, roomNumber, currentBookingId])

  // Check if a specific date is already booked
  const isDateBooked = (date: Date): boolean => {
    return bookedPeriods.some((period) => {
      // Check if the date is the check-in or check-out date
      if (isSameDay(date, period.checkIn) || isSameDay(date, period.checkOut)) {
        return true
      }

      // Check if the date is between check-in and check-out
      return isWithinInterval(date, {
        start: period.checkIn,
        end: period.checkOut,
      })
    })
  }

  // Check if a date range is available (doesn't overlap with any booked periods)
  const isRangeAvailable = (from: Date, to: Date): boolean => {
    // Check if any day in the range is already booked
    const currentDate = new Date(from)
    while (currentDate <= to) {
      if (isDateBooked(currentDate)) {
        return false
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return true
  }

  return {
    bookedPeriods,
    isLoading,
    error,
    isDateBooked,
    isRangeAvailable,
  }
}
