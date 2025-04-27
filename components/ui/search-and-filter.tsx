"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

interface FilterOption {
  value: string
  label: string
}

interface SearchAndFilterProps {
  searchPlaceholder?: string
  filterOptions: FilterOption[]
  filterLabel: string
  showDateFilter?: boolean
  onSearch: (query: string) => void
  onFilter: (value: string) => void
  onDateRangeChange?: (range: DateRange | undefined) => void
  onClearFilters: () => void
}

export function SearchAndFilter({
  searchPlaceholder = "Search...",
  filterOptions,
  filterLabel,
  showDateFilter = false,
  onSearch,
  onFilter,
  onDateRangeChange,
  onClearFilters,
}: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterValue, setFilterValue] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isFiltered, setIsFiltered] = useState(false)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
    setIsFiltered(value !== "" || filterValue !== "all" || !!dateRange)
  }

  const handleFilter = (value: string) => {
    setFilterValue(value)
    onFilter(value)
    setIsFiltered(searchQuery !== "" || value !== "all" || !!dateRange)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    if (onDateRangeChange) {
      onDateRangeChange(range)
    }
    setIsFiltered(searchQuery !== "" || filterValue !== "all" || !!range)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setFilterValue("all")
    setDateRange(undefined)
    onClearFilters()
    setIsFiltered(false)
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={filterValue} onValueChange={handleFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={`Filter by ${filterLabel}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filterLabel}s</SelectItem>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showDateFilter && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full md:w-[240px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Filter by date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}

          {isFiltered && (
            <Button variant="ghost" onClick={handleClearFilters} className="px-3">
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
