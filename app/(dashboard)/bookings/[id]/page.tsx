"use client"

import { useBooking } from "@/hooks/use-bookings"
import { BookingDetails } from "@/components/bookings/booking-details"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface BookingPageProps {
  params: {
    id: string
  }
}

export default function BookingPage({ params }: BookingPageProps) {
  const { id } = params
  const { data: booking, isLoading, error } = useBooking(id)

  // Special case for the "new" page - we shouldn't be hitting this route
  if (id === "new") {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Invalid Route</AlertTitle>
        <AlertDescription>
          The "new" booking page should be accessed via /bookings/new, not /bookings/new.
        </AlertDescription>
      </Alert>
    )
  }

  return <BookingDetails booking={booking} isLoading={isLoading} error={error} />
}
