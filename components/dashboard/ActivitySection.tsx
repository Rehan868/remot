"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TodayCheckins } from "./TodayCheckins"
import { TodayCheckouts } from "./TodayCheckouts"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { logError } from "@/lib/debug-utils"

export function ActivitySection() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [checkinsData, setCheckinsData] = useState<any[]>([])
  const [checkoutsData, setCheckoutsData] = useState<any[]>([])

  const fetchActivityData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const today = new Date().toISOString().split("T")[0]

      // Fetch today's check-ins
      const { data: checkins, error: checkinsError } = await supabase
        .from("bookings")
        .select("*")
        .eq("check_in", today)
        .order("created_at", { ascending: false })

      if (checkinsError) throw new Error(`Error fetching check-ins: ${checkinsError.message}`)

      // Fetch today's check-outs
      const { data: checkouts, error: checkoutsError } = await supabase
        .from("bookings")
        .select("*")
        .eq("check_out", today)
        .order("created_at", { ascending: false })

      if (checkoutsError) throw new Error(`Error fetching check-outs: ${checkoutsError.message}`)

      setCheckinsData(checkins || [])
      setCheckoutsData(checkouts || [])
    } catch (err) {
      console.error("Error fetching activity data:", err)
      logError("ActivitySection", err)
      setError(err instanceof Error ? err : new Error("Unknown error fetching activity data"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivityData()

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(fetchActivityData, 5 * 60 * 1000)

    return () => clearInterval(refreshInterval)
  }, [])

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Today's Activity</CardTitle>
        {!isLoading && (
          <Button variant="outline" size="sm" onClick={fetchActivityData} className="h-8 px-2">
            Refresh
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mx-6 my-4">
            <AlertTitle>Error loading activity data</AlertTitle>
            <AlertDescription>
              {error.message}
              <Button variant="outline" size="sm" onClick={fetchActivityData} className="mt-2">
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TodayCheckins data={checkinsData} isLoading={false} />
            <TodayCheckouts data={checkoutsData} isLoading={false} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
