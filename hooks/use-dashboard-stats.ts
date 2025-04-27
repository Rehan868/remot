"use client"

import { useState, useEffect, useCallback } from "react"
import { dashboardStats, delay } from "@/lib/mock-data"

// Hook for fetching dashboard statistics
export function useDashboardStats() {
  const [data, setData] = useState(dashboardStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await delay(1000)
      setData(dashboardStats)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { data, isLoading, error, refetch: fetchStats }
}
