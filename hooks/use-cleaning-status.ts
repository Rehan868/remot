"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"

export type CleaningStatus = "Clean" | "Dirty" | "In Progress"

type Room = {
  id: string
  number: string
  property_name: string
  status: string
  updated_at: string
  next_checkin?: string
}

type CleaningRoom = {
  id: string
  roomNumber: string
  property: string
  status: CleaningStatus
  lastCleaned: string | null
  nextCheckIn: string | null
}

// Hook for fetching all room cleaning statuses
export function useCleaningStatus() {
  const [rooms, setRooms] = useState<CleaningRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const mapRoomStatus = (status: string): CleaningStatus => {
    if (status === "cleaning") return "In Progress"
    if (status === "available") return "Clean"
    return "Dirty" // For occupied, maintenance, or any other status
  }

  const mapCleaningStatus = (status: CleaningStatus): string => {
    if (status === "In Progress") return "cleaning"
    if (status === "Clean") return "available"
    return "maintenance" // When marked as dirty, set to maintenance until cleaned
  }

  const fetchCleaningStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch rooms from Supabase
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("id, number, property_name, status, updated_at")
        .order("property_name")
        .order("number")

      if (roomsError) throw roomsError

      // Fetch upcoming bookings to determine next check-in dates
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("room_number, check_in")
        .gte("check_in", new Date().toISOString())
        .order("check_in")

      if (bookingsError) throw bookingsError

      // Create a map of room numbers to their next check-in date
      const nextCheckInMap = new Map<string, string>()
      bookingsData?.forEach((booking) => {
        if (!nextCheckInMap.has(booking.room_number)) {
          nextCheckInMap.set(booking.room_number, booking.check_in)
        }
      })

      // Transform the data to match our component's expected format
      const cleaningRooms: CleaningRoom[] =
        roomsData?.map((room) => ({
          id: room.id,
          roomNumber: room.number,
          property: room.property_name,
          status: mapRoomStatus(room.status),
          lastCleaned: room.status === "available" ? room.updated_at : null,
          nextCheckIn: nextCheckInMap.get(room.number) || null,
        })) || []

      setRooms(cleaningRooms)
    } catch (err) {
      console.error("Error fetching cleaning status:", err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const updateRoomStatus = useCallback(
    async (roomId: string, newStatus: CleaningStatus) => {
      try {
        const now = new Date().toISOString()

        // Update the room status in Supabase
        const { error } = await supabase
          .from("rooms")
          .update({
            status: mapCleaningStatus(newStatus),
            updated_at: now,
          })
          .eq("id", roomId)

        if (error) throw error

        // Update the local state
        setRooms((prevRooms) =>
          prevRooms.map((room) => {
            if (room.id === roomId) {
              return {
                ...room,
                status: newStatus,
                lastCleaned: newStatus === "Clean" ? now : room.lastCleaned,
              }
            }
            return room
          }),
        )

        // Log the cleaning activity in the audit logs table if it exists
        try {
          await supabase.from("audit_logs").insert({
            action: `Room status updated to ${newStatus}`,
            entity_type: "room",
            entity_id: roomId,
            created_at: now,
            user_id: "system", // Ideally this would be the actual user ID
          })
        } catch (logError) {
          // Don't fail the operation if audit logging fails
          console.error("Failed to log room status change:", logError)
        }

        return { success: true }
      } catch (error) {
        console.error("Error updating room status:", error)
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to update room status",
        }
      }
    },
    [supabase],
  )

  useEffect(() => {
    fetchCleaningStatus()
  }, [fetchCleaningStatus])

  return { rooms, isLoading, error, updateRoomStatus, refetch: fetchCleaningStatus }
}
