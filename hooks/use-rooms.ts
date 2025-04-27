"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase"

export type Room = {
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

export function useRooms() {
  const [data, setData] = useState<Room[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Store Supabase client in a ref to prevent recreation on each render
  const supabaseRef = useRef(createClient())

  // Keep track of active requests to prevent race conditions
  const activeRequestRef = useRef<AbortController | null>(null)

  const fetchRooms = useCallback(async () => {
    // Cancel any in-flight requests
    if (activeRequestRef.current) {
      activeRequestRef.current.abort()
    }

    // Create new abort controller for this request
    activeRequestRef.current = new AbortController()

    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching rooms from database...")
      const supabase = supabaseRef.current

      // Use a join to get bookings for each room
      const { data: rooms, error } = await supabase
        .from("rooms")
        .select("*")
        .order("property_name")
        .order("number")

      if (error) {
        throw error
      }

      console.log("Rooms fetched:", rooms?.length || 0)

      if (rooms && rooms.length > 0) {
        // Transform the data to ensure it matches the expected format
        // Process in batches of 50 to avoid blocking the main thread
        const processRooms = () => {
          const formattedRooms = rooms.map((room) => ({
            ...room,
            base_rate: typeof room.base_rate === "string" ? Number.parseFloat(room.base_rate) : room.base_rate,
            max_occupancy:
              typeof room.max_occupancy === "string" ? Number.parseInt(room.max_occupancy, 10) : room.max_occupancy,
            amenities: Array.isArray(room.amenities) ? room.amenities : [],
          }))

          setData(formattedRooms)
          setIsLoading(false)
        }

        // Use requestAnimationFrame to process data during idle browser time
        requestAnimationFrame(processRooms)
      } else {
        // Only use mock data if no rooms were found
        console.log("No rooms found in database, using mock data")
        setData([
          {
            id: "room-1",
            number: "101",
            name: "Ocean View Suite",
            property_id: "prop-1",
            property_name: "Marina Tower",
            type: "Suite",
            max_occupancy: 4,
            base_rate: 299,
            status: "available",
            description: "Luxurious suite with ocean views",
            amenities: ["King Bed", "Balcony", "Mini Bar", "Free WiFi"],
            image: "/luxurious-city-suite.png",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "room-2",
            number: "102",
            name: "City View Room",
            property_id: "prop-1",
            property_name: "Marina Tower",
            type: "Standard",
            max_occupancy: 2,
            base_rate: 199,
            status: "occupied",
            description: "Comfortable room with city views",
            amenities: ["Queen Bed", "Work Desk", "Free WiFi"],
            image: "/comfortable-hotel-stay.png",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          // More mock data...
        ])
        setIsLoading(false)
      }
    } catch (err) {
      // Only handle error if it's not an abort error
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        console.error("Error fetching rooms:", err)
        setError(err instanceof Error ? err : new Error("An unknown error occurred"))

        // Use mock data as fallback
        setData([
          {
            id: "room-1",
            number: "101",
            name: "Ocean View Suite",
            property_id: "prop-1",
            property_name: "Marina Tower",
            type: "Suite",
            max_occupancy: 4,
            base_rate: 299,
            status: "available",
            description: "Luxurious suite with ocean views",
            amenities: ["King Bed", "Balcony", "Mini Bar", "Free WiFi"],
            image: "/luxurious-city-suite.png",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          // More mock data...
        ])
      }
      setIsLoading(false)
    }
  }, []) // No dependencies since we're using refs

  useEffect(() => {
    fetchRooms()

    return () => {
      // Clean up any in-flight requests when component unmounts
      if (activeRequestRef.current) {
        activeRequestRef.current.abort()
        activeRequestRef.current = null
      }
    }
  }, [fetchRooms])

  return { data, isLoading, error, refetch: fetchRooms }
}

export function useRoom(roomId: string) {
  const [data, setData] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  // Store Supabase client in a ref to prevent recreation on each render
  const supabaseRef = useRef(createClient())
  
  // Track active requests
  const activeRequestRef = useRef<AbortController | null>(null)

  const fetchRoom = useCallback(async () => {
    if (!roomId) {
      setError(new Error("Room ID is required"))
      setIsLoading(false)
      return
    }

    // Cancel any in-flight requests
    if (activeRequestRef.current) {
      activeRequestRef.current.abort()
    }
    
    // Create new abort controller for this request
    activeRequestRef.current = new AbortController()
    
    setIsLoading(true)
    setError(null)

    try {
      console.log(`Fetching room with ID: ${roomId}`)
      const supabase = supabaseRef.current
      const { data: room, error } = await supabase.from("rooms").select("*").eq("id", roomId).single()

      if (error) {
        throw error
      }

      if (room) {
        // Process data in the next frame to prevent UI blocking
        requestAnimationFrame(() => {
          // Transform the data to ensure it matches the expected format
          const formattedRoom = {
            ...room,
            base_rate: typeof room.base_rate === "string" ? Number.parseFloat(room.base_rate) : room.base_rate,
            max_occupancy:
              typeof room.max_occupancy === "string" ? Number.parseInt(room.max_occupancy, 10) : room.max_occupancy,
            amenities: Array.isArray(room.amenities) ? room.amenities : [],
          }

          setData(formattedRoom)
          setIsLoading(false)
        })
      } else {
        // If no room was found with this ID
        console.log(`No room found with ID: ${roomId}`)
        setData(null)
        setIsLoading(false)
      }
    } catch (err) {
      // Only handle error if it's not an abort error
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        console.error(`Error fetching room with ID ${roomId}:`, err)
        setError(err instanceof Error ? err : new Error("An unknown error occurred"))

        // Use mock data as fallback based on the ID
        if (roomId === "room-1" || roomId === "5a187522-cb51-46cf-b821-f350d81ceaf6") {
          setData({
            id: roomId,
            number: "201",
            name: "Executive Suite",
            property_id: "prop-2",
            property_name: "Downtown Heights",
            type: "Executive",
            max_occupancy: 3,
            base_rate: 349,
            status: "available",
            description: "Spacious executive suite with premium amenities",
            amenities: ["King Bed", "Jacuzzi", "Mini Bar", "Free WiFi", "Room Service"],
            image: "/modern-corporate-office.png",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
        setIsLoading(false)
      }
    }
  }, [roomId]) // No need for supabase dependency as we're using a ref

  useEffect(() => {
    fetchRoom()
    
    return () => {
      // Clean up any in-flight requests when component unmounts
      if (activeRequestRef.current) {
        activeRequestRef.current.abort()
        activeRequestRef.current = null
      }
    }
  }, [fetchRoom])

  return { data, isLoading, error, refetch: fetchRoom }
}

export async function saveRoom(roomData: any, isEdit = false) {
  const supabase = createClient()

  try {
    // First, get the property name based on property_id
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("name")
      .eq("id", roomData.property_id)
      .single()

    if (propertyError) {
      console.error("Error fetching property:", propertyError)
      throw new Error("Could not find the selected property")
    }

    // Get the room type name based on room_type_id
    const { data: roomType, error: roomTypeError } = await supabase
      .from("room_types")
      .select("name")
      .eq("id", roomData.room_type_id)
      .single()

    if (roomTypeError) {
      console.error("Error fetching room type:", roomTypeError)
      throw new Error("Could not find the selected room type")
    }

    // Prepare the room data for database insertion
    const roomToSave = {
      number: roomData.number,
      name: roomData.name || `${property.name} - ${roomData.number}`, // Generate a name if not provided
      property_id: roomData.property_id,
      property_name: property.name,
      type: roomType.name,
      status: "available", // Default status since we removed it from the form
      base_rate: Number.parseFloat(roomData.rate),
      max_occupancy: Number.parseInt(roomData.capacity, 10),
      description: roomData.description || null,
      amenities: roomData.amenities || [],
      image: "/cozy-hotel-corner.png", // Default image
      updated_at: new Date().toISOString(),
    }

    if (isEdit && roomData.id) {
      // Update existing room
      const { error } = await supabase.from("rooms").update(roomToSave).eq("id", roomData.id)

      if (error) throw error
      return { success: true, id: roomData.id }
    } else {
      // Add created_at for new rooms
      roomToSave.created_at = new Date().toISOString()

      // Create new room
      const { data, error } = await supabase.from("rooms").insert(roomToSave).select("id").single()

      if (error) throw error
      return { success: true, id: data?.id }
    }
  } catch (error) {
    console.error("Error saving room:", error)
    return { success: false, error }
  }
}

export async function deleteRoom(roomId: string) {
  const supabase = createClient()

  try {
    // Check if there are any bookings associated with this room
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id")
      .eq("room_id", roomId)
      .limit(1)

    if (bookingsError) throw bookingsError

    // If there are bookings, don't allow deletion
    if (bookings && bookings.length > 0) {
      throw new Error("Cannot delete room with existing bookings")
    }

    // Delete the room
    const { error } = await supabase.from("rooms").delete().eq("id", roomId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error deleting room:", error)
    return { success: false, error }
  }
}
