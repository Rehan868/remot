"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/audit-logger"

export async function updateUserProfile(
  userId: string,
  profileData: {
    name?: string
    email?: string
    phone?: string
    position?: string
    avatar_url?: string
  },
) {
  const supabase = createClient()

  try {
    // Get current user data for comparison and audit logging
    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("name, email, phone, position, avatar_url")
      .eq("id", userId)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // Only update fields that have changed
    const updates: Record<string, any> = {}
    const changedFields: string[] = []

    if (profileData.name && profileData.name !== currentUser.name) {
      updates.name = profileData.name
      changedFields.push("name")
    }

    if (profileData.email && profileData.email !== currentUser.email) {
      updates.email = profileData.email
      changedFields.push("email")
    }

    if (profileData.phone && profileData.phone !== currentUser.phone) {
      updates.phone = profileData.phone
      changedFields.push("phone")
    }

    if (profileData.position && profileData.position !== currentUser.position) {
      updates.position = profileData.position
      changedFields.push("position")
    }

    if (profileData.avatar_url && profileData.avatar_url !== currentUser.avatar_url) {
      updates.avatar_url = profileData.avatar_url
      changedFields.push("avatar")
    }

    // If nothing changed, return early
    if (Object.keys(updates).length === 0) {
      return { success: true, message: "No changes detected" }
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString()

    // Update the user profile
    const { error } = await supabase.from("users").update(updates).eq("id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Log the activity
    await logActivity({
      userId,
      userEmail: profileData.email || currentUser.email,
      action: "update",
      entityType: "profile",
      entityId: userId,
      details: `Updated profile fields: ${changedFields.join(", ")}`,
    })

    revalidatePath("/profile")
    return {
      success: true,
      message: "Profile updated successfully",
      updatedFields: changedFields,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return { success: false, error: errorMessage }
  }
}

export async function updateUserPassword(userId: string, currentPassword: string, newPassword: string) {
  const supabase = createClient()

  try {
    // Get user email for auth operations
    const { data: userData, error: fetchError } = await supabase.from("users").select("email").eq("id", userId).single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: currentPassword,
    })

    if (signInError) {
      return { success: false, error: "Current password is incorrect" }
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Log the activity
    await logActivity({
      userId,
      userEmail: userData.email,
      action: "update",
      entityType: "password",
      entityId: userId,
      details: "Password updated",
    })

    return { success: true, message: "Password updated successfully" }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return { success: false, error: errorMessage }
  }
}

export async function updateNotificationPreferences(userId: string, preferences: Record<string, boolean>) {
  const supabase = createClient()

  try {
    // Get user data for audit logging
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("email, notification_preferences")
      .eq("id", userId)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // Update notification preferences
    const { error } = await supabase
      .from("users")
      .update({
        notification_preferences: preferences,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Log the activity
    await logActivity({
      userId,
      userEmail: userData.email,
      action: "update",
      entityType: "notification_preferences",
      entityId: userId,
      details: "Updated notification preferences",
    })

    revalidatePath("/profile")
    return { success: true, message: "Notification preferences updated successfully" }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return { success: false, error: errorMessage }
  }
}

export async function updateTwoFactorAuth(userId: string, enabled: boolean) {
  const supabase = createClient()

  try {
    // Get user data for audit logging
    const { data: userData, error: fetchError } = await supabase.from("users").select("email").eq("id", userId).single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // Update two-factor authentication status
    const { error } = await supabase
      .from("users")
      .update({
        two_factor_enabled: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Log the activity
    await logActivity({
      userId,
      userEmail: userData.email,
      action: "update",
      entityType: "two_factor_auth",
      entityId: userId,
      details: enabled ? "Enabled two-factor authentication" : "Disabled two-factor authentication",
    })

    revalidatePath("/profile")
    return {
      success: true,
      message: enabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return { success: false, error: errorMessage }
  }
}
