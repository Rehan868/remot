"use client"

import { useState } from "react"
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from "recharts"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type ChartType = "area" | "bar" | "line"
type MetricView = "occupancy-revenue" | "bookings-stays"

export function EnhancedDashboardChart() {
  const [chartType, setChartType] = useState<ChartType>("area")
  const [metricView, setMetricView] = useState<MetricView>("occupancy-revenue")
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'daily'>('monthly')

  // Fetch dashboard metrics with the selected period
  const { data, isLoading, error, summary } = useDashboardMetrics({ period })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center">
        <p className="text-red-500 font-medium">Failed to load dashboard data</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">{error.message}</p>
      </div>
    )
  }

  // Format the dollar values for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  // Configure chart colors based on the system's primary and secondary colors
  const primaryColor = "hsl(var(--primary))"
  const primaryLightColor = "hsl(var(--primary) / 0.2)"
  const secondaryColor = "hsl(var(--secondary))"
  const secondaryLightColor = "hsl(var(--secondary) / 0.2)"
  const accentColor = "hsl(var(--accent))"

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between pb-2 space-y-2 sm:space-y-0">
        <div>
          <CardTitle>Hotel Performance</CardTitle>
          <CardDescription>
            {period === 'monthly' ? 'Yearly' : period === 'weekly' ? 'Last 12 weeks' : 'Last 14 days'} overview of key metrics
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as 'monthly' | 'weekly' | 'daily')}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={chartType}
            onValueChange={(value) => setChartType(value as ChartType)}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pb-1">
        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
              <div className="text-xs text-muted-foreground">Total Revenue</div>
            </div>
            <div className="bg-secondary/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{summary.averageOccupancy}%</div>
              <div className="text-xs text-muted-foreground">Avg. Occupancy</div>
            </div>
            <div className="bg-accent/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{summary.totalBookings}</div>
              <div className="text-xs text-muted-foreground">Total Bookings</div>
            </div>
          </div>
        )}

        {/* Tabs for different metric views */}
        <Tabs 
          defaultValue="occupancy-revenue" 
          value={metricView}
          onValueChange={(value) => setMetricView(value as MetricView)}
          className="mt-2"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="occupancy-revenue">Occupancy & Revenue</TabsTrigger>
            <TabsTrigger value="bookings-stays">Bookings & Stays</TabsTrigger>
          </TabsList>
          
          <TabsContent value="occupancy-revenue" className="mt-0">
            <div className="h-80">
              {chartType === "area" && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left" 
                      label={{ 
                        value: 'Occupancy %', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: "hsl(var(--foreground))" }
                      }}
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      domain={[0, 100]}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      label={{ 
                        value: 'Revenue ($)', 
                        angle: 90, 
                        position: 'insideRight',
                        style: { textAnchor: 'middle', fill: "hsl(var(--foreground))" }
                      }}
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        borderColor: "hsl(var(--border))", 
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
                      }} 
                      formatter={(value, name) => {
                        if (name === "Occupancy Rate") return [`${value}%`, name];
                        return [formatCurrency(value as number), name];
                      }}
                    />
                    <Legend />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="occupancyRate" 
                      name="Occupancy Rate" 
                      stroke={primaryColor} 
                      fillOpacity={1}
                      fill="url(#colorOccupancy)" 
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="revenue" 
                      name="Revenue" 
                      stroke={secondaryColor} 
                      fillOpacity={1}
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              
              {chartType === "bar" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left"
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        borderColor: "hsl(var(--border))", 
                        borderRadius: "0.5rem" 
                      }}
                      formatter={(value, name) => {
                        if (name === "Occupancy Rate") return [`${value}%`, name];
                        return [formatCurrency(value as number), name];
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="occupancyRate" 
                      name="Occupancy Rate" 
                      fill={primaryColor} 
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="revenue" 
                      name="Revenue" 
                      fill={secondaryColor} 
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {chartType === "line" && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left"
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        borderColor: "hsl(var(--border))", 
                        borderRadius: "0.5rem" 
                      }}
                      formatter={(value, name) => {
                        if (name === "Occupancy Rate") return [`${value}%`, name];
                        return [formatCurrency(value as number), name];
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="occupancyRate" 
                      name="Occupancy Rate" 
                      stroke={primaryColor}
                      strokeWidth={2}
                      dot={{ fill: primaryColor, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="revenue" 
                      name="Revenue" 
                      stroke={secondaryColor}
                      strokeWidth={2}
                      dot={{ fill: secondaryColor, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="bookings-stays" className="mt-0">
            <div className="h-80">
              {chartType === "area" && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorStays" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={accentColor} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left"
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        borderColor: "hsl(var(--border))", 
                        borderRadius: "0.5rem" 
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="bookingsCount" 
                      name="Bookings Count" 
                      stroke={primaryColor} 
                      fillOpacity={1}
                      fill="url(#colorBookings)" 
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="averageStay" 
                      name="Avg. Stay (Days)" 
                      stroke={accentColor} 
                      fillOpacity={1}
                      fill="url(#colorStays)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              
              {chartType === "bar" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left"
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        borderColor: "hsl(var(--border))", 
                        borderRadius: "0.5rem" 
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="bookingsCount" 
                      name="Bookings Count" 
                      fill={primaryColor} 
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="averageStay" 
                      name="Avg. Stay (Days)" 
                      fill={accentColor} 
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {chartType === "line" && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left"
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        borderColor: "hsl(var(--border))", 
                        borderRadius: "0.5rem" 
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="bookingsCount" 
                      name="Bookings Count" 
                      stroke={primaryColor}
                      strokeWidth={2}
                      dot={{ fill: primaryColor, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="averageStay" 
                      name="Avg. Stay (Days)" 
                      stroke={accentColor}
                      strokeWidth={2}
                      dot={{ fill: accentColor, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}