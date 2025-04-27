"use client"

import { useMemo, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, BedDouble, Building, Edit, MoreHorizontal, Loader } from "lucide-react"
import { ViewToggle } from "@/components/ui/view-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useRooms, deleteRoom } from "@/hooks/use-rooms"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase"
import { syncRoomStatus } from "@/lib/room-utils"

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

interface RoomListProps {
  view: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
  searchQuery?: string
  filterValue?: string
}

export function RoomList({ view, onViewChange, searchQuery = "", filterValue = "all" }: RoomListProps) {
  const { data: rooms, isLoading, error, refetch, setData } = useRooms()
  const { toast } = useToast()

  // Debug: Log rooms data when it changes
  useEffect(() => {
    console.log("Rooms data in component:", rooms)
  }, [rooms])

  // Add this after the existing useEffect that logs rooms data
  useEffect(() => {
    async function syncRoomStatuses() {
      if (!rooms) return

      // Create a copy of the rooms array
      const updatedRooms = [...rooms]
      let hasChanges = false

      // Check and update status for each room
      for (let i = 0; i < updatedRooms.length; i++) {
        const room = updatedRooms[i]
        const newStatus = await syncRoomStatus(room.id, room.status)

        if (newStatus !== room.status) {
          updatedRooms[i] = { ...room, status: newStatus }
          hasChanges = true
        }
      }

      // Only update state if there were changes
      if (hasChanges) {
        setData(updatedRooms)
      }
    }

    syncRoomStatuses()
  }, [rooms, setData])

  // Apply filters to rooms
  const filteredRooms = useMemo(() => {
    console.log("Filtering rooms:", rooms)
    if (!rooms) return []

    return rooms.filter((room) => {
      // Apply search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery ||
        (room.number && room.number.toLowerCase().includes(searchLower)) ||
        (room.name && room.name.toLowerCase().includes(searchLower)) ||
        (room.property_name && room.property_name.toLowerCase().includes(searchLower)) ||
        (room.type && room.type.toLowerCase().includes(searchLower))

      // Apply status filter
      const matchesStatus = filterValue === "all" || room.status === filterValue

      const result = matchesSearch && matchesStatus
      return result
    })
  }, [rooms, searchQuery, filterValue])

  // Debug: Log filtered rooms
  useEffect(() => {
    console.log("Filtered rooms:", filteredRooms)
  }, [filteredRooms])

  const handleStatusChange = async (roomId: string, status: string) => {
    try {
      // Update the room status in the database
      const supabase = createClient()
      const { error } = await supabase
        .from("rooms")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", roomId)

      if (error) throw error

      toast({
        title: "Status Updated",
        description: `Room status changed to ${status}`,
      })
      refetch()
    } catch (err) {
      console.error("Error updating room status:", err)
      toast({
        title: "Error",
        description: "Failed to update room status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      try {
        const result = await deleteRoom(roomId)

        if (result.success) {
          toast({
            title: "Room Deleted",
            description: "The room has been deleted successfully",
          })
          refetch()
        } else {
          throw result.error
        }
      } catch (err) {
        console.error("Error deleting room:", err)
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to delete room",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading rooms...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500">Failed to load rooms data: {error.message}</p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  // Debug: Add a check for empty rooms
  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p>No rooms found in the database.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/rooms/add">Add Room</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">All Rooms ({rooms?.length || 0})</h2>
        <div className="flex gap-4">
          <ViewToggle view={view} onViewChange={onViewChange} />
        </div>
      </div>

      {view === "list" ? (
        <div className="rounded-lg overflow-hidden border border-border">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left font-medium px-6 py-3">Room</th>
                <th className="text-left font-medium px-6 py-3">Property</th>
                <th className="text-left font-medium px-6 py-3">Type</th>
                <th className="text-left font-medium px-6 py-3">Capacity</th>
                <th className="text-left font-medium px-6 py-3">Status</th>
                <th className="text-left font-medium px-6 py-3">Rate</th>
                <th className="text-left font-medium px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium">{room.number}</div>
                    <div className="text-sm text-muted-foreground">{room.name}</div>
                  </td>
                  <td className="px-6 py-4">{room.property_name}</td>
                  <td className="px-6 py-4">{room.type}</td>
                  <td className="px-6 py-4">{room.max_occupancy} persons</td>
                  <td className="px-6 py-4">{getStatusBadge(room.status)}</td>
                  <td className="px-6 py-4">${room.base_rate}/night</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/rooms/${room.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/rooms/${room.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/rooms/edit/${room.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/bookings?room=${room.number}`}>View Bookings</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusChange(room.id, "available")}>
                            Mark as Available
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(room.id, "occupied")}>
                            Mark as Occupied
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(room.id, "cleaning")}>
                            Mark as Cleaning
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(room.id, "maintenance")}>
                            Mark as Maintenance
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRoom(room.id)}>
                            Delete Room
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
              {(!filteredRooms || filteredRooms.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No rooms found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="h-48 bg-muted flex items-center justify-center">
                  {room.image ? (
                    <img
                      src={room.image || "/placeholder.svg"}
                      alt={room.name || `Room ${room.number}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <BedDouble className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{room.name || `Room ${room.number}`}</p>
                        <p className="text-sm text-muted-foreground">#{room.number}</p>
                      </div>
                      {getStatusBadge(room.status)}
                    </div>

                    <div className="border-t pt-4 mt-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-muted rounded-md">
                          <Building className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">PROPERTY</p>
                          <p className="text-sm">{room.property_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-muted rounded-md">
                          <BedDouble className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">TYPE</p>
                          <p className="text-sm">
                            {room.type} • {room.max_occupancy} persons
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-muted rounded-md">
                          <div className="font-semibold text-xs text-muted-foreground">$</div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">RATE</p>
                          <p className="text-sm">${room.base_rate}/night</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t pt-4">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/rooms/edit/${room.id}`}>
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/rooms/${room.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!filteredRooms || filteredRooms.length === 0) && (
            <div className="col-span-full text-center py-10 border rounded-md bg-muted/10">
              <p className="text-muted-foreground">No rooms found matching your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
