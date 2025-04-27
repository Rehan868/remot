"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export type DashboardMetrics = {
  month: string
  occupancyRate: number
  revenue: number
  bookingsCount: number
  averageStay: number
}

export type DashboardFilters = {
  property?: string
  dateRange?: { from?: Date; to?: Date }
  period?: 'monthly' | 'weekly' | 'daily'
}

export function useDashboardMetrics(filters: DashboardFilters = {}) {
  const [data, setData] = useState<DashboardMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()
  const supabase = createClient()
  
  // Default to monthly view if not specified
  const period = filters.period || 'monthly'

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true)
      setError(null)

      try {
        // Get current year or use date range if provided
        const currentYear = new Date().getFullYear()
        const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date(currentYear, 0, 1)
        const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date(currentYear, 11, 31)

        // Format dates for database query
        const startDateStr = startDate.toISOString().split("T")[0]
        const endDateStr = endDate.toISOString().split("T")[0]

        // Fetch bookings for the current year
        let bookingsQuery = supabase
          .from("bookings")
          .select("check_in, check_out, amount, property, id")
          .gte("check_in", startDateStr)
          .lte("check_out", endDateStr)

        // Apply property filter if specified
        if (filters.property && filters.property !== "all") {
          bookingsQuery = bookingsQuery.eq("property", filters.property)
        }

        const { data: bookings, error: bookingsError } = await bookingsQuery

        if (bookingsError) throw bookingsError

        // Fetch total rooms count
        const { count: totalRooms, error: roomsCountError } = await supabase
          .from("rooms")
          .select("*", { count: "exact", head: true })

        if (roomsCountError) throw roomsCountError

        // Use a safe default if count is null
        const roomsCount = totalRooms || 1 // Avoid division by zero

        // Prepare time periods based on filter
        let periodLabels: string[] = [];
        let periodData: Record<string, { 
          occupiedDays: number; 
          totalDays: number; 
          revenue: number;
          bookingsCount: number;
          totalStayDays: number;
        }> = {};

        if (period === 'monthly') {
          // Monthly view
          periodLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          periodLabels.forEach((month) => {
            periodData[month] = { 
              occupiedDays: 0, 
              totalDays: 0, 
              revenue: 0,
              bookingsCount: 0,
              totalStayDays: 0
            };
          });
        } else if (period === 'weekly') {
          // Weekly view (last 12 weeks)
          for (let i = 11; i >= 0; i--) {
            const weekDate = new Date();
            weekDate.setDate(weekDate.getDate() - (i * 7));
            const weekLabel = `W${Math.ceil((weekDate.getDate() + weekDate.getDay()) / 7)}`;
            periodLabels.push(weekLabel);
            periodData[weekLabel] = { 
              occupiedDays: 0, 
              totalDays: 0, 
              revenue: 0,
              bookingsCount: 0,
              totalStayDays: 0
            };
          }
        } else if (period === 'daily') {
          // Daily view (last 14 days)
          for (let i = 13; i >= 0; i--) {
            const dayDate = new Date();
            dayDate.setDate(dayDate.getDate() - i);
            const dayLabel = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            periodLabels.push(dayLabel);
            periodData[dayLabel] = { 
              occupiedDays: 0, 
              totalDays: 0, 
              revenue: 0,
              bookingsCount: 0,
              totalStayDays: 0
            };
          }
        }

        // Calculate metrics by period
        if (bookings) {
          bookings.forEach((booking) => {
            const checkIn = new Date(booking.check_in);
            const checkOut = new Date(booking.check_out);
            const amount = booking.amount || 0;

            // Skip if dates are invalid
            if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return;

            // Calculate duration in days
            const duration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
            
            // Get the period label based on check-in date
            let periodLabel: string;
            
            if (period === 'monthly') {
              periodLabel = periodLabels[checkIn.getMonth()];
              periodData[periodLabel].bookingsCount += 1;
              periodData[periodLabel].totalStayDays += duration;
            } else if (period === 'weekly') {
              // Find the correct week label
              const weekNumber = `W${Math.ceil((checkIn.getDate() + checkIn.getDay()) / 7)}`;
              if (periodData[weekNumber]) {
                periodLabel = weekNumber;
                periodData[periodLabel].bookingsCount += 1;
                periodData[periodLabel].totalStayDays += duration;
              }
            } else if (period === 'daily') {
              // Find the correct day label
              const dayLabel = checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              if (periodData[dayLabel]) {
                periodLabel = dayLabel;
                periodData[periodLabel].bookingsCount += 1;
                periodData[periodLabel].totalStayDays += duration;
              }
            }

            // Distribute the booking days and revenue across periods
            const currentDate = new Date(checkIn);
            while (currentDate < checkOut) {
              let currentPeriodLabel: string;
              
              if (period === 'monthly') {
                currentPeriodLabel = periodLabels[currentDate.getMonth()];
              } else if (period === 'weekly') {
                const weekNum = `W${Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7)}`;
                if (!periodData[weekNum]) continue;
                currentPeriodLabel = weekNum;
              } else {
                const dayLabel = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (!periodData[dayLabel]) continue;
                currentPeriodLabel = dayLabel;
              }

              periodData[currentPeriodLabel].occupiedDays += 1;
              periodData[currentPeriodLabel].revenue += amount / duration; // Distribute revenue evenly

              // Move to next day
              currentDate.setDate(currentDate.getDate() + 1);
            }
          });
        }

        // Calculate days in each period for the occupancy rate
        if (period === 'monthly') {
          // Calculate days in each month
          periodLabels.forEach((month, index) => {
            const daysInMonth = new Date(currentYear, index + 1, 0).getDate();
            periodData[month].totalDays = daysInMonth * roomsCount;
          });
        } else if (period === 'weekly') {
          // Each week has 7 days
          periodLabels.forEach(week => {
            periodData[week].totalDays = 7 * roomsCount;
          });
        } else if (period === 'daily') {
          // Each day has 1 day
          periodLabels.forEach(day => {
            periodData[day].totalDays = 1 * roomsCount;
          });
        }

        // Convert to array format for the chart
        const metricsData = periodLabels.map((label) => {
          const periodMetrics = periodData[label];
          const occupancyRate = periodMetrics.totalDays > 0 
            ? (periodMetrics.occupiedDays / periodMetrics.totalDays) * 100 
            : 0;
          const averageStay = periodMetrics.bookingsCount > 0 
            ? periodMetrics.totalStayDays / periodMetrics.bookingsCount 
            : 0;

          return {
            month: label, // We'll keep the property name as 'month' for compatibility
            occupancyRate: Math.round(occupancyRate),
            revenue: Math.round(periodMetrics.revenue),
            bookingsCount: periodMetrics.bookingsCount,
            averageStay: Math.round(averageStay * 10) / 10, // One decimal place
          };
        });

        setData(metricsData);
      } catch (err) {
        console.error("Error fetching dashboard metrics:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch dashboard metrics"));
        
        toast({
          title: "Failed to load dashboard data",
          description: "Using fallback sample data instead",
          variant: "destructive",
        });

        // Fallback to sample data
        setData([
          { month: "Jan", occupancyRate: 65, revenue: 12400, bookingsCount: 32, averageStay: 3.2 },
          { month: "Feb", occupancyRate: 72, revenue: 15200, bookingsCount: 38, averageStay: 3.5 },
          { month: "Mar", occupancyRate: 80, revenue: 18600, bookingsCount: 45, averageStay: 3.8 },
          { month: "Apr", occupancyRate: 87, revenue: 21400, bookingsCount: 52, averageStay: 4.0 },
          { month: "May", occupancyRate: 74, revenue: 16800, bookingsCount: 41, averageStay: 3.6 },
          { month: "Jun", occupancyRate: 68, revenue: 14500, bookingsCount: 36, averageStay: 3.4 },
          { month: "Jul", occupancyRate: 78, revenue: 17900, bookingsCount: 44, averageStay: 3.7 },
          { month: "Aug", occupancyRate: 82, revenue: 19300, bookingsCount: 48, averageStay: 3.9 },
          { month: "Sep", occupancyRate: 76, revenue: 16700, bookingsCount: 42, averageStay: 3.6 },
          { month: "Oct", occupancyRate: 84, revenue: 20100, bookingsCount: 50, averageStay: 4.1 },
          { month: "Nov", occupancyRate: 70, revenue: 15800, bookingsCount: 39, averageStay: 3.5 },
          { month: "Dec", occupancyRate: 92, revenue: 24600, bookingsCount: 58, averageStay: 4.3 },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [filters, supabase, toast, period]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (data.length === 0) return null;
    
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const averageOccupancy = data.reduce((sum, item) => sum + item.occupancyRate, 0) / data.length;
    const totalBookings = data.reduce((sum, item) => sum + item.bookingsCount, 0);
    
    return {
      totalRevenue,
      averageOccupancy: Math.round(averageOccupancy),
      totalBookings
    };
  }, [data]);

  return { data, isLoading, error, summary };
}