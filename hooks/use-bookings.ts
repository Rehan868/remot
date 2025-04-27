"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export type Booking = {
  id: string
  booking_number: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  property: string
  room_number: string
  check_in: string
  check_out: string
  adults: number
  children: number
  base_rate: number
  amount: number
  amount_paid: number
  remaining_amount: number
  security_deposit: number
  commission: number
  tourism_fee: number
  vat: number
  net_to_owner: number
  notes: string | null
  status: "pending" | "confirmed" | "checked-in" | "checked-out" | "cancelled"
  payment_status: "pending" | "partial" | "paid" | "refunded"
  guest_document: string | null
  created_at: string
  updated_at: string
}

interface UseBookingsOptions {
  roomId?: string
  ownerId?: string
  status?: string
  startDate?: string
  endDate?: string
}

// Hook for fetching all bookings
export function useBookings(options?: UseBookingsOptions) {
  const [data, setData] = useState<Booking[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchBookings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching bookings from database...")
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*")
        .order("check_in", { ascending: false }) // Changed to descending order to show recent bookings first

      if (error) {
        throw error
      }

      console.log("Bookings fetched:", bookings)

      if (bookings && bookings.length > 0) {
        setData(bookings)
      } else {
        // Only use mock data if no bookings were found
        console.log("No bookings found in database, using mock data")
        setData([
          // Your mock data here
        ])
      }
    } catch (err) {
      console.error("Error fetching bookings:", err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))

      // Use mock data as fallback
      setData([
        // Your mock data here
      ])
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  return { data, isLoading, error, refetch: fetchBookings }
}

// Hook for fetching a single booking
export function useBooking(bookingId: string) {
  const [data, setData] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setError(new Error("Booking ID is required"))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log(`Fetching booking with ID: ${bookingId}`)
      const { data: booking, error } = await supabase.from("bookings").select("*").eq("id", bookingId).single()

      if (error) {
        throw error
      }

      console.log("Booking fetched:", booking)

      if (booking) {
        setData(booking)
      } else {
        // If no booking was found with this ID
        console.log(`No booking found with ID: ${bookingId}`)
        setData(null)
      }
    } catch (err) {
      console.error(`Error fetching booking with ID ${bookingId}:`, err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))

      // Use mock data as fallback based on the ID
      if (bookingId === "booking-1") {
        setData({
          // Your mock data here
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [bookingId, supabase])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  return { data, isLoading, error, refetch: fetchBooking }
}

// Function to update a booking
export async function updateBooking(id: string, bookingData: Partial<Booking>) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({
        ...bookingData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, data: data[0] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update booking",
    }
  }
}

// Function to create a new booking
export async function createBooking(bookingData: Omit<Booking, "id" | "created_at" | "updated_at">) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          ...bookingData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, data: data[0] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create booking",
    }
  }
}

// Function to delete a booking
export async function deleteBooking(id: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("bookings").delete().eq("id", id).select()

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, data: data[0] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete booking",
    }
  }
}

// Hook for filtering bookings
export function useFilteredBookings(searchQuery: string, statusFilter: string, dateRange: any) {
  const { data: allBookings, isLoading, error, refetch } = useBookings()
  const [filteredData, setFilteredData] = useState<Booking[] | null>(null)

  useEffect(() => {
    if (!allBookings) return

    let filtered = [...allBookings]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.guest_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.room_number.includes(searchQuery) ||
          booking.booking_number.includes(searchQuery),
      )
    }

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }

    // Apply date range filter
    if (dateRange && dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from)
      const toDate = new Date(dateRange.to)

      filtered = filtered.filter((booking) => {
        const checkIn = new Date(booking.check_in)
        const checkOut = new Date(booking.check_out)

        return (
          (checkIn >= fromDate && checkIn <= toDate) ||
          (checkOut >= fromDate && checkOut <= toDate) ||
          (checkIn <= fromDate && checkOut >= toDate)
        )
      })
    }

    setFilteredData(filtered)
  }, [allBookings, searchQuery, statusFilter, dateRange])

  return { data: filteredData, isLoading, error, refetch }
}
