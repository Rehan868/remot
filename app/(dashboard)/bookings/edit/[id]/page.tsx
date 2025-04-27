"use client"

import { useParams, useRouter } from "next/navigation"
import { AddEditBookingForm } from "@/components/bookings/add-edit-booking-form"
import { useBooking } from "@/hooks/use-bookings"
import { Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function BookingEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [bookingData, setBookingData] = useState(null)
  const { data: booking, isLoading, error } = useBooking(id === "new" ? undefined : id)

  useEffect(() => {
    if (booking) {
      console.log("Booking data received:", booking)
      // Convert booking data to form data format
      setBookingData({
        reference: booking.booking_number,
        guestName: booking.guest_name,
        guestEmail: booking.guest_email,
        guestPhone: booking.guest_phone,
        property: booking.property,
        roomNumber: booking.room_number,
        checkIn: new Date(booking.check_in),
        checkOut: new Date(booking.check_out),
        adults: booking.adults,
        children: booking.children,
        baseRate: booking.base_rate,
        totalAmount: booking.amount,
        amountPaid: booking.amount_paid,
        remainingAmount: booking.remaining_amount,
        securityDeposit: booking.security_deposit,
        commission: booking.commission,
        tourismFee: booking.tourism_fee,
        vat: booking.vat,
        netToOwner: booking.net_to_owner,
        notes: booking.notes,
        status: booking.status,
        paymentStatus: booking.payment_status,
        sendConfirmation: false,
      })
    }
  }, [booking])

  // Don't try to fetch if id is "new"
  if (id === "new") {
    return <AddEditBookingForm mode="add" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading booking details...</span>
      </div>
    )
  }

  if (error || (!booking && id !== "new")) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-500">Failed to load booking details</p>
        <p className="text-muted-foreground mb-4">{error?.message || "The booking could not be found"}</p>
        <Button variant="outline" asChild>
          <Link href="/bookings">Return to Bookings</Link>
        </Button>
      </div>
    )
  }

  // Only render the form when bookingData is available
  if (!bookingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Preparing booking form...</span>
      </div>
    )
  }

  return <AddEditBookingForm mode="edit" bookingData={bookingData} bookingId={id} />
}
