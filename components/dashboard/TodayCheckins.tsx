"use client"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarClock, Loader2 } from "lucide-react"
import type { CheckInOut } from "@/hooks/use-dashboard-data"

interface TodayCheckinsProps {
  data?: CheckInOut[]
  isLoading?: boolean
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "confirmed":
      return "default"
    case "pending":
      return "secondary"
    case "cancelled":
      return "destructive"
    default:
      return "default"
  }
}

export function TodayCheckins({ data = [], isLoading = false }: TodayCheckinsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Check-ins</h3>
        <Badge variant="outline">{data.length}</Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CalendarClock className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No check-ins scheduled for today</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((booking) => (
            <div key={booking.id} className="flex items-start space-x-4">
              <Avatar className="h-10 w-10 mt-1">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {booking.guest_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{booking.guest_name}</h4>
                  <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Room {booking.room_number} · {booking.property}
                </div>
                <div className="text-sm text-muted-foreground">
                  {booking.adults} Adults{booking.children > 0 ? `, ${booking.children} Children` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
