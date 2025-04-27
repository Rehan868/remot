"use client"

import { useState, useEffect } from "react"
import { format, isSameDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRoomAvailability } from "@/hooks/use-room-availability"
import { useToast } from "@/hooks/use-toast"
import type { DateRange } from "react-day-picker"

interface DateRangePickerProps {
  propertyName?: string
  roomNumber?: string
  currentBookingId?: string
  value: DateRange
  onChange: (value: DateRange) => void
  disabled?: boolean
}

export function DateRangePicker({
  propertyName,
  roomNumber,
  currentBookingId,
  value,
  onChange,
  disabled = false,
}: DateRangePickerProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<DateRange>(value)

  const { bookedPeriods, isLoading, isDateBooked, isRangeAvailable } = useRoomAvailability(
    propertyName,
    roomNumber,
    currentBookingId,
  )

  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  // Function to disable already booked dates in the calendar
  const disabledDays = (date: Date) => {
    // If no property or room is selected, don't disable any dates
    if (!propertyName || !roomNumber) return false

    // Always allow the current booking's dates when editing
    if (currentBookingId && value.from && value.to) {
      if ((value.from && isSameDay(date, value.from)) || (value.to && isSameDay(date, value.to))) {
        return false
      }
    }

    // Disable dates that are already booked
    return isDateBooked(date)
  }

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) return

    setInternalValue(range)

    // Only validate and update if we have a complete range
    if (range.from && range.to) {
      // Check if the selected range is available
      if (propertyName && roomNumber && !isRangeAvailable(range.from, range.to)) {
        toast({
          title: "Date Range Unavailable",
          description: "The selected dates overlap with an existing booking. Please choose different dates.",
          variant: "destructive",
        })
        return
      }

      // If we get here, the range is valid - update the parent component
      // but don't close the popover - let the user click outside to close it
      onChange(range)
    } else {
      // If only the start date is selected, also update the parent
      // This allows tracking the first click (check-in date)
      onChange(range)
    }
  }

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} - {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>Select booking dates</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {isLoading ? (
            <div className="p-4 text-center">
              <p>Loading availability...</p>
            </div>
          ) : (
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={internalValue?.from}
              selected={internalValue}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={disabledDays}
              className="pointer-events-auto"
            />
          )}

          {propertyName && roomNumber && bookedPeriods.length > 0 && (
            <div className="p-3 border-t text-xs text-muted-foreground">
              <p>Dates in gray are unavailable due to existing bookings.</p>
              <p className="mt-1">Click once for check-in, twice for check-out.</p>
              <p className="mt-1">Click outside calendar to close.</p>
            </div>
          )}

          {(!propertyName || !roomNumber) && (
            <div className="p-3 border-t text-xs text-muted-foreground">
              <p>Please select a property and room to see availability.</p>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
