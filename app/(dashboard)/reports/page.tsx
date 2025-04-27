"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, CalendarIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  AreaChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useToast } from "@/hooks/use-toast"

// Mock data to avoid database calls that might cause loops
const MOCK_REVENUE_DATA = [
  { name: "Jan", revenue: 4000, expenses: 2400, profit: 1600 },
  { name: "Feb", revenue: 3000, expenses: 1398, profit: 1602 },
  { name: "Mar", revenue: 5000, expenses: 3000, profit: 2000 },
  { name: "Apr", revenue: 2780, expenses: 3908, profit: -1128 },
  { name: "May", revenue: 1890, expenses: 4800, profit: -2910 },
  { name: "Jun", revenue: 2390, expenses: 3800, profit: -1410 },
  { name: "Jul", revenue: 3490, expenses: 4300, profit: -810 },
  { name: "Aug", revenue: 6000, expenses: 2300, profit: 3700 },
  { name: "Sep", revenue: 5500, expenses: 2900, profit: 2600 },
  { name: "Oct", revenue: 4500, expenses: 3100, profit: 1400 },
  { name: "Nov", revenue: 5200, expenses: 3400, profit: 1800 },
  { name: "Dec", revenue: 7800, expenses: 4300, profit: 3500 },
]

const MOCK_OCCUPANCY_DATA = [
  { month: "Jan", occupancyRate: 65, revenue: 12400 },
  { month: "Feb", occupancyRate: 72, revenue: 15200 },
  { month: "Mar", occupancyRate: 80, revenue: 18600 },
  { month: "Apr", occupancyRate: 87, revenue: 21400 },
  { month: "May", occupancyRate: 74, revenue: 16800 },
  { month: "Jun", occupancyRate: 68, revenue: 14500 },
  { month: "Jul", occupancyRate: 78, revenue: 17900 },
  { month: "Aug", occupancyRate: 82, revenue: 19300 },
  { month: "Sep", occupancyRate: 76, revenue: 16700 },
  { month: "Oct", occupancyRate: 84, revenue: 20100 },
  { month: "Nov", occupancyRate: 70, revenue: 15800 },
  { month: "Dec", occupancyRate: 92, revenue: 24600 },
]

const MOCK_BOOKING_SOURCE_DATA = [
  { name: "Direct", value: 40 },
  { name: "Booking.com", value: 30 },
  { name: "Airbnb", value: 20 },
  { name: "Expedia", value: 10 },
]

const MOCK_TOP_ROOMS_DATA = [
  { roomNumber: "301", property: "Downtown Heights", revenue: 12450, occupancy: 92 },
  { roomNumber: "205", property: "Marina Tower", revenue: 10820, occupancy: 87 },
  { roomNumber: "401", property: "Downtown Heights", revenue: 9675, occupancy: 84 },
]

const MOCK_PROPERTIES = [
  { id: "1", name: "Marina Tower" },
  { id: "2", name: "Downtown Heights" },
]

// Define types for our filters
type Property = "all" | string
type ComparisonPeriod = "none" | "prevyear" | "prevmonth" | "prevquarter"

