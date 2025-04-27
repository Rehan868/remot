import { createClient } from "@/lib/supabase"

// Check if a room is currently booked
export async function checkRoomBookingStatus(
  roomId: string,
  roomNumber: string,
): Promise<{
  isBooked: boolean
  bookingId?: string
}> {
  const supabase = createClient()
  const today = new Date().toISOString().split("T")[0]

  try {
    // Find any active bookings for this room using room_number instead of room_id
    const { data, error } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("room_number", roomNumber) // Changed from room_id to room_number
      .lte("check_in", today)
      .gte("check_out", today)
      .in("status", ["confirmed", "checked-in"])
      .limit(1)

    if (error) throw error

    return {
      isBooked: data && data.length > 0,
      bookingId: data && data.length > 0 ? data[0].id : undefined,
    }
  } catch (error) {
    console.error("Error checking room booking status:", error)
    return { isBooked: false }
  }
}

// Sync room status with current bookings
export async function syncRoomStatus(roomId: string, roomNumber: string, currentStatus: string): Promise<string> {
  // If room is already marked as maintenance or cleaning, don't change it
  if (currentStatus === "maintenance" || currentStatus === "cleaning") {
    return currentStatus
  }

  const { isBooked } = await checkRoomBookingStatus(roomId, roomNumber)
  const newStatus = isBooked ? "occupied" : "available"

  // Only update if status has changed
  if (newStatus !== currentStatus) {
    const supabase = createClient()
    try {
      await supabase
        .from("rooms")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId)
    } catch (error) {
      console.error("Error updating room status:", error)
    }
  }

  return newStatus
}
