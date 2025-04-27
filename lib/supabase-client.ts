"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

// Mock client for local development without environment variables
const createMockClient = () => {
  console.warn("Using mock Supabase client - for development only")
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () =>
        Promise.resolve({ data: { user: { id: "mock-user-id", email: "mock@example.com" } }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null }),
    }),
  } as any
}

// Export createClient for backward compatibility
export function createClient() {
  // Check if environment variables are available
  const hasEnvVars =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!hasEnvVars) {
    return createMockClient()
  }

  return createClientComponentClient()
}

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  // Check if environment variables are available
  const hasEnvVars =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!hasEnvVars) {
    return createMockClient()
  }

  supabaseClient = createClientComponentClient<Database>()
  return supabaseClient
}
