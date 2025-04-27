"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format, addDays, isSameDay, isWeekend, isToday } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  RefreshCw,
  Filter,
  CalendarIcon,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useProperties } from "@/hooks/use-properties"
import { useRoomTypes } from "@/hooks/use-room-types"
import { useRooms } from "@/hooks/use-rooms"
import { useBookings } from "@/hooks/use-bookings"
import { useRealTimeBookings } from "@/hooks/use-real-time-bookings"
import { createClient } from "@/lib/supabase"

// Utility function for delaying operations
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface RoomBooking {
  id: string
  guest_name: string
  check_in: string
  check_out: string
  status: "confirmed" | "checked-in" | "checked-out" | "cancelled" | "pending"
  booking_number: string
}

interface Room {
  id: string
  number: string
  property: string
  property_id: string
  type: string
  type_id: string
  status: "available" | "occupied" | "maintenance" | "cleaning"
  bookings: RoomBooking[]
}

// Generate array of dates for the calendar view
const generateDates = (startDate: Date, days: number) => {
  const dates = []
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    dates.push(date)
  }
  return dates
}

// Calculate booking position and width for the calendar view
const calculateBookingStyle = (booking: RoomBooking, viewStartDate: Date, totalDays: number) => {
  const startDate = new Date(booking.check_in)
  const endDate = new Date(booking.check_out)

  // Calculate days from view start to booking start
  const startDiff = Math.max(0, Math.floor((startDate.getTime() - viewStartDate.getTime()) / (24 * 60 * 60 * 1000)))

  // Calculate booking duration in days
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))

  // Ensure the booking is visible in the current view
  if (startDiff >= totalDays || startDiff + duration <= 0) {
    return null
  }

  // Adjust start and width if the booking extends outside the view
  const visibleStart = Math.max(0, startDiff)
  const visibleDuration = Math.min(totalDays - visibleStart, duration - Math.max(0, -startDiff))

  return {
    left: `${(visibleStart / totalDays) * 100}%`,
    width: `${(visibleDuration / totalDays) * 100}%`,
    status: booking.status,
  }
}

