"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase-server"
import { logActivity } from "@/lib/audit-logger"

// Type definitions for settings
export type SettingType = "string" | "number" | "boolean" | "json"
export type SettingCategory = "general" | "notifications" | "security" | "appearance" | "integrations"

export interface SystemSetting {
  id: number
  key: string
  value: string
  type: SettingType
  category: SettingCategory
  description: string
  created_at: string
  updated_at: string
}

// Get all settings
export async function getAllSettings(): Promise<SystemSetting[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("system_settings").select("*")

    if (error) {
      console.error("Error fetching settings:", error)
      throw new Error(`Failed to fetch settings: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllSettings:", error)
    throw error
  }
}

// Get setting by key
export async function getSettingByKey(key: string): Promise<SystemSetting | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("system_settings").select("*").eq("key", key).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null
      }
      console.error(`Error fetching setting with key ${key}:`, error)
      throw new Error(`Failed to fetch setting: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error(`Error in getSettingByKey for key ${key}:`, error)
    throw error
  }
}

// Update setting
export async function updateSetting(key: string, value: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from("system_settings").update({ value }).eq("key", key)

    if (error) {
      console.error(`Error updating setting with key ${key}:`, error)
      return { success: false, message: `Failed to update setting: ${error.message}` }
    }

    // Log the activity
    await logActivity({
      action: "update",
      entityType: "setting",
      entityId: key,
      details: `Updated setting: ${key}`,
    })

    // Revalidate all paths that might use settings
    revalidatePath("/settings")
    revalidatePath("/dashboard")
    revalidatePath("/bookings")
    revalidatePath("/rooms")

    return { success: true, message: "Setting updated successfully" }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error(`Error in updateSetting for key ${key}:`, error)
    return { success: false, message: errorMessage }
  }
}

// Update multiple settings at once
export async function updateSettings(
  settings: { key: string; value: string }[],
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createClient()

    // Use a transaction to update all settings
    const updates = settings.map(({ key, value }) => supabase.from("system_settings").update({ value }).eq("key", key))

    // Execute all updates
    const results = await Promise.all(updates)

    // Check if any updates failed
    const errors = results.filter((result) => result.error)

    if (errors.length > 0) {
      console.error("Errors updating settings:", errors)
      return {
        success: false,
        message: `Failed to update some settings: ${errors.map((e) => e.error?.message).join(", ")}`,
      }
    }

    // Log the activity
    await logActivity({
      action: "update",
      entityType: "setting",
      details: `Updated multiple settings: ${settings.map((s) => s.key).join(", ")}`,
    })

    // Revalidate all paths that might use settings
    revalidatePath("/settings")
    revalidatePath("/dashboard")
    revalidatePath("/bookings")
    revalidatePath("/rooms")

    return { success: true, message: "All settings updated successfully" }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error("Error in updateMultipleSettings:", error)
    return { success: false, message: errorMessage }
  }
}

// Create a new setting
export async function createSetting(
  setting: Omit<SystemSetting, "id" | "created_at" | "updated_at">,
): Promise<{ success: boolean; message: string; data?: SystemSetting }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("system_settings").insert([setting]).select().single()

    if (error) {
      console.error("Error creating setting:", error)
      return { success: false, message: `Failed to create setting: ${error.message}` }
    }

    // Log the activity
    await logActivity({
      action: "create",
      entityType: "setting",
      entityId: setting.key,
      details: `Created setting: ${setting.key} (${setting.description})`,
    })

    revalidatePath("/settings")

    return {
      success: true,
      message: "Setting created successfully",
      data,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error("Error in createSetting:", error)
    return { success: false, message: errorMessage }
  }
}

// Delete a setting
export async function deleteSetting(key: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from("system_settings").delete().eq("key", key)

    if (error) {
      console.error(`Error deleting setting with key ${key}:`, error)
      return { success: false, message: `Failed to delete setting: ${error.message}` }
    }

    // Log the activity
    await logActivity({
      action: "delete",
      entityType: "setting",
      entityId: key,
      details: `Deleted setting: ${key}`,
    })

    revalidatePath("/settings")

    return { success: true, message: "Setting deleted successfully" }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error(`Error in deleteSetting for key ${key}:`, error)
    return { success: false, message: errorMessage }
  }
}
