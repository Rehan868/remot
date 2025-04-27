import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Client-side Supabase client (to be used in client components)
export const createClient = () => {
  return createClientComponentClient<Database>()
}

// Add this debug function at the end of the file, before the export
// This will help identify if there are any issues with the Supabase client configuration
export function debugSupabaseConnection() {
  const supabase = createClient()
  return {
    async testConnection() {
      try {
        const { data, error } = await supabase.from("bookings").select("count").limit(1)
        if (error) {
          console.error("Supabase connection test failed:", error)
          return { success: false, error }
        }
        console.log("Supabase connection test successful:", data)
        return { success: true, data }
      } catch (err) {
        console.error("Unexpected error in Supabase connection test:", err)
        return { success: false, error: err }
      }
    },
    getConfig() {
      // Return a sanitized version of the config for debugging
      // Don't include actual keys
      return {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
      }
    },
  }
}
