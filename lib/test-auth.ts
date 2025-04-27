"\"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function testSupabaseConnection() {
  try {
    console.log("Testing Supabase connection...")
    const supabase = createClientComponentClient()

    // Try to get the session - this should work even without authentication
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Supabase connection error:", error)
      return { success: false, error: error.message }
    }

    console.log("Supabase connection successful")
    return { success: true }
  } catch (error) {
    console.error("Test connection error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function testDirectLogin(email: string, password: string) {
  try {
    console.log(`Testing direct login with ${email}...`)
    const supabase = createClientComponentClient()

    // Try to sign in directly
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Direct login error:", error)
      return { success: false, error: error.message }
    }

    console.log("Direct login successful:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Test login error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function signUpTestUser() {
  try {
    console.log("Creating test user...")
    const supabase = createClientComponentClient()

    // Create a test user
    const { data, error } = await supabase.auth.signUp({
      email: "testuser@example.com",
      password: "password123",
    })

    if (error) {
      console.error("Sign up error:", error)
      return { success: false, error: error.message }
    }

    console.log("Test user created successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Sign up error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function checkDuplicateUsers(email: string) {
  try {
    console.log(`Checking for duplicate users with email: ${email}...`)
    const supabase = createClientComponentClient()

    const { data, error, count } = await supabase.from("users").select("*", { count: "exact" }).eq("email", email)

    if (error) {
      console.error("Check duplicate users error:", error)
      return { success: false, error: error.message }
    }

    console.log(`Found ${count} users with email: ${email}`)
    return { success: true, count }
  } catch (error) {
    console.error("Check duplicate users error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
\
"
