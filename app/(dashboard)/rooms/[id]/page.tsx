"use client"

import { useParams } from "next/navigation"
import { RoomDetails } from "@/components/rooms/room-details"

export default function RoomViewPage() {
  const params = useParams()
  const id = params?.id as string

  return (
    <>
      {id && <RoomDetails roomId={id} />}
      {!id && <div>No room ID provided</div>}
    </>
  )
}
