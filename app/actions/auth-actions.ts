"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/audit-logger"

export async function createUser(formData: FormData) {
  const supabase = createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const role = formData.get("role") as string

  try {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    // Then add the user to our users table
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      name,
      role,
    })

    if (userError) {
      return { success: false, error: userError.message }
    }

    // Log the activity
    await logActivity({
      userId: authData.user.id,
      userEmail: email,
      action: "create",
      entityType: "user",
      entityId: authData.user.id,
      details: `Created user: ${name} with role: ${role}`,
    })

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return { success: false, error: errorMessage }
  }
}

export async function updateUserRole(userId: string, role: string) {
  const supabase = createClient()

  try {
    // Get the user's email for the audit log
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email, name")
      .eq("id", userId)
      .single()

    if (userError) {
      return { success: false, error: userError.message }
    }

    const { error } = await supabase.from("users").update({ role }).eq("id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Log the activity
    await logActivity({
      userId,
      userEmail: userData.email,
      action: "update",
      entityType: "user",
      entityId: userId,
      details: `Updated role for user: ${userData.name} to: ${role}`,
    })

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return { success: false, error: errorMessage }
  }
}
