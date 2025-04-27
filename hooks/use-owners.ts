"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { delay } from "@/lib/mock-data"

// Define the Owner type based on our database schema
export type Owner = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  notes?: string
  birthdate?: Date
  citizenship?: string
  accountingInfo?: {
    paymentMethod: string
    accountNumber: string
    bankName: string
    iban: string
    swift: string
  }
  taxInfo?: {
    taxId: string
    taxResidence: string
  }
  rooms?: string[]
}

// Hook for fetching all owners
export function useOwners() {
  const [data, setData] = useState<Owner[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchOwners = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch owners from Supabase
      const { data: owners, error } = await supabase
        .from("owners")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      // Transform the data to match our Owner type
      const transformedOwners = owners.map((owner) => ({
        id: owner.id,
        firstName: owner.name ? owner.name.split(" ")[0] : "",
        lastName: owner.name ? owner.name.split(" ").slice(1).join(" ") : "",
        email: owner.email || "",
        phone: owner.phone || "",
        address: owner.address || "",
        city: owner.city || "",
        state: owner.state || "",
        zipCode: owner.zipCode || "",
        country: owner.country || "",
        notes: owner.notes || "",
        birthdate: owner.birthdate ? new Date(owner.birthdate) : undefined,
        citizenship: owner.citizenship || "",
      }))

      setData(transformedOwners)
    } catch (err) {
      console.error("Error fetching owners:", err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchOwners()
  }, [fetchOwners])

  return { data, isLoading, error, refetch: fetchOwners }
}

