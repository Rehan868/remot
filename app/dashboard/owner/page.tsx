"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BedDouble, CalendarCheck, DollarSign, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OwnerDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated as owner
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (!userType || userType !== "owner") {
      router.push("/login/owner")
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Mock data for the dashboard
  const ownerData = {
    availableRooms: 5,
    totalRooms: 8,
    checkins: 2,
    checkouts: 1,
    occupancyRate: "62%",
    revenue: "$3,240",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your properties and monitor performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            <CardDescription>Out of {ownerData.totalRooms} total rooms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ownerData.availableRooms}</div>
            <p className="text-xs text-muted-foreground">+1 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
            <CardDescription>Both are arriving in the morning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ownerData.checkins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-outs</CardTitle>
            <CardDescription>Scheduled before noon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ownerData.checkouts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ownerData.occupancyRate}</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ownerData.revenue}</div>
            <p className="text-xs text-muted-foreground">+$420 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild className="h-auto py-2 justify-start">
                <Link href="/owner/bookings">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Bookings
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto py-2 justify-start">
                <Link href="/owner/availability">
                  <CalendarCheck className="h-4 w-4 mr-2" />
                  Check Availability
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto py-2 justify-start">
                <Link href="/owner/cleaning">
                  <BedDouble className="h-4 w-4 mr-2" />
                  Cleaning Status
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto py-2 justify-start">
                <Link href="/owner/reports">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
