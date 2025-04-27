"use client"

import { Button } from "@/components/ui/button"
import { SearchAndFilter } from "@/components/ui/search-and-filter"
import { FileDown } from "lucide-react"
import { AuditLogList } from "@/components/audit/audit-log-list"
import { useAuditLogsFilter } from "@/hooks/use-audit-logs-filter"

export default function AuditLogsPage() {
  const { searchQuery, setSearchQuery, filterValue, setFilterValue, dateRange, setDateRange, clearFilters } =
    useAuditLogsFilter()

  const handleExport = () => {
    // Implementation for exporting logs would go here
    console.log("Exporting logs...")
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Track all system activity and user actions</p>
        </div>
        <Button className="mt-4 md:mt-0" variant="outline" onClick={handleExport}>
          <FileDown className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <SearchAndFilter
        searchPlaceholder="Search logs..."
        filterOptions={[
          { value: "authentication", label: "Authentication" },
          { value: "booking", label: "Booking" },
          { value: "user", label: "User" },
          { value: "system", label: "System" },
          { value: "settings", label: "Settings" },
        ]}
        filterLabel="Log Type"
        showDateFilter={true}
        onSearch={setSearchQuery}
        onFilter={setFilterValue}
        onDateRangeChange={setDateRange}
        onClearFilters={clearFilters}
      />

      <AuditLogList searchQuery={searchQuery} filterValue={filterValue} dateRange={dateRange} />
    </div>
  )
}
