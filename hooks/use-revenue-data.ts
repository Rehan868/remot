"use client"

import { useState, useEffect, useCallback } from "react"
import { delay } from "@/lib/mock-data"

// Mock revenue data
const mockRevenueData = {
  todayRevenue: 2450,
  trend: "+12.5%",
  pendingPayments: 8,
  pendingAmount: 3750,
}

export function useRevenueData() {
  const [data, setData] = useState<{
    todayRevenue: number
    trend: string
    pendingPayments: number
    pendingAmount: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRevenueData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await delay(800)
      setData(mockRevenueData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error fetching revenue data"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRevenueData()

    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchRevenueData, 5 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [fetchRevenueData])

  return { data, isLoading, error, refetch: fetchRevenueData }
}
