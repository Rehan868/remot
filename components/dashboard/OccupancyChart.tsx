"use client"

import { useOccupancyData } from "@/hooks/use-occupancy-data"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Loader2 } from "lucide-react"

export function OccupancyChart() {
  const { data, isLoading, error } = useOccupancyData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <p className="text-red-500">Failed to load occupancy data</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
        <XAxis dataKey="month" tick={{ fill: "hsl(var(--foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
        <YAxis
          yAxisId="left"
          orientation="left"
          stroke="hsl(var(--primary))"
          tick={{ fill: "hsl(var(--foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="hsl(var(--secondary))"
          tick={{ fill: "hsl(var(--foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend
          wrapperStyle={{
            paddingTop: "10px",
            color: "hsl(var(--foreground))",
          }}
        />
        <Bar
          yAxisId="left"
          dataKey="occupancyRate"
          name="Occupancy Rate (%)"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
        <Bar
          yAxisId="right"
          dataKey="revenue"
          name="Revenue ($)"
          fill="hsl(var(--secondary))"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
