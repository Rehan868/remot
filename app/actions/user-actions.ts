"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/audit-logger"

export async function createUserWithAuth(userData: {
  name: string
  email: string
  password: string
  role: string
  avatar_url?: string
}) {
  const supabase = createClient()

  try {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    // Then add the user to our users table
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      avatar_url: userData.avatar_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (userError) {
      return { success: false, error: userError.message }
    }

    // Log the activity
    await logActivity({
      userId: authData.user.id,
      userEmail: userData.email,
      action: "create",
      entityType: "user",
      entityId: authData.user.id,
      details: `Created user: ${userData.name} with role: ${userData.role}`,
    })

    revalidatePath("/users")
    return { success: true, userId: authData.user.id }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return { success: false, error: errorMessage }
  }
}

export async function updateUserWithAuth(
  userId: string,
  userData: {
    name?: string
    email?: string
    role?: string
    avatar_url?: string
    password?: string
  },
) {
  const supabase = createClient()

  try {
    // Get the user's current data for the audit log
    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("email, name")
      .eq("id", userId)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // Update the user in our users table
    const { error: updateError } = await supabase
      .from("users")
      .update({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar_url: userData.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // If password is provided, update it in auth
    if (userData.password) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(userId, {
        password: userData.password,
      })

      if (passwordError) {
        return { success: false, error: passwordError.message }
      }
    }

    // Log the activity
    await logActivity({
      userId,
      userEmail: userData.email || currentUser.email,
      action: "update",
      entityType: "user",
      entityId: userId,
      details: `Updated user: ${userData.name || currentUser.name}`,
    })

    revalidatePath("/users")
    revalidatePath(`/users/${userId}`)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return { success: false, error: errorMessage }
  }
}

export async function deleteUserWithAuth(userId: string) {
  const supabase = createClient()

  try {
    // Get the user's data for the audit log
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("email, name")
      .eq("id", userId)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // Delete the user from our users table
    const { error: deleteError } = await supabase.from("users").delete().eq("id", userId)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    // Delete the user from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("Could not delete auth user:", authError)
      // Continue anyway as we've deleted from our users table
    }

    // Log the activity
    await logActivity({
      action: "delete",
      entityType: "user",
      entityId: userId,
      details: `Deleted user: ${userData.name} (${userData.email})`,
    })

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return { success: false, error: errorMessage }
  }
}
