"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileEdit, Building, Percent, Phone, Mail, MapPin } from "lucide-react"
import { useOwner } from "@/hooks/use-owners"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { OwnerRoomsList } from "@/components/owners/owner-rooms-list"
import { OwnerBookingsList } from "@/components/owners/owner-bookings-list"

export default function OwnerViewPage() {
  const params = useParams()
  const id = params?.id as string
  const { data: owner, isLoading, error } = useOwner(id || "")

  // Update the getInitials function to handle undefined names
  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return "??"
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/owners">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Owners
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Owner Profile</h1>
              <p className="text-muted-foreground mt-1">Loading owner information...</p>
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !owner) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-2xl font-bold text-destructive">Error Loading Owner</h2>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Owner information could not be loaded"}
        </p>
        <Button asChild>
          <Link href="/owners">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Owners List
          </Link>
        </Button>
      </div>
    )
  }

  // Calculate properties count from rooms array
  const propertiesCount = owner.rooms?.length || 0

  // Default values for missing data
  const occupancyRate = 85 // Default occupancy rate
  const revenue = 25000 // Default revenue
  const joinedDate = owner.created_at || new Date().toISOString()

  // Get accounting info
  const bankName = owner.accountingInfo?.bankName || "Not provided"

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="mr-4">
            <Link href="/owners">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Owners
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Owner Profile</h1>
            <p className="text-muted-foreground mt-1">View owner information</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/owners/edit/${owner.id}`}>
            <FileEdit className="h-4 w-4 mr-2" />
            Edit Owner
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={undefined || "/placeholder.svg"} />
                <AvatarFallback>{getInitials(owner.firstName, owner.lastName)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold">{`${owner.firstName} ${owner.lastName}`}</h2>
                <p className="text-muted-foreground">{owner.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Properties</p>
                <div className="flex items-center gap-2 mt-1">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{propertiesCount} Properties</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Occupancy</p>
                <div className="flex items-center gap-2 mt-1">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <span>{occupancyRate}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{owner.phone || "Not provided"}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{owner.email}</span>
                </div>
              </div>
              {owner.address && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {[owner.address, owner.city, owner.state, owner.zipCode, owner.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue (YTD)</p>
              <p className="font-medium">{formatCurrency(revenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Number</p>
              <p className="font-medium">{owner.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Details</p>
              <p className="font-medium">{bankName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Joined Date</p>
              <p className="font-medium">{formatDate(joinedDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <Badge variant="outline" className="mt-1">
                Up to date
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <OwnerRoomsList ownerId={owner.id} />
      <OwnerBookingsList ownerId={owner.id} />
    </div>
  )
}
