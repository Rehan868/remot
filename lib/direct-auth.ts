"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@/types/user"
import { setAuthCookie, getAuthCookie, removeAuthCookie, getOrCreateDeviceId, getClientIpAddress } from "./cookie-utils"

// Function to log in with email and password directly from users table
export async function loginWithEmailPassword(email: string, password: string, rememberMe = false) {
  try {
    const supabase = createClientComponentClient()

    // Query the users table directly
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password) // This would be the plaintext password
      .limit(1)

    if (error) {
      console.error("Login error:", error.message)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = data[0] as User
    const deviceId = getOrCreateDeviceId()
    const ipAddress = await getClientIpAddress()

    // Create a session token (in a real app, this would be a JWT)
    const token = btoa(`${user.id}:${Date.now()}`)

    // Store in cookie if rememberMe is true
    setAuthCookie(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        token,
        deviceId,
        ipAddress,
      },
      rememberMe,
    )

    // Log the login event with device and IP information
    await logLoginEvent(user.id, deviceId, ipAddress)

    // Create a session manually by storing the user in localStorage
    localStorage.setItem("user", JSON.stringify(user))

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sign in",
    }
  }
}

// Function to log out
export async function logoutDirect() {
  removeAuthCookie()
  localStorage.removeItem("user")
  return { success: true }
}

// Function to get the current user
export function getCurrentUserDirect() {
  try {
    // First check the cookie
    const authCookie = getAuthCookie()

    if (authCookie) {
      // Verify if the cookie is still valid (you might want to add more validation)
      // For now, we'll just update the last login time
      const supabase = createClientComponentClient()

      // Get the user from the database to ensure it's up to date
      supabase
        .from("users")
        .select("*")
        .eq("id", authCookie.userId)
        .limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) {
            // Update localStorage with the latest user data
            localStorage.setItem("user", JSON.stringify(data[0]))
          }
        })
        .catch(console.error)

      // Return the user from localStorage for now (will be updated in the background)
      const userJson = localStorage.getItem("user")
      if (userJson) {
        return { user: JSON.parse(userJson), error: null }
      }
    }

    // Fallback to localStorage if no cookie
    const userJson = localStorage.getItem("user")
    if (!userJson) {
      return { user: null, error: null }
    }

    const user = JSON.parse(userJson)
    return { user, error: null }
  } catch (error) {
    console.error("Get current user error:", error)
    return {
      user: null,
      error: error instanceof Error ? error.message : "Failed to get current user",
    }
  }
}

// Function to log login events
async function logLoginEvent(userId: string, deviceId: string, ipAddress: string) {
  try {
    const supabase = createClientComponentClient()

    // Log to a login_history table
    await supabase.from("login_history").insert({
      user_id: userId,
      device_id: deviceId,
      ip_address: ipAddress,
      login_time: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to log login event:", error)
    // Don't fail the login if this fails
  }
}