// Hook for fetching a single owner
export function useOwner(id: string) {
  const [data, setData] = useState<Owner | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchOwner = useCallback(async () => {
    // Skip fetching if id is not a valid UUID (like "add" or "new")
    if (!id || id === "add" || id === "new" || id === "edit") {
      setIsLoading(false)
      return
    }

    // Check if id is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      setError(new Error(`Invalid UUID format: ${id}`))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch owner from Supabase
      const { data: owner, error: ownerError } = await supabase.from("owners").select("*").eq("id", id).single()

      if (ownerError) throw ownerError

      // Fetch accounting info
      const { data: accountingInfo, error: accountingError } = await supabase
        .from("owner_accounting_info")
        .select("*")
        .eq("owner_id", id)
        .single()

      if (accountingError && accountingError.code !== "PGRST116") {
        // PGRST116 is "Results contain 0 rows" - this is fine, just means no accounting info yet
        throw accountingError
      }

      // Fetch tax info
      const { data: taxInfo, error: taxError } = await supabase
        .from("owner_tax_info")
        .select("*")
        .eq("owner_id", id)
        .single()

      if (taxError && taxError.code !== "PGRST116") {
        throw taxError
      }

      // Fetch assigned rooms
      const { data: rooms, error: roomsError } = await supabase.from("rooms").select("id").eq("owner_id", id)

      if (roomsError) throw roomsError

      // Transform the data to match our Owner type
      const transformedOwner: Owner = {
        id: owner.id,
        firstName: owner.name ? owner.name.split(" ")[0] : "",
        lastName: owner.name ? owner.name.split(" ").slice(1).join(" ") : "",
        email: owner.email || "",
        phone: owner.phone || "",
        address: owner.address || "",
        city: owner.city || "",
        state: owner.state || "",
        zipCode: owner.zipCode || "",
        country: owner.country || "",
        notes: owner.notes || "",
        birthdate: owner.birthdate ? new Date(owner.birthdate) : undefined,
        citizenship: owner.citizenship || "",
        accountingInfo: accountingInfo
          ? {
              paymentMethod: accountingInfo.paymentmethod || "",
              accountNumber: accountingInfo.accountnumber || "",
              bankName: accountingInfo.bankname || "",
              iban: accountingInfo.iban || "",
              swift: accountingInfo.swift || "",
            }
          : undefined,
        taxInfo: taxInfo
          ? {
              taxId: taxInfo.taxid || "",
              taxResidence: taxInfo.taxresidence || "",
            }
          : undefined,
        rooms: rooms.map((room) => room.id),
      }

      setData(transformedOwner)
    } catch (err) {
      console.error("Error fetching owner:", err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [id, supabase])

  useEffect(() => {
    fetchOwner()
  }, [fetchOwner])

  return { data, isLoading, error, refetch: fetchOwner }
}

// Function to update an owner
export async function updateOwner(id: string, ownerData: Partial<Owner>) {
  try {
    const supabase = createClientComponentClient<Database>()

    // Simulate API delay for better UX
    await delay(500)

    // Extract accounting and tax info
    const { accountingInfo, taxInfo, rooms, firstName, lastName, ...ownerBasicData } = ownerData

    // Prepare owner data with name field
    const ownerUpdateData = {
      ...ownerBasicData,
      name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
    }

    // Update the owner in Supabase
    const { error: ownerError } = await supabase.from("owners").update(ownerUpdateData).eq("id", id)

    if (ownerError) throw ownerError

    // Update accounting info if provided
    if (accountingInfo) {
      const { error: accountingError } = await supabase.from("owner_accounting_info").upsert({
        owner_id: id,
        paymentmethod: accountingInfo.paymentMethod,
        accountnumber: accountingInfo.accountNumber,
        bankname: accountingInfo.bankName,
        iban: accountingInfo.iban,
        swift: accountingInfo.swift,
      })

      if (accountingError) throw accountingError
    }

    // Update tax info if provided
    if (taxInfo) {
      const { error: taxError } = await supabase.from("owner_tax_info").upsert({
        owner_id: id,
        taxid: taxInfo.taxId,
        taxresidence: taxInfo.taxResidence,
      })

      if (taxError) throw taxError
    }

    // Update room assignments if provided
    if (rooms && rooms.length > 0) {
      // First, clear existing assignments
      const { error: clearError } = await supabase.from("rooms").update({ owner_id: null }).eq("owner_id", id)

      if (clearError) throw clearError

      // Then, assign new rooms
      for (const roomId of rooms) {
        const { error: assignError } = await supabase.from("rooms").update({ owner_id: id }).eq("id", roomId)

        if (assignError) throw assignError
      }
    }

    return { success: true, data: { id, ...ownerData } }
  } catch (error) {
    console.error("Error updating owner:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update owner",
    }
  }
}

// Function to create a new owner
export async function createOwner(ownerData: Omit<Owner, "id"> & { password: string; confirmPassword: string }) {
  try {
    const supabase = createClientComponentClient<Database>()

    // Validate passwords match
    if (ownerData.password !== ownerData.confirmPassword) {
      throw new Error("Passwords do not match")
    }

    // Extract data for different tables
    const {
      accountingInfo,
      taxInfo,
      rooms,
      password,
      confirmPassword,
      birthdate,
      firstName,
      lastName,
      ...otherOwnerData
    } = ownerData

    // Create the owner in Supabase with proper handling of birthdate
    // Note: We're not storing the password since there's no password column
    const { data: newOwner, error: ownerError } = await supabase
      .from("owners")
      .insert({
        name: `${firstName} ${lastName}`,
        email: otherOwnerData.email,
        phone: otherOwnerData.phone,
        address: otherOwnerData.address,
        city: otherOwnerData.city,
        country: otherOwnerData.country,
        // Only include birthdate if it exists, and format it as an ISO string
        ...(birthdate ? { birthdate: birthdate.toISOString() } : {}),
        // Note: We're not including password since the column doesn't exist
      })
      .select()
      .single()

    if (ownerError) throw ownerError

    const ownerId = newOwner.id

    // Add accounting info if provided
    if (accountingInfo) {
      const { error: accountingError } = await supabase.from("owner_accounting_info").insert({
        owner_id: ownerId,
        paymentmethod: accountingInfo.paymentMethod,
        accountnumber: accountingInfo.accountNumber,
        bankname: accountingInfo.bankName,
        iban: accountingInfo.iban,
        swift: accountingInfo.swift,
      })

      if (accountingError) throw accountingError
    }

    // Add tax info if provided
    if (taxInfo) {
      const { error: taxError } = await supabase.from("owner_tax_info").insert({
        owner_id: ownerId,
        taxid: taxInfo.taxId,
        taxresidence: taxInfo.taxResidence,
      })

      if (taxError) throw taxError
    }

    // Assign rooms if provided
    if (rooms && rooms.length > 0) {
      for (const roomId of rooms) {
        const { error: assignError } = await supabase.from("rooms").update({ owner_id: ownerId }).eq("id", roomId)

        if (assignError) throw assignError
      }
    }

    // Add an audit log entry
    try {
      await supabase.from("audit_logs").insert({
        action: "create",
        entity_type: "owner",
        entity_id: ownerId,
        details: `Created owner: ${firstName} ${lastName}`,
      })
    } catch (err) {
      console.error("Failed to create audit log:", err)
    }

    return {
      success: true,
      data: {
        id: ownerId,
        firstName,
        lastName,
        ...otherOwnerData,
        accountingInfo,
        taxInfo,
        rooms,
      },
    }
  } catch (error) {
    console.error("Error creating owner:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create owner",
    }
  }
}

// Function to delete an owner
export async function deleteOwner(id: string) {
  try {
    const supabase = createClientComponentClient<Database>()

    // First, get the owner details for the audit log
    const { data: owner, error: fetchError } = await supabase.from("owners").select("name").eq("id", id).single()

    if (fetchError) throw fetchError

    // Parse the name into first and last name for the audit log
    const firstName = owner.name ? owner.name.split(" ")[0] : ""
    const lastName = owner.name ? owner.name.split(" ").slice(1).join(" ") : ""

    // Clear room assignments
    const { error: roomsError } = await supabase.from("rooms").update({ owner_id: null }).eq("owner_id", id)

    if (roomsError) throw roomsError

    // Delete the owner (cascade will handle related tables)
    const { error: deleteError } = await supabase.from("owners").delete().eq("id", id)

    if (deleteError) throw deleteError

    // Add an audit log entry
    await supabase
      .from("audit_logs")
      .insert({
        action: "delete",
        entity_type: "owner",
        entity_id: id,
        details: `Deleted owner: ${firstName} ${lastName}`,
      })
      .catch((err) => console.error("Failed to create audit log:", err))

    return { success: true }
  } catch (error) {
    console.error("Error deleting owner:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete owner",
    }
  }
}
