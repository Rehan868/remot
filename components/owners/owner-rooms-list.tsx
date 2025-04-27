"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Building, Bath, Users, Pencil } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Skeleton } from "@/components/ui/skeleton"

interface OwnerRoomsListProps {
  ownerId: string
  isEditing?: boolean
}

interface Room {
  id: string
  name: string
  type: string
  capacity: number
  bathrooms: number
  status: "available" | "occupied" | "maintenance"
  price: number
  image?: string
  property?: string // Add this line
}

export function OwnerRoomsList({ ownerId, isEditing = false }: OwnerRoomsListProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch rooms data from Supabase
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClientComponentClient()

        // Query rooms where owner_id matches the selected owner
        // Use a more comprehensive query to ensure we get all rooms
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .eq("owner_id", ownerId)
          .order("created_at", { ascending: false })

        if (error) throw error

        // Log the raw data for debugging
        console.log("Rooms data for owner:", data)

        // Transform the data to match our Room type
        const transformedRooms = data.map((room) => ({
          id: room.id,
          name: room.name || "Unnamed Room",
          type: room.type || "Standard",
          capacity: room.capacity || 2,
          bathrooms: room.bathrooms || 1,
          status: (room.status as "available" | "occupied" | "maintenance") || "available",
          price: room.price || 0,
          image: room.image || "/cozy-hotel-corner.png",
          property: room.property || "Main Property", // Add this line
        }))

        setRooms(transformedRooms)
      } catch (err) {
        console.error("Error fetching rooms:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch rooms"))
      } finally {
        setIsLoading(false)
      }
    }

    if (ownerId) {
      fetchRooms()
    } else {
      setRooms([])
      setIsLoading(false)
    }
  }, [ownerId])

  // Filter rooms based on active tab
  const filteredRooms = activeTab === "all" ? rooms : rooms.filter((room) => room.status === activeTab)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>
      case "occupied":
        return <Badge className="bg-blue-100 text-blue-800">Occupied</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Properties & Rooms</CardTitle>
          {isEditing && <Skeleton className="h-9 w-32" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full max-w-md mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Properties & Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Building className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="font-medium text-lg mb-2">Error Loading Rooms</h3>
            <p className="text-muted-foreground mb-6">{error.message || "Failed to load rooms. Please try again."}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Properties & Rooms</CardTitle>
        {isEditing && (
          <Button size="sm" asChild>
            <Link href={`/rooms/add?ownerId=${ownerId}`}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Room
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-md mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="occupied">Occupied</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <Card key={room.id} className="overflow-hidden">
                    <div className="h-40 bg-muted relative">
                      <img
                        src={room.image || "/placeholder.svg"}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                      {isEditing && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                          asChild
                        >
                          <Link href={`/rooms/edit/${room.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{room.name}</h3>
                        {getStatusBadge(room.status)}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{room.property}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{room.type}</p>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">${room.price}/night</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{room.capacity}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            <span>{room.bathrooms}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No Rooms Found</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === "all"
                    ? "This owner doesn't have any rooms yet."
                    : `No rooms with status "${activeTab}" found.`}
                </p>
                {isEditing && (
                  <Button asChild>
                    <Link href={`/rooms/add?ownerId=${ownerId}`}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Room
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
