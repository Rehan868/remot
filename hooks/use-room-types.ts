"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"

export type RoomType = {
  id: string
  name: string
  baseRate: number
  maxOccupancy: number
  description?: string
  created_at: string
  updated_at: string
}

export type RoomTypeInput = {
  id?: string
  name: string
  baseRate: number
  maxOccupancy: number
  description?: string
}

// Export the saveRoomType function directly from the module
export async function saveRoomType(roomTypeData: RoomTypeInput, isUpdate = false): Promise<RoomType> {
  const supabase = createClient()

  try {
    if (isUpdate && roomTypeData.id) {
      // Update existing room type
      const { data, error } = await supabase
        .from("room_types")
        .update({
          name: roomTypeData.name,
          base_rate: roomTypeData.baseRate,
          max_occupancy: roomTypeData.maxOccupancy,
          description: roomTypeData.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomTypeData.id)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        baseRate: data.base_rate || 0,
        maxOccupancy: data.max_occupancy || 0,
        description: data.description,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    } else {
      // Insert new room type
      const { data, error } = await supabase
        .from("room_types")
        .insert({
          name: roomTypeData.name,
          base_rate: roomTypeData.baseRate,
          max_occupancy: roomTypeData.maxOccupancy,
          description: roomTypeData.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        baseRate: data.base_rate || 0,
        maxOccupancy: data.max_occupancy || 0,
        description: data.description,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    }
  } catch (error) {
    console.error("Error saving room type:", error)
    throw error
  }
}

export function useRoomTypes() {
  const [data, setData] = useState<RoomType[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const refetch = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: roomTypes, error } = await supabase.from("room_types").select("*").order("name")

      if (error) {
        throw error
      }

      // Transform the data to match our RoomType interface
      const transformedData =
        roomTypes?.map((rt) => ({
          id: rt.id,
          name: rt.name,
          baseRate: rt.base_rate || 0,
          maxOccupancy: rt.max_occupancy || 0,
          description: rt.description,
          created_at: rt.created_at,
          updated_at: rt.updated_at,
        })) || []

      setData(transformedData)
    } catch (err) {
      console.error("Error fetching room types:", err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refetch()
  }, [])

  return { data, isLoading, error, refetch }
}
