"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface RoomFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  propertyFilter: string
  setPropertyFilter: (property: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  handleSearch: (e: React.FormEvent) => void
  clearFilters: () => void
  filteredCount: number
  showFilterSummary: boolean
}

export function RoomFilters({
  searchQuery,
  setSearchQuery,
  propertyFilter,
  setPropertyFilter,
  statusFilter,
  setStatusFilter,
  handleSearch,
  clearFilters,
  filteredCount,
  showFilterSummary,
}: RoomFiltersProps) {
  return (
    <Card className="p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <form onSubmit={handleSearch}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by room number..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            <SelectItem value="marina">Marina Tower</SelectItem>
            <SelectItem value="downtown">Downtown Heights</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="clean">Clean</SelectItem>
            <SelectItem value="dirty">Needs Cleaning</SelectItem>
            <SelectItem value="inprogress">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showFilterSummary && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {filteredCount} {filteredCount === 1 ? "room" : "rooms"} found
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </Card>
  )
}
