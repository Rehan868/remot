"use client"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface RecentBookingsProps {
  data?: any[]
  isLoading?: boolean
  error?: Error | null
}

export function RecentBookings({ data = [], isLoading = false, error = null }: RecentBookingsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "checked-in":
        return "bg-green-100 text-green-800"
      case "checked-out":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>Latest booking activity across all properties</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-red-500 mb-4">Error loading bookings: {error.message}</p>
            <div className="w-full mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/bookings">View All Bookings</Link>
              </Button>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">No recent bookings found</p>
            <div className="w-full mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/bookings">View All Bookings</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{booking.guest_name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(booking.status)}`}>
                      {booking.status.replace("-", " ")}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Room {booking.room_number} • {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                  </div>
                </div>
                <div>
                  <Link href={`/bookings/${booking.id}`}>
                    <span className="text-sm text-blue-500 hover:underline">Details</span>
                  </Link>
                </div>
              </div>
            ))}
            <div className="pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/bookings">View All Bookings</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
