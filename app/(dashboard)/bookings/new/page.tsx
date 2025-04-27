"use client"

import { AddEditBookingForm } from "@/components/bookings/add-edit-booking-form"
import { Spinner } from "@/components/ui/spinner"
import { Suspense, useEffect } from "react"

export default function BookingAddPage() {
  // Add debugging logs
  useEffect(() => {
    console.log("BookingAddPage mounted in dashboard layout")
    return () => console.log("BookingAddPage unmounted")
  }, [])

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      }
    >
      <AddEditBookingForm mode="add" />
    </Suspense>
  )
}
