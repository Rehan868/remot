"use server"

import { createClient } from "@supabase/supabase-js"

export async function createTestUserWithHash() {
  try {
    // Create a Supabase admin client
    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create a test user with admin privileges
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: "testadmin@example.com",
      password: "password123",
      email_confirm: true,
    })

    if (error) {
      console.error("Error creating test user:", error)
      return { success: false, error: error.message }
    }

    // Add the user to the public.users table
    const { error: insertError } = await supabaseAdmin.from("users").insert({
      id: data.user.id,
      email: "testadmin@example.com",
      name: "Test Admin",
      role: "Administrator",
      created_at: new Date(),
      updated_at: new Date(),
    })

    if (insertError) {
      console.error("Error inserting user into public.users:", insertError)
      return { success: false, error: insertError.message }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Server action error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
