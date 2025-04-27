"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Loader2 } from "lucide-react"
import { useRevenueData } from "@/hooks/use-revenue-data"
import { logError } from "@/lib/debug-utils"
import { useFormat } from "@/hooks/use-format"

export function RevenueStats() {
  const { data, isLoading, error } = useRevenueData()
  const { formatCurrency } = useFormat()

  // Log any errors to help with debugging
  if (error) {
    logError("Revenue Stats", error)
  }

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            <p>Failed to load revenue data</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        ) : data ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Today's Revenue</p>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold">{formatCurrency(data.todayRevenue)}</p>
              </div>
              {data.trend && (
                <div className="flex items-center text-xs text-green-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {data.trend} from last week
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Pending Payments</p>
              <p className="text-2xl font-bold">{data.pendingPayments}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(data.pendingAmount)} total amount</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
