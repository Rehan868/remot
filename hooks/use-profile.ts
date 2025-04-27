"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { useAuth } from "./use-auth"

export type ProfileData = {
  id: string
  name: string
  email: string
  phone?: string | null
  position?: string | null
  avatar_url?: string | null
  notification_preferences?: Record<string, boolean> | null
  two_factor_enabled?: boolean
  created_at: string
  updated_at?: string
}

export function useProfile() {
  const [data, setData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient<Database>()

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const { data: profile, error: supabaseError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Set default notification preferences if not set
      if (!profile.notification_preferences) {
        profile.notification_preferences = {
          email: true,
          browser: true,
          mobile: false,
          bookings: true,
          system: true,
          marketing: false,
        }
      }

      setData(profile as ProfileData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { data, isLoading, error, refetch: fetchProfile }
}
