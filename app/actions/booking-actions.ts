"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { syncRoomStatus } from "@/lib/room-utils"
// Add import for the audit logger
import { logActivity } from "@/lib/audit-logger"

// Update the createBookingAction function to log the activity
export async function createBookingAction(formData: FormData) {
  const supabase = createServerClient()

  try {
    // Extract data from form
    const bookingNumber = formData.get("reference") as string
    const guestName = formData.get("guestName") as string
    const guestEmail = formData.get("guestEmail") as string
    const guestPhone = formData.get("guestPhone") as string
    const property = formData.get("property") as string
    const roomNumber = formData.get("roomNumber") as string
    const checkIn = formData.get("checkIn") as string
    const checkOut = formData.get("checkOut") as string
    const adults = Number.parseInt(formData.get("adults") as string)
    const children = Number.parseInt(formData.get("children") as string)
    const baseRate = Number.parseFloat(formData.get("baseRate") as string)
    const totalAmount = Number.parseFloat(formData.get("totalAmount") as string)
    const amountPaid = Number.parseFloat(formData.get("amountPaid") as string)
    const remainingAmount = Number.parseFloat(formData.get("remainingAmount") as string)
    const securityDeposit = Number.parseFloat(formData.get("securityDeposit") as string)
    const commission = Number.parseFloat(formData.get("commission") as string)
    const tourismFee = Number.parseFloat(formData.get("tourismFee") as string)
    const vat = Number.parseFloat(formData.get("vat") as string)
    const netToOwner = Number.parseFloat(formData.get("netToOwner") as string)
    const notes = formData.get("notes") as string
    const status = formData.get("status") as string
    const paymentStatus = formData.get("paymentStatus") as string

    // Create booking record
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        booking_number: bookingNumber,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        property: property,
        room_number: roomNumber,
        check_in: checkIn,
        check_out: checkOut,
        adults: adults,
        children: children,
        base_rate: baseRate,
        amount: totalAmount,
        amount_paid: amountPaid,
        remaining_amount: remainingAmount,
        security_deposit: securityDeposit,
        commission: commission,
        tourism_fee: tourismFee,
        vat: vat,
        net_to_owner: netToOwner,
        notes: notes,
        status: status as any,
        payment_status: paymentStatus as any,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Log the activity
    await logActivity({
      action: "create",
      entityType: "booking",
      entityId: data.id,
      details: `Created booking #${bookingNumber} for ${guestName} in room ${roomNumber} from ${checkIn} to ${checkOut}`,
    })

    // Revalidate the bookings page to show the new booking
    revalidatePath("/bookings")

    // Get the room ID for the room number
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .select("id")
      .eq("number", roomNumber)
      .single()

    if (!roomError && roomData) {
      // Update room status
      await syncRoomStatus(roomData.id, roomNumber, "")
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Update the updateBookingAction function to log the activity
export async function updateBookingAction(id: string, formData: FormData) {
  const supabase = createServerClient()

  try {
    // Extract data from form
    const guestName = formData.get("guestName") as string
    const guestEmail = formData.get("guestEmail") as string
    const guestPhone = formData.get("guestPhone") as string
    const property = formData.get("property") as string
    const roomNumber = formData.get("roomNumber") as string
    const checkIn = formData.get("checkIn") as string
    const checkOut = formData.get("checkOut") as string
    const adults = Number.parseInt(formData.get("adults") as string)
    const children = Number.parseInt(formData.get("children") as string)
    const baseRate = Number.parseFloat(formData.get("baseRate") as string)
    const totalAmount = Number.parseFloat(formData.get("totalAmount") as string)
    const amountPaid = Number.parseFloat(formData.get("amountPaid") as string)
    const remainingAmount = Number.parseFloat(formData.get("remainingAmount") as string)
    const securityDeposit = Number.parseFloat(formData.get("securityDeposit") as string)
    const commission = Number.parseFloat(formData.get("commission") as string)
    const tourismFee = Number.parseFloat(formData.get("tourismFee") as string)
    const vat = Number.parseFloat(formData.get("vat") as string)
    const netToOwner = Number.parseFloat(formData.get("netToOwner") as string)
    const notes = formData.get("notes") as string
    const status = formData.get("status") as string
    const paymentStatus = formData.get("paymentStatus") as string

    // Get the booking number for the audit log
    const { data: existingBooking, error: fetchError } = await supabase
      .from("bookings")
      .select("booking_number")
      .eq("id", id)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // Update booking record
    const { data, error } = await supabase
      .from("bookings")
      .update({
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        property: property,
        room_number: roomNumber,
        check_in: checkIn,
        check_out: checkOut,
        adults: adults,
        children: children,
        base_rate: baseRate,
        amount: totalAmount,
        amount_paid: amountPaid,
        remaining_amount: remainingAmount,
        security_deposit: securityDeposit,
        commission: commission,
        tourism_fee: tourismFee,
        vat: vat,
        net_to_owner: netToOwner,
        notes: notes,
        status: status as any,
        payment_status: paymentStatus as any,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Log the activity
    await logActivity({
      action: "update",
      entityType: "booking",
      entityId: id,
      details: `Updated booking #${existingBooking.booking_number} for ${guestName} in room ${roomNumber} from ${checkIn} to ${checkOut}`,
    })

    // Revalidate the bookings page to show the updated booking
    revalidatePath("/bookings")
    revalidatePath(`/bookings/${id}`)

    // Get the room ID for the room number
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .select("id")
      .eq("number", roomNumber)
      .single()

    if (!roomError && roomData) {
      // Update room status
      await syncRoomStatus(roomData.id, roomNumber, "")
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Update the deleteBookingAction function to log the activity
export async function deleteBookingAction(id: string) {
  const supabase = createServerClient()

  try {
    // Get the booking to find the room number and for the audit log
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("room_number, booking_number, guest_name")
      .eq("id", id)
      .single()

    if (bookingError) {
      return { success: false, error: bookingError.message }
    }

    // Delete the booking
    const { error } = await supabase.from("bookings").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Log the activity
    await logActivity({
      action: "delete",
      entityType: "booking",
      entityId: id,
      details: `Deleted booking #${booking.booking_number} for ${booking.guest_name} in room ${booking.room_number}`,
    })

    // Revalidate the bookings page
    revalidatePath("/bookings")

    // If we have the room number, update its status
    if (booking?.room_number) {
      // Get the room ID for the room number
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("id")
        .eq("number", booking.room_number)
        .single()

      if (!roomError && roomData) {
        // Update room status
        await syncRoomStatus(roomData.id, booking.room_number, "")
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

export async function getBookingAction(id: string) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
