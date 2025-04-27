"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowRight, BedDouble, Building, Edit, Grid, List, Loader, MoreHorizontal, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { syncRoomStatus } from "@/lib/room-utils"

// Define room type
type Room = {
  id: string
  number: string
  name?: string
  property_id: string
  property_name: string
  type: string
  status: "available" | "occupied" | "maintenance" | "cleaning"
  base_rate: number
  max_occupancy: number
  owner_id?: string
  image?: string
  description?: string
  amenities?: string[]
  created_at: string
  updated_at: string
}

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

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [view, setView] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()
  const supabase = createClient()

  // Fetch rooms from database
  useEffect(() => {
    async function fetchRooms() {
      setIsLoading(true)
      setError(null)

      try {
        console.log("Fetching rooms from database...")
        const { data, error } = await supabase.from("rooms").select("*").order("property_name").order("number")

        if (error) throw error

        console.log("Rooms fetched:", data)

        if (data) {
          // Format the data
          const formattedRooms = data.map((room) => ({
            ...room,
            base_rate: typeof room.base_rate === "string" ? Number.parseFloat(room.base_rate) : room.base_rate,
            max_occupancy:
              typeof room.max_occupancy === "string" ? Number.parseInt(room.max_occupancy) : room.max_occupancy,
            amenities: Array.isArray(room.amenities) ? room.amenities : [],
          }))

          setRooms(formattedRooms)
          setFilteredRooms(formattedRooms)
        }
      } catch (err) {
        console.error("Error fetching rooms:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch rooms"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchRooms()
  }, [supabase])

  // Filter rooms when search query or status filter changes
  useEffect(() => {
    if (!rooms) return

    const filtered = rooms.filter((room) => {
      // Apply search filter
      const matchesSearch =
        !searchQuery ||
        (room.number && room.number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (room.name && room.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (room.property_name && room.property_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (room.type && room.type.toLowerCase().includes(searchQuery.toLowerCase()))

      // Apply status filter
      const matchesStatus = statusFilter === "all" || room.status === statusFilter

      return matchesSearch && matchesStatus
    })

    console.log("Filtered rooms:", filtered)
    setFilteredRooms(filtered)
  }, [rooms, searchQuery, statusFilter])

  // Add this after the useEffect that filters rooms
  useEffect(() => {
    async function syncRoomStatuses() {
      if (!rooms) return

      // Create a copy of the rooms array
      const updatedRooms = [...rooms]
      let hasChanges = false

      // Check and update status for each room
      for (let i = 0; i < updatedRooms.length; i++) {
        const room = updatedRooms[i]
        // Pass both room id and room number
        const newStatus = await syncRoomStatus(room.id, room.number, room.status)

        if (newStatus !== room.status) {
          updatedRooms[i] = { ...room, status: newStatus }
          hasChanges = true
        }
      }

      // Only update state if there were changes
      if (hasChanges) {
        setRooms(updatedRooms)
      }
    }

    syncRoomStatuses()
  }, [rooms])

  // Handle status change
  const handleStatusChange = async (roomId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("rooms")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", roomId)

      if (error) throw error

      // Update local state
      setRooms((prevRooms) => prevRooms.map((room) => (room.id === roomId ? { ...room, status } : room)))

      toast({
        title: "Status Updated",
        description: `Room status changed to ${status}`,
      })
    } catch (err) {
      console.error("Error updating room status:", err)
      toast({
        title: "Error",
        description: "Failed to update room status",
        variant: "destructive",
      })
    }
  }

  // Handle room deletion
  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      return
    }

    try {
      // Check for bookings first
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id")
        .eq("room_id", roomId)
        .limit(1)

      if (bookingsError) throw bookingsError

      if (bookings && bookings.length > 0) {
        throw new Error("Cannot delete room with existing bookings")
      }

      // Delete the room
      const { error } = await supabase.from("rooms").delete().eq("id", roomId)

      if (error) throw error

      // Update local state
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId))

      toast({
        title: "Room Deleted",
        description: "The room has been deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting room:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete room",
        variant: "destructive",
      })
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
        <p className="text-red-500">Error: {error.message}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rooms</h1>
          <p className="text-muted-foreground mt-1">Manage all properties and rooms</p>
        </div>
        <Button className="mt-4 md:mt-0" asChild>
          <Link href="/rooms/add">
            <Plus className="mr-2 h-4 w-4" />
            Add New Room
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
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
        <div className="flex items-center space-x-2">
          <Button variant={view === "list" ? "default" : "outline"} size="icon" onClick={() => setView("list")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={view === "grid" ? "default" : "outline"} size="icon" onClick={() => setView("grid")}>
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">All Rooms ({rooms.length})</h2>

        {filteredRooms.length === 0 ? (
          <div className="bg-muted/20 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No rooms found matching your filters</p>
          </div>
        ) : view === "list" ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <div className="font-medium">{room.number}</div>
                      <div className="text-sm text-muted-foreground">{room.name}</div>
                    </TableCell>
                    <TableCell>{room.property_name}</TableCell>
                    <TableCell>{room.type}</TableCell>
                    <TableCell>{room.max_occupancy} persons</TableCell>
                    <TableCell>{getStatusBadge(room.status)}</TableCell>
                    <TableCell>${room.base_rate}/night</TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          </div>
        )}
      </div>
    </div>
  )
}