export default function ReportsPage() {
  // State for filters
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [selectedProperty, setSelectedProperty] = useState<Property>("all")
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>("none")
  const { toast } = useToast()

  // Chart colors that match the system UI
  const COLORS = useMemo(() => ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--secondary))"], [])
  const PIE_COLORS = useMemo(
    () => ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"],
    [],
  )

  // Custom tooltip styles
  const tooltipStyle = useMemo(
    () => ({
      backgroundColor: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "0.5rem",
      padding: "0.75rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      color: "hsl(var(--foreground))",
    }),
    [],
  )

  // Apply filters and handle reset
  const applyFilters = useCallback(() => {
    toast({
      title: "Filters Applied",
      description: "Report data has been updated with your filters.",
    })
    // In a real implementation, this would update the applied filters state
  }, [toast])

  const resetFilters = useCallback(() => {
    setDateRange({ from: undefined, to: undefined })
    setSelectedProperty("all")
    setComparisonPeriod("none")

    toast({
      title: "Filters Reset",
      description: "Report filters have been reset to default values.",
    })
  }, [toast])

  // Handle export functions
  const exportAsPDF = useCallback(() => {
    toast({
      title: "Export Started",
      description: "Your report is being exported as PDF.",
    })
    // In a real app, this would trigger a PDF generation
  }, [toast])

  const exportAsExcel = useCallback(() => {
    toast({
      title: "Export Started",
      description: "Your report is being exported as Excel.",
    })
    // In a real app, this would trigger an Excel generation
  }, [toast])

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">Analyze your business performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={exportAsPDF}>
            <Download className="h-4 w-4" />
            Export as PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={exportAsExcel}>
            <FileText className="h-4 w-4" />
            Export as Excel
          </Button>
        </div>
      </div>

      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Filter by date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={new Date()}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Select value={selectedProperty} onValueChange={(value) => setSelectedProperty(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {MOCK_PROPERTIES.map((property) => (
                <SelectItem key={property.id} value={property.name}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={comparisonPeriod} onValueChange={(value) => setComparisonPeriod(value as ComparisonPeriod)}>
            <SelectTrigger>
              <SelectValue placeholder="Comparison period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Comparison</SelectItem>
              <SelectItem value="prevyear">Previous Year</SelectItem>
              <SelectItem value="prevmonth">Previous Month</SelectItem>
              <SelectItem value="prevquarter">Previous Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>
          <Button onClick={applyFilters}>Apply Filters</Button>
        </div>
      </Card>

      <Tabs defaultValue="revenue" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue, Expenses & Profit</CardTitle>
              <CardDescription>Financial performance over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_REVENUE_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis tick={{ fill: "hsl(var(--foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                    <Legend wrapperStyle={{ paddingTop: "10px" }} />
                    <Bar dataKey="revenue" name="Revenue" fill={COLORS[0]} radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="expenses" name="Expenses" fill={COLORS[1]} radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="profit" name="Profit" fill={COLORS[2]} radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Rate</CardTitle>
              <CardDescription>Room occupancy percentage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_OCCUPANCY_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis tick={{ fill: "hsl(var(--foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="occupancyRate"
                      stroke={COLORS[0]}
                      fill={COLORS[0]}
                      fillOpacity={0.3}
                      name="Occupancy %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking Sources</CardTitle>
              <CardDescription>Distribution of booking channels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={MOCK_BOOKING_SOURCE_DATA}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {MOCK_BOOKING_SOURCE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, "Percentage"]} />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: "20px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Rooms</CardTitle>
            <CardDescription>Rooms with highest revenue and occupancy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_TOP_ROOMS_DATA.map((room, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border border-border rounded-md hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="font-medium">Room {room.roomNumber}</p>
                    <p className="text-sm text-muted-foreground">{room.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${room.revenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{room.occupancy}% Occupancy</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forecast</CardTitle>
            <CardDescription>Projected occupancy for next 3 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* This would ideally be connected to a forecasting algorithm */}
              <div className="flex justify-between items-center p-3 border border-border rounded-md hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-medium">{format(new Date().setMonth(new Date().getMonth() + 1), "MMMM yyyy")}</p>
                  <p className="text-sm text-muted-foreground">Next Month</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">85% Projected</p>
                  <p className="text-sm text-muted-foreground">+10% YoY</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border border-border rounded-md hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-medium">{format(new Date().setMonth(new Date().getMonth() + 2), "MMMM yyyy")}</p>
                  <p className="text-sm text-muted-foreground">In 2 Months</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-yellow-600">70% Projected</p>
                  <p className="text-sm text-muted-foreground">+5% YoY</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border border-border rounded-md hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-medium">{format(new Date().setMonth(new Date().getMonth() + 3), "MMMM yyyy")}</p>
                  <p className="text-sm text-muted-foreground">In 3 Months</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">60% Projected</p>
                  <p className="text-sm text-muted-foreground">-2% YoY</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