export default function AvailabilityPage() {
  const { toast } = useToast()
  const [viewStartDate, setViewStartDate] = useState(new Date())
  const [displayDays, setDisplayDays] = useState(14) // Show 2 weeks by default
  const [property, setProperty] = useState<string>("all")
  const [roomType, setRoomType] = useState<string>("all")
  const [roomStatus, setRoomStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [upcomingCheckins, setUpcomingCheckins] = useState<any[]>([])
  const [upcomingCheckouts, setUpcomingCheckouts] = useState<any[]>([])
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true)

  const { data: properties } = useProperties()
  const { data: roomTypes } = useRoomTypes()
  const { data: roomsData, isLoading: roomsLoading } = useRooms()
  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings } = useBookings()
  const { isSubscribed, lastUpdate } = useRealTimeBookings()

  const calendarDates = generateDates(viewStartDate, displayDays)

  // Process rooms and bookings data
  useEffect(() => {
    if (roomsData && bookingsData) {
      setIsLoading(true)
      try {
        console.log("Processing rooms and bookings data")
        console.log("Total rooms:", roomsData.length)
        console.log("Total bookings:", bookingsData.length)

        // Map rooms and attach bookings
        const mappedRooms = roomsData.map((room) => {
          // Find bookings for this room with more flexible matching
          const roomBookings = bookingsData.filter((booking) => {
            // Try multiple matching strategies

            // 1. Direct match (most strict)
            const exactMatch = String(booking.room_number) === String(room.number)

            // 2. Contains match (more lenient)
            const containsMatch =
              String(booking.room_number).includes(String(room.number)) ||
              String(room.number).includes(String(booking.room_number))

            // 3. Property match - try multiple property field combinations
            const propertyMatch =
              String(booking.property) === String(room.property_id) ||
              String(booking.property) === String(room.property) ||
              (room.property_name && String(booking.property) === String(room.property_name))

            // Use the most appropriate matching strategy
            // For now, let's use a more lenient approach to find the issue
            return (exactMatch || containsMatch) && propertyMatch
          })

          // Log if we found bookings for debugging
          if (roomBookings.length > 0) {
            console.log(`Found ${roomBookings.length} bookings for room ${room.number} (${room.property_name})`)
            roomBookings.forEach((b) => {
              console.log(
                `  - Booking ${b.id.substring(0, 8)}: ${b.guest_name}, ${b.check_in} to ${b.check_out}, status: ${b.status}`,
              )
            })
          }

          return {
            id: room.id,
            number: room.number,
            property: room.property_name || "Unknown Property",
            property_id: room.property_id,
            type: room.type || "Unknown Type",
            type_id: room.type_id || "Unknown Type",
            status: room.status as "available" | "occupied" | "maintenance" | "cleaning",
            bookings: roomBookings.map((booking) => ({
              id: booking.id,
              guest_name: booking.guest_name,
              check_in: booking.check_in,
              check_out: booking.check_out,
              status: booking.status as "confirmed" | "checked-in" | "checked-out" | "cancelled" | "pending",
              booking_number: booking.booking_number || booking.id.substring(0, 8),
            })),
          }
        })

        // Log summary
        const roomsWithBookings = mappedRooms.filter((r) => r.bookings.length > 0)
        console.log(`${roomsWithBookings.length} out of ${mappedRooms.length} rooms have bookings`)

        setRooms(mappedRooms)
      } catch (error) {
        console.error("Error processing data:", error)
        toast({
          title: "Error",
          description: "Failed to process availability data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }, [roomsData, bookingsData, toast])

  // Add this effect to refetch data when real-time updates occur
  useEffect(() => {
    if (lastUpdate) {
      // Refetch bookings data when a real-time update occurs
      refetchBookings()
    }
  }, [lastUpdate, refetchBookings])

  // Fetch upcoming check-ins and check-outs directly from the database
  useEffect(() => {
    const fetchUpcomingChanges = async () => {
      setIsLoadingUpcoming(true)
      const supabase = createClient()
      const today = new Date()
      const nextWeek = addDays(today, 7)

      try {
        // Fetch upcoming check-ins
        const { data: checkins, error: checkinsError } = await supabase
          .from("bookings")
          .select("id, guest_name, room_number, property, check_in, check_out")
          .eq("status", "confirmed")
          .gte("check_in", today.toISOString())
          .lte("check_in", nextWeek.toISOString())
          .order("check_in", { ascending: true })

        if (checkinsError) {
          console.error("Error fetching upcoming check-ins:", checkinsError)
          toast({
            title: "Error",
            description: "Failed to fetch upcoming check-ins",
            variant: "destructive",
          })
        } else {
          setUpcomingCheckins(checkins || [])
        }

        // Fetch upcoming check-outs
        const { data: checkouts, error: checkoutsError } = await supabase
          .from("bookings")
          .select("id, guest_name, room_number, property, check_in, check_out")
          .eq("status", "checked-in")
          .gte("check_out", today.toISOString())
          .lte("check_out", nextWeek.toISOString())
          .order("check_out", { ascending: true })

        if (checkoutsError) {
          console.error("Error fetching upcoming check-outs:", checkoutsError)
          toast({
            title: "Error",
            description: "Failed to fetch upcoming check-outs",
            variant: "destructive",
          })
        } else {
          setUpcomingCheckouts(checkouts || [])
        }
      } catch (error) {
        console.error("Error in fetchUpcomingChanges:", error)
      } finally {
        setIsLoadingUpcoming(false)
      }
    }

    fetchUpcomingChanges()

    // Set up a refresh interval
    const intervalId = setInterval(
      () => {
        fetchUpcomingChanges()
      },
      5 * 60 * 1000,
    ) // Refresh every 5 minutes

    return () => clearInterval(intervalId)
  }, [toast])

  // Apply filters when any filter changes
  useEffect(() => {
    if (!rooms) return

    let result = [...rooms]

    // Property filter
    if (property && property !== "all") {
      result = result.filter((room) => room.property_id === property)
    }

    // Room type filter
    if (roomType && roomType !== "all") {
      result = result.filter((room) => room.type_id === roomType)
    }

    // Room status filter
    if (roomStatus && roomStatus !== "all") {
      result = result.filter((room) => room.status === roomStatus)
    }

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (room) =>
          room.number.toLowerCase().includes(query) ||
          room.property.toLowerCase().includes(query) ||
          room.bookings.some((booking) => booking.guest_name.toLowerCase().includes(query)),
      )
    }

    setFilteredRooms(result)
  }, [property, roomType, roomStatus, searchQuery, rooms])

  const moveCalendar = (direction: "prev" | "next") => {
    const newDate = new Date(viewStartDate)
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - displayDays)
    } else {
      newDate.setDate(newDate.getDate() + displayDays)
    }
    setViewStartDate(newDate)
  }

  const jumpToDate = (date: Date) => {
    setViewStartDate(date)
    setSelectedDate(date)
    toast({
      title: "Calendar updated",
      description: `Viewing availability from ${format(date, "MMMM d, yyyy")}`,
    })
  }

  const handleViewChange = (days: number) => {
    setDisplayDays(days)
    toast({
      description: `Now displaying ${days} days in the calendar view`,
    })
  }

  const formatDateHeader = (date: Date) => {
    const day = date.getDate()
    const isCurrentDay = isToday(date)
    const dayName = format(date, "EEE")
    const month = format(date, "MMM")

    return (
      <div
        className={cn(
          "text-center p-1",
          isCurrentDay ? "bg-primary/10 rounded-md" : "",
          isWeekend(date) ? "bg-red-50" : "",
        )}
      >
        <div className="text-xs text-muted-foreground">{dayName}</div>
        <div className={cn("text-sm font-semibold", isCurrentDay ? "text-primary" : "")}>{day}</div>
        {day === 1 || isSameDay(date, viewStartDate) ? (
          <div className="text-xs text-muted-foreground">{month}</div>
        ) : null}
      </div>
    )
  }

  const handleCellClick = (roomId: string, date: Date) => {
    const room = filteredRooms.find((r) => r.id === roomId)

    if (room) {
      // Format the date for the URL
      const formattedDate = format(date, "yyyy-MM-dd")

      // Navigate to the new booking page with pre-filled data
      window.location.href = `/bookings/new?property=${room.property_id}&room=${room.number}&date=${formattedDate}`
    }
  }

  const handleBookingClick = (bookingId: string) => {
    // Navigate to booking details
    window.location.href = `/bookings/${bookingId}`
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Availability Calendar</h1>
          <p className="text-muted-foreground mt-1">View and manage room availability</p>
        </div>
        <Button asChild className="flex items-center gap-2">
          <Link href="/bookings/new">
            <PlusCircle className="h-4 w-4" />
            Add New Booking
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Room Availability</CardTitle>
            {isSubscribed && (
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Real-time updates active
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => moveCalendar("prev")} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(viewStartDate, "MMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && jumpToDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" onClick={() => moveCalendar("next")} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Select
                value={displayDays.toString()}
                onValueChange={(value) => handleViewChange(Number.parseInt(value))}
              >
                <SelectTrigger className="w-[130px] h-8">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewStartDate(new Date())}
                className="h-8 w-8"
                title="Jump to today"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            View and manage room availability. Click on empty cells to create new bookings.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Input
                placeholder="Search rooms or guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <Select value={property} onValueChange={setProperty}>
              <SelectTrigger>
                <SelectValue placeholder="Property Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties?.map((prop) => (
                  <SelectItem key={prop.id} value={prop.id}>
                    {prop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger>
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {roomTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roomStatus} onValueChange={setRoomStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Room Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading || roomsLoading || bookingsLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading availability data...</span>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <div
                  style={{
                    minWidth: `${Math.max(displayDays * 80, 1000)}px`,
                    width: "100%",
                  }}
                >
                  <div className="grid grid-cols-[200px_1fr] border-b border-border">
                    <div className="p-3 font-medium text-sm bg-muted border-r border-border sticky left-0 z-10">
                      Room
                    </div>
                    <div className="grid bg-muted" style={{ gridTemplateColumns: `repeat(${displayDays}, 1fr)` }}>
                      {calendarDates.map((date, i) => (
                        <div key={i} className="p-2 text-center border-r border-border last:border-r-0">
                          {formatDateHeader(date)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {filteredRooms.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No rooms match your filter criteria</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setProperty("all")
                          setRoomType("all")
                          setRoomStatus("all")
                          setSearchQuery("")
                        }}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  ) : (
                    filteredRooms.map((room) => (
                      <div key={room.id} className="grid grid-cols-[200px_1fr] border-b border-border last:border-b-0">
                        <div className="p-4 border-r border-border flex flex-col sticky left-0 bg-white z-10">
                          <Link href={`/rooms/${room.id}`} className="font-medium hover:text-primary">
                            Room {room.number}
                          </Link>
                          <span className="text-sm text-muted-foreground flex items-center justify-between">
                            {room.property}
                            <span
                              className={cn(
                                "inline-flex items-center ml-2 rounded-full px-2 py-0.5 text-xs",
                                room.status === "available" && "bg-green-100 text-green-800",
                                room.status === "occupied" && "bg-blue-100 text-blue-800",
                                room.status === "maintenance" && "bg-yellow-100 text-yellow-800",
                                room.status === "cleaning" && "bg-purple-100 text-purple-800",
                              )}
                            >
                              {room.status}
                            </span>
                          </span>
                          {/* Show booking count for debugging */}
                          {process.env.NODE_ENV !== "production" && (
                            <span className="text-xs text-blue-600 mt-1">
                              {room.bookings.length > 0 ? `${room.bookings.length} bookings` : "No bookings"}
                            </span>
                          )}
                        </div>
                        <div className="relative h-[80px]">
                          {/* Grid cells for days */}
                          <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${displayDays}, 1fr)` }}>
                            {Array.from({ length: displayDays }).map((_, i) => {
                              const cellDate = addDays(viewStartDate, i)
                              return (
                                <div
                                  key={i}
                                  className={cn(
                                    "border-r border-border last:border-r-0 hover:bg-muted/50 cursor-pointer",
                                    isWeekend(cellDate) ? "bg-red-50/50" : "",
                                    isToday(cellDate) ? "bg-primary/5" : "",
                                  )}
                                  onClick={() => handleCellClick(room.id, cellDate)}
                                ></div>
                              )
                            })}
                          </div>

                          {/* Bookings */}
                          {room.bookings.map((booking) => {
                            const style = calculateBookingStyle(booking, viewStartDate, displayDays)
                            if (!style) return null

                            return (
                              <div
                                key={booking.id}
                                className={cn(
                                  "absolute top-[16px] h-[48px] rounded-md cursor-pointer transition-shadow hover:shadow-md flex items-center px-2",
                                  booking.status === "confirmed" && "bg-blue-100 border border-blue-300",
                                  booking.status === "checked-in" && "bg-green-100 border border-green-300",
                                  booking.status === "checked-out" && "bg-gray-100 border border-gray-300",
                                  booking.status === "cancelled" && "bg-red-100 border border-red-300",
                                  booking.status === "pending" && "bg-yellow-100 border border-yellow-300",
                                )}
                                style={{ left: style.left, width: style.width }}
                                onClick={() => handleBookingClick(booking.id)}
                              >
                                <div className="truncate text-xs font-medium">{booking.guest_name}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm font-medium">Legend:</div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Checked In</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-400"></div>
              <span className="text-sm">Checked Out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-sm">Cancelled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Pending</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Changes</CardTitle>
          <CardDescription>Check-ins and check-outs in the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-blue-500" />
                Upcoming Check-ins
              </h3>
              <div className="space-y-2">
                {isLoadingUpcoming ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {upcomingCheckins.length > 0 ? (
                      upcomingCheckins.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{booking.guest_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Room {booking.room_number}, {booking.property}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{format(new Date(booking.check_in), "MMM d, yyyy")}</p>
                            <Button size="sm" variant="outline" asChild className="mt-1">
                              <Link href={`/bookings/${booking.id}`}>Details</Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No upcoming check-ins</p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-green-500" />
                Upcoming Check-outs
              </h3>
              <div className="space-y-2">
                {isLoadingUpcoming ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {upcomingCheckouts.length > 0 ? (
                      upcomingCheckouts.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{booking.guest_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Room {booking.room_number}, {booking.property}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{format(new Date(booking.check_out), "MMM d, yyyy")}</p>
                            <Button size="sm" variant="outline" asChild className="mt-1">
                              <Link href={`/bookings/${booking.id}`}>Details</Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No upcoming check-outs</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
