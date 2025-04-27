"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Building, Calendar, Edit, Loader, Trash, User } from "lucide-react"
import { useRoom, deleteRoom } from "@/hooks/use-rooms"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function getStatusBadge(status: string) {
  switch (status) {
    case "available":
      return <Badge className="bg-green-100 text-green-800">Available</Badge>
    case "occupied":
      return <Badge className="bg-blue-100 text-blue-800">Occupied</Badge>
    case "maintenance":
      return <Badge className="bg-red-100 text-red-800">Maintenance</Badge>
    case "cleaning":
      return <Badge className="bg-yellow-100 text-yellow-800">Cleaning</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
  }
}

interface RoomDetailsProps {
  roomId: string
}

export function RoomDetails({ roomId }: RoomDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: room, isLoading, error } = useRoom(roomId)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!room) return

    try {
      setIsDeleting(true)
      await deleteRoom(room.id)

      toast({
        title: "Room deleted",
        description: `Room ${room.number} has been removed from the system.`,
      })

      router.push("/rooms")
    } catch (error) {
      console.error("Error deleting room:", error)
      toast({
        title: "Error",
        description: "Failed to delete room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading room details...</span>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-500">Failed to load room details</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/rooms")}>
          Back to Rooms
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/rooms">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{room.name || `Room ${room.number}`}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">#{room.number}</p>
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">{room.property}</p>
              <span className="text-muted-foreground">•</span>
              {getStatusBadge(room.status)}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={`/rooms/edit/${room.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Room
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Room
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this room?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the room and remove the data from our
                  servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Room Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">ROOM TYPE</p>
                        <p className="text-base">{room.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">FLOOR</p>
                        <p className="text-base">{room.floor}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">CAPACITY</p>
                        <p className="text-base">{room.capacity} persons</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">RATE</p>
                        <p className="text-base">${room.rate}/night</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">STATUS</p>
                        <p className="text-base">{getStatusBadge(room.status)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">LAST UPDATED</p>
                        <p className="text-base">
                          {room.updated_at ? new Date(room.updated_at).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">Description</h2>
                  <p className="text-muted-foreground">
                    {room.description || "No description available for this room."}
                  </p>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  {room.amenities && room.amenities.length > 0 ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {room.amenities.map((amenity, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span>{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No amenities listed for this room.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Current Bookings</h2>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>No active bookings for this room</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/bookings/new">Create New Booking</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Property Information</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-muted rounded-md">
                  <Building className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{room.property}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/settings">View Property Details</Link>
              </Button>
            </CardContent>
          </Card>

          {room.owner && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Owner Information</h2>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-muted rounded-md">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{room.owner}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/owners">View Owner Details</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Room Management</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/rooms/edit/${room.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Room Details
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/bookings/new">
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Booking
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
