"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOccupancyData } from "@/hooks/use-occupancy-data"

export function EnhancedPerformanceChart() {
  const [view, setView] = useState<"combined" | "occupancy" | "revenue">("combined")
  const [property, setProperty] = useState<string>("all")
  
  // Fetch data from the hook
  const { data, isLoading, error } = useOccupancyData({ property })

  // Custom tooltip formatter for currency
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  // Custom tooltip formatter for percentages
  const percentFormatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  // Custom tooltip component for better visual display
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center mt-1">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.name === "occupancyRate" 
                  ? `Occupancy: ${entry.value}%` 
                  : `Revenue: ${currencyFormatter.format(entry.value)}`}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-80 text-center">
        <div>
          <p className="text-destructive mb-2">Failed to load chart data</p>
          <p className="text-sm text-muted-foreground">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between mb-6 flex-wrap gap-3">
        <Tabs defaultValue="combined" value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList>
            <TabsTrigger value="combined">Combined View</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={property} onValueChange={setProperty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            <SelectItem value="property1">Main Hotel</SelectItem>
            <SelectItem value="property2">Beach Resort</SelectItem>
            <SelectItem value="property3">Mountain Lodge</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {view === "combined" ? (
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis 
                yAxisId="left"
                orientation="left" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="occupancyRate"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorOccupancy)"
                yAxisId="left"
                name="Occupancy Rate"
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                yAxisId="right"
                name="Revenue"
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          ) : view === "occupancy" ? (
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="occupancyRate"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorOccupancy)"
                name="Occupancy Rate"
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="revenue" 
                fill="#10b981" 
                name="Revenue"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}