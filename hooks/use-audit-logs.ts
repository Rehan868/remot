"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import type { PostgrestError } from "@supabase/supabase-js"

export type AuditLog = {
  id: string
  user_id?: string
  user_email?: string
  action: string
  entity_type: string
  entity_id?: string
  details?: string
  ip_address?: string
  user_agent?: string
  created_at: string
  user?: string // For display purposes
  type?: string // For display purposes (mapped from entity_type)
  timestamp?: string // For display purposes (mapped from created_at)
}

// Hook for fetching all audit logs
export function useAuditLogs() {
  const [data, setData] = useState<AuditLog[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | PostgrestError | null>(null)
  const supabase = getSupabaseClient()

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: logs, error: fetchError } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (fetchError) throw fetchError

      console.log(
        "Fetched audit logs with IP addresses:",
        logs.map((log) => log.ip_address),
      )

      // Transform the data to match our AuditLog type
      const transformedLogs = logs.map((log) => ({
        ...log,
        user: log.user_email || "System",
        type: mapEntityTypeToDisplayType(log.entity_type),
        timestamp: log.created_at,
        ip_address: log.ip_address || null, // Ensure IP address is explicitly included
      }))

      setData(transformedLogs)
    } catch (err) {
      console.error("Error fetching audit logs:", err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  return { data, isLoading, error, refetch: fetchAuditLogs }
}

// Helper function to map entity_type to display type
function mapEntityTypeToDisplayType(entityType: string): string {
  const typeMap: Record<string, string> = {
    user: "User",
    booking: "Booking",
    expense: "Expense",
    room: "Room",
    owner: "Owner",
    auth: "Authentication",
    setting: "Settings",
    system: "System",
  }

  return typeMap[entityType.toLowerCase()] || entityType
}
