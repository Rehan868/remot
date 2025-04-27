"use client"

import { useState, useCallback } from "react"

export function useRoomsFilter() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterValue, setFilterValue] = useState("")

  const clearFilters = useCallback(() => {
    setSearchQuery("")
    setFilterValue("")
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    filterValue,
    setFilterValue,
    clearFilters,
  }
}
