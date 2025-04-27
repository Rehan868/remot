"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBookedDates } from "@/hooks/use-booked-dates"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoomAvailabilityProps {
  propertyId?: string
  roomNumber?: string
  onDateSelect?: (date: Date) => void
  className?: string
}

export function RoomAvailability({ propertyId, roomNumber, onDateSelect, className }: RoomAvailabilityProps) {
  const [month, setMonth] = useState<Date>(new Date())
  const { bookedDates, isLoading, isDateBooked } = useBookedDates(propertyId, roomNumber)

  // Reset month when property or room changes
  useEffect(() => {
    setMonth(new Date())
  }, [propertyId, roomNumber])

  const handlePreviousMonth = () => {
    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Custom day renderer to show availability status
  const renderDay = (day: Date, modifiers: any) => {
    const isBooked = isDateBooked(day)

    return (
      <div
        className={cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          isBooked ? "bg-red-50 hover:bg-red-100" : "bg-green-50 hover:bg-green-100",
          modifiers.disabled && "text-muted-foreground opacity-50",
        )}
      >
        <div className="flex h-full w-full items-center justify-center">
          {day.getDate()}
          {isBooked && <div className="absolute bottom-1 h-1 w-1 rounded-full bg-red-500" />}
        </div>
      </div>
    )
  }

  if (!propertyId || !roomNumber) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Room Availability</CardTitle>
          <CardDescription>Select a property and room to view availability</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Room Availability</CardTitle>
          <CardDescription>
            {propertyId && roomNumber
              ? `Viewing availability for ${propertyId}, Room ${roomNumber}`
              : "Select a property and room"}
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="p-3">
            <div className="flex justify-center text-sm font-medium">{format(month, "MMMM yyyy")}</div>
            <Calendar
              mode="single"
              month={month}
              onDayClick={onDateSelect}
              components={{
                Day: ({ date, ...props }) => renderDay(date, props),
              }}
              className="mt-4"
            />
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="mr-1 h-3 w-3 rounded-full bg-green-500" />
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="mr-1 h-3 w-3 rounded-full bg-red-500" />
                <span>Booked</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
