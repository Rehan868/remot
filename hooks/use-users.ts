"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Add import for the audit logger
import { logActivity } from "@/lib/audit-logger"

export type User = {
  id: string
  name: string
  email: string
  role: string
  avatar_url?: string | null
  created_at: string
  updated_at: string
}

// Hook for fetching all users
export function useUsers() {
  const [data, setData] = useState<User[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: users, error: supabaseError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      setData(users as User[])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return { data, isLoading, error, refetch: fetchUsers }
}

// Hook for fetching a single user
export function useUser(id: string) {
  const [data, setData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchUser = useCallback(async () => {
    if (!id) return

    setIsLoading(true)
    setError(null)

    try {
      const { data: user, error: supabaseError } = await supabase.from("users").select("*").eq("id", id).single()

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      setData(user as User)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [id, supabase])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return { data, isLoading, error, refetch: fetchUser }
}

// Update the updateUser function to log the activity
export async function updateUser(id: string, userData: Partial<User> & { password?: string }) {
  try {
    const supabase = createClientComponentClient<Database>()

    // Get current user data for the audit log
    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", id)
      .single()

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    // Extract password if it exists
    const { password, ...userDataForUpdate } = userData

    // Update the user in the database
    const { data, error } = await supabase
      .from("users")
      .update({
        ...userDataForUpdate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // If password is provided, update it in auth
    if (password && password.trim() !== "") {
      try {
        // This would typically be handled by a server action
        // For now, we'll just log that we would update the password
        console.log("Password would be updated via server action")

        // In a real implementation, you would call a server action here
        // const { error: passwordError } = await updateUserPassword(id, password);
        // if (passwordError) throw new Error(passwordError);
      } catch (passwordError) {
        console.error("Error updating password:", passwordError)
        // Continue anyway as we've updated the user info
      }
    }

    // Log the activity
    await logActivity({
      userId: id,
      userEmail: userData.email || currentUser.email,
      action: "update",
      entityType: "user",
      entityId: id,
      details: `Updated user: ${userData.name || currentUser.name}`,
    })

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    }
  }
}

// Update the addUser function to log the activity
export async function addUser(userData: Partial<User>) {
  try {
    const supabase = createClientComponentClient<Database>()

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name: userData.name || "New User",
          email: userData.email || "user@example.com",
          role: userData.role || "User",
          avatar_url: userData.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Log the activity
    await logActivity({
      action: "create",
      entityType: "user",
      entityId: data.id,
      details: `Added user: ${data.name} (${data.email}) with role: ${data.role}`,
    })

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add user",
    }
  }
}

// Update the deleteUser function to log the activity
export async function deleteUser(id: string) {
  try {
    const supabase = createClientComponentClient<Database>()

    // Get user data for the audit log
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", id)
      .single()

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    const { data, error } = await supabase.from("users").delete().eq("id", id).select().single()

    if (error) {
      throw new Error(error.message)
    }

    // Log the activity
    await logActivity({
      action: "delete",
      entityType: "user",
      entityId: id,
      details: `Deleted user: ${userData.name} (${userData.email})`,
    })

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    }
  }
}
