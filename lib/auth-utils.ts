"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@/types/user"

export async function signInWithEmail(email: string, password: string) {
  try {
    console.log("Attempting to sign in with email:", email)
    const supabase = createClientComponentClient()

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Auth error:", error.message)
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: "No user returned from authentication" }
    }

    console.log("Authentication successful, fetching user data")

    // Get user profile from users table - use .limit(1) instead of .single() to avoid the multiple rows error
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("email", email).limit(1)

    if (userError) {
      console.error("User data error:", userError.message)
      return { success: false, error: "Failed to fetch user data" }
    }

    if (!userData || userData.length === 0) {
      console.error("No user data found for email:", email)
      return { success: false, error: "User not found in database" }
    }

    console.log("User data fetched successfully:", userData[0])

    return {
      success: true,
      user: userData[0] as User,
      session: data.session,
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sign in",
    }
  }
}

export async function signOut() {
  try {
    const supabase = createClientComponentClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Logout error:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Sign out error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

export async function getCurrentUser() {
  try {
    const supabase = createClientComponentClient()

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return { user: null, error: sessionError.message }
    }

    if (!session) {
      return { user: null }
    }

    // Get user profile from users table - use .limit(1) instead of .single() to avoid the multiple rows error
    const { data, error } = await supabase.from("users").select("*").eq("email", session.user.email).limit(1)

    if (error) {
      console.error("User data error:", error)
      return { user: null, error: error.message }
    }

    if (!data || data.length === 0) {
      return { user: null, error: "User not found in database" }
    }

    return { user: data[0] as User }
  } catch (error) {
    console.error("Get current user error:", error)
    return { user: null, error: error instanceof Error ? error.message : "An unknown error occurred" }
  }
}
