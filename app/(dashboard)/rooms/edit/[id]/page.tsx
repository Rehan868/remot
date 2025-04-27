"use client"

import { useParams } from "next/navigation"
import { AddEditRoomForm } from "@/components/rooms/add-edit-room-form"
import { useRoom } from "@/hooks/use-rooms"
import { Loader } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RoomEditPage() {
  const params = useParams()
  const id = params?.id as string
  const { data: room, isLoading, error } = useRoom(id || "")

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
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  // Convert room data to form data format with proper null checks
  const roomData = {
    id: room.id,
    number: room.number || "",
    property_id: room.property_id || "",
    room_type_id: room.room_type_id || "",
    floor: room.floor?.toString() || "1",
    capacity: room.max_occupancy?.toString() || "2",
    rate: room.base_rate?.toString() || "0",
    description: room.description || "",
    amenities: room.amenities ? room.amenities.join("\n") : "",
    status: room.status || "available",
    owner: room.owner_id || "",
    is_active: true,
  }

  return <AddEditRoomForm mode="edit" roomData={roomData} />
}
