"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  DollarSign,
  Home,
  Key,
  Loader,
  Settings,
  ShoppingCart,
  Sliders,
  User,
  Users,
} from "lucide-react"
import { useAuditLogs } from "@/hooks/use-audit-logs"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"

function getLogTypeIcon(type: string | undefined) {
  if (!type) return <AlertTriangle className="h-4 w-4" />

  switch (type.toLowerCase()) {
    case "authentication":
      return <Key className="h-4 w-4" />
    case "booking":
      return <ShoppingCart className="h-4 w-4" />
    case "user":
      return <User className="h-4 w-4" />
    case "system":
      return <Settings className="h-4 w-4" />
    case "expense":
      return <DollarSign className="h-4 w-4" />
    case "room":
      return <Home className="h-4 w-4" />
    case "owner":
      return <Users className="h-4 w-4" />
    case "setting":
      return <Sliders className="h-4 w-4" />
    default:
      return <AlertTriangle className="h-4 w-4" />
  }
}

function getLogTypeBadge(type: string | undefined) {
  if (!type) return <Badge>Unknown</Badge>

  switch (type.toLowerCase()) {
    case "authentication":
      return <Badge className="bg-blue-100 text-blue-800">Authentication</Badge>
    case "booking":
      return <Badge className="bg-green-100 text-green-800">Booking</Badge>
    case "user":
      return <Badge className="bg-purple-100 text-purple-800">User</Badge>
    case "system":
      return <Badge className="bg-gray-100 text-gray-800">System</Badge>
    case "settings":
      return <Badge className="bg-yellow-100 text-yellow-800">Settings</Badge>
    default:
      return <Badge>{type}</Badge>
  }
}

interface AuditLogListProps {
  searchQuery?: string
  filterValue?: string
  dateRange?: DateRange
}

export function AuditLogList({ searchQuery = "", filterValue = "all", dateRange }: AuditLogListProps) {
  const { data: logs, isLoading, error } = useAuditLogs()

  // Apply filters to logs
  const filteredLogs = useMemo(() => {
    if (!logs) return []

    return logs.filter((log) => {
      // Apply search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery ||
        log.action.toLowerCase().includes(searchLower) ||
        log.user.toLowerCase().includes(searchLower) ||
        log.ip_address?.toLowerCase().includes(searchLower) ||
        log.details?.toLowerCase().includes(searchLower)

      // Apply type filter
      const matchesType = filterValue === "all" || (log.type && log.type.toLowerCase() === filterValue.toLowerCase())

      // Apply date filter
      let matchesDate = true
      if (dateRange?.from) {
        const logDate = new Date(log.timestamp)
        const filterFrom = dateRange.from
        const filterTo = dateRange.to || dateRange.from

        matchesDate = logDate >= filterFrom && logDate <= filterTo
      }

      return matchesSearch && matchesType && matchesDate
    })
  }, [logs, searchQuery, filterValue, dateRange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading audit logs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500">Failed to load audit logs</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left font-medium px-6 py-3">Type</th>
            <th className="text-left font-medium px-6 py-3">Timestamp</th>
            <th className="text-left font-medium px-6 py-3">User</th>
            <th className="text-left font-medium px-6 py-3">Action</th>
            <th className="text-left font-medium px-6 py-3">IP Address</th>
            <th className="text-left font-medium px-6 py-3">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filteredLogs.map((log) => (
            <tr key={log.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    {getLogTypeIcon(log.type)}
                  </span>
                  <span>{getLogTypeBadge(log.type)}</span>
                </div>
              </td>
              <td className="px-6 py-4 font-mono text-sm">{format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}</td>
              <td className="px-6 py-4">{log.user_email || "System"}</td>
              <td className="px-6 py-4 font-medium">{log.action}</td>
              <td className="px-6 py-4 font-mono text-sm">{log.ip_address ? log.ip_address : "N/A"}</td>
              <td className="px-6 py-4 text-sm text-muted-foreground truncate max-w-xs">
                {log.details || "No details"}
              </td>
            </tr>
          ))}
          {(!filteredLogs || filteredLogs.length === 0) && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                No audit logs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="bg-muted/30 px-6 py-4 text-sm text-muted-foreground">
        Showing {filteredLogs.length} of {logs?.length || 0} logs
      </div>
    </div>
  )
}
