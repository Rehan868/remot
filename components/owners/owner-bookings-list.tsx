"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, User, DollarSign, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Skeleton } from "@/components/ui/skeleton"

interface OwnerBookingsListProps {
  ownerId: string
}

interface Booking {
  id: string
  roomName: string
  guestName: string
  checkIn: string
  checkOut: string
  status: "confirmed" | "pending" | "cancelled" | "completed"
  amount: number
}

export function OwnerBookingsList({ ownerId }: OwnerBookingsListProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch bookings data from Supabase
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClientComponentClient()

        // First, get all rooms owned by this owner
        const { data: rooms, error: roomsError } = await supabase
          .from("rooms")
          .select("id, name, number")
          .eq("owner_id", ownerId)

        if (roomsError) throw roomsError

        if (!rooms || rooms.length === 0) {
          // If no rooms, return empty bookings
          setBookings([])
          setIsLoading(false)
          return
        }

        // Get room IDs (since bookings use room_id to reference rooms)
        const roomIds = rooms.map((room) => room.id).filter(Boolean)

        // Create a mapping of room IDs to room names
        const roomNamesById = rooms.reduce(
          (acc, room) => {
            acc[room.id] = room.name || `Room ${room.number || "Unknown"}`
            return acc
          },
          {} as Record<string, string>,
        )

        // Then, get all bookings for these rooms using room_number instead of room_id
        let bookingsQuery = supabase.from("bookings").select("*")

        // Create an array of room numbers from the rooms
        const roomNumbers = rooms.map((room) => room.number).filter(Boolean)

        // Create a mapping of room numbers to room names
        const roomNamesByNumber = rooms.reduce(
          (acc, room) => {
            acc[room.number || ""] = room.name || `Room ${room.number || "Unknown"}`
            return acc
          },
          {} as Record<string, string>,
        )

        // Only add the filter if we have room numbers
        if (roomNumbers.length > 0) {
          bookingsQuery = bookingsQuery.in("room_number", roomNumbers)
        } else {
          // If we don't have room numbers but have rooms, we might need a different approach
          // For now, just return empty bookings
          setBookings([])
          setIsLoading(false)
          return
        }

        const { data: bookingsData, error: bookingsError } = await bookingsQuery
          .order("check_in", { ascending: false })
          .limit(5) // Limit to recent bookings

        if (bookingsError) throw bookingsError

        // Transform the data to match our Booking type
        const transformedBookings = bookingsData.map((booking) => ({
          id: booking.id,
          roomName: roomNamesByNumber[booking.room_number] || `Room ${booking.room_number || "Unknown"}`,
          guestName: booking.guest_name || "Unknown Guest",
          checkIn: booking.check_in || new Date().toISOString(),
          checkOut: booking.check_out || new Date().toISOString(),
          status: (booking.status as "confirmed" | "pending" | "cancelled" | "completed") || "pending",
          amount: booking.amount || 0,
        }))

        setBookings(transformedBookings)
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch bookings"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [ownerId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
      return new Date(dateString).toLocaleDateString("en-US", options)
    } catch (e) {
      return "Invalid date"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Skeleton className="h-9 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="font-medium text-lg mb-2">Error Loading Bookings</h3>
            <p className="text-muted-foreground mb-6">
              {error.message || "Failed to load bookings. Please try again."}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Bookings</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/bookings?ownerId=${ownerId}`}>View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {bookings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.roomName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.guestName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(booking.checkIn)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(booking.checkOut)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{formatCurrency(booking.amount)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">No Bookings Found</h3>
            <p className="text-muted-foreground mb-6">This owner doesn't have any bookings yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
