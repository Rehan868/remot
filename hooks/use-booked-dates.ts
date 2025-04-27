"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import type { DateRange } from "react-day-picker"
import { isSameDay, parseISO } from "date-fns"

interface BookedDate {
  bookingId: string
  date: Date
}

export function useBookedDates(property?: string, roomNumber?: string) {
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchBookedDates() {
      if (!property || !roomNumber) {
        setBookedDates([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Fetch bookings for the selected property and room
        const { data, error } = await supabase
          .from("bookings")
          .select("id, check_in, check_out")
          .eq("property", property)
          .eq("room_number", roomNumber)
          .or("status.eq.confirmed,status.eq.pending,status.eq.checked-in")

        if (error) {
          throw error
        }

        // Convert the bookings to an array of booked dates
        const dates: BookedDate[] = []

        if (data) {
          data.forEach((booking) => {
            const checkIn = parseISO(booking.check_in)
            const checkOut = parseISO(booking.check_out)

            // Add all dates between check-in and check-out (inclusive)
            const currentDate = new Date(checkIn)
            while (currentDate <= checkOut) {
              dates.push({
                bookingId: booking.id,
                date: new Date(currentDate),
              })
              currentDate.setDate(currentDate.getDate() + 1)
            }
          })
        }

        setBookedDates(dates)
      } catch (err) {
        console.error("Error fetching booked dates:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setBookedDates([]) // Set empty array on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookedDates()
  }, [property, roomNumber, supabase])

  // Function to check if a date is already booked
  const isDateBooked = useCallback(
    (date: Date, currentBookingId?: string): boolean => {
      // Add debugging to see what's happening
      const isBooked = bookedDates.some(
        (bookedDate) =>
          isSameDay(bookedDate.date, date) && (!currentBookingId || bookedDate.bookingId !== currentBookingId),
      )

      console.log(`Checking date ${date.toISOString().split("T")[0]}: ${isBooked ? "Booked" : "Available"}`)
      return isBooked
    },
    [bookedDates],
  )

  // Function to check if a date range is available
  const isRangeAvailable = useCallback(
    (range: DateRange, currentBookingId?: string): boolean => {
      if (!range.from || !range.to) return true

      console.log(
        `Checking range from ${range.from.toISOString().split("T")[0]} to ${range.to.toISOString().split("T")[0]}`,
      )
      console.log(`Total booked dates: ${bookedDates.length}`)

      // Check each date in the range
      const currentDate = new Date(range.from)
      while (currentDate <= range.to) {
        if (isDateBooked(currentDate, currentBookingId)) {
          console.log(`Range check failed: ${currentDate.toISOString().split("T")[0]} is booked`)
          return false
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }

      console.log("Range is available")
      return true
    },
    [isDateBooked, bookedDates],
  )

  return { bookedDates, isLoading, error, isDateBooked, isRangeAvailable }
}
