"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"

// Add this near the top of the file, after the imports
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type Property = {
  id: string
  name: string
  address: string
  city?: string
  country?: string
  image?: string
  owner_id?: string
  created_at: string
  updated_at: string
}

// First, add a new type for property input at the top of the file, after the Property type
export type PropertyInput = {
  id?: string
  name: string
  address: string
  city?: string
  country?: string
  image?: string
  owner_id?: string
}

// Export the saveProperty function directly from the module
export async function saveProperty(propertyData: PropertyInput, isUpdate = false): Promise<Property> {
  const supabase = createClient()

  try {
    if (isUpdate && propertyData.id) {
      // Update existing property
      const { data, error } = await supabase
        .from("properties")
        .update({
          name: propertyData.name,
          address: propertyData.address,
          city: propertyData.city,
          country: propertyData.country,
          image: propertyData.image,
          owner_id: propertyData.owner_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", propertyData.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Insert new property
      const { data, error } = await supabase
        .from("properties")
        .insert({
          name: propertyData.name,
          address: propertyData.address,
          city: propertyData.city,
          country: propertyData.country,
          image: propertyData.image,
          owner_id: propertyData.owner_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error("Error saving property:", error)
    throw error
  }
}

export function useProperties() {
  const [data, setData] = useState<Property[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const refetch = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: properties, error } = await supabase.from("properties").select("*").order("name")

      if (error) {
        throw error
      }

      setData(properties || [])
    } catch (err) {
      console.error("Error fetching properties:", err)
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
