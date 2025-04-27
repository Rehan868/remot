"use client"

import { useState, useCallback } from "react"

export function useBookingsFilter() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterValue, setFilterValue] = useState("")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(undefined)

  const clearFilters = useCallback(() => {
    setSearchQuery("")
    setFilterValue("")
    setDateRange(undefined)
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    filterValue,
    setFilterValue,
    dateRange,
    setDateRange,
    clearFilters,
  }
}
