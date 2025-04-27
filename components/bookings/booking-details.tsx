"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Trash2,
  User,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { useFormat } from "@/hooks/use-format"
import { deleteBookingAction } from "@/app/actions/booking-actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Booking } from "@/hooks/use-bookings"

interface BookingDetailsProps {
  booking: Booking | null
  isLoading: boolean
  error: Error | null
}

export function BookingDetails({ booking, isLoading, error }: BookingDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { formatCurrency } = useFormat()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!booking) return

    setIsDeleting(true)
    try {
      const result = await deleteBookingAction(booking.id)

      if (result.success) {
        toast({
          title: "Booking deleted",
          description: "The booking has been successfully deleted.",
        })
        router.push("/bookings")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete booking: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "checked-in":
        return "bg-blue-100 text-blue-800"
      case "checked-out":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "partial":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "refunded":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "checked-in":
        return <Calendar className="h-5 w-5 text-blue-600" />
      case "checked-out":
        return <Calendar className="h-5 w-5 text-gray-600" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6" role="alert">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p className="font-bold">Error loading booking</p>
        </div>
        <p className="mt-1">{error.message}</p>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/bookings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Booking not found</h3>
        <p className="text-muted-foreground mt-1">The booking you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-4" asChild>
          <Link href="/bookings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Link>
        </Button>
      </div>
    )
  }

  const checkInDate = new Date(booking.check_in)
  const checkOutDate = new Date(booking.check_out)
  const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild className="h-8 w-8">
              <Link href="/bookings">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Booking Details</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Booking #{booking.booking_number} for {booking.guest_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/bookings/edit/${booking.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Booking
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
            <CardDescription>Details about this booking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${getStatusColor(booking.status)}`}>
                  {getStatusIcon(booking.status)}
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-lg font-semibold capitalize">{booking.status}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Payment Status</p>
                <div
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                    booking.payment_status,
                  )}`}
                >
                  {booking.payment_status}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Guest Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{booking.guest_name}</p>
                      <p className="text-sm text-muted-foreground">Guest Name</p>
                    </div>
                  </div>
                  {booking.guest_email && (
                    <div className="flex items-start gap-2">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{booking.guest_email}</p>
                        <p className="text-sm text-muted-foreground">Email</p>
                      </div>
                    </div>
                  )}
                  {booking.guest_phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{booking.guest_phone}</p>
                        <p className="text-sm text-muted-foreground">Phone</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Stay Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {booking.property} - Room {booking.room_number}
                      </p>
                      <p className="text-sm text-muted-foreground">Property & Room</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {format(checkInDate, "MMM dd, yyyy")} - {format(checkOutDate, "MMM dd, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {nights} {nights === 1 ? "night" : "nights"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {booking.adults} {booking.adults === 1 ? "adult" : "adults"}
                        {booking.children > 0 &&
                          `, ${booking.children} ${booking.children === 1 ? "child" : "children"}`}
                      </p>
                      <p className="text-sm text-muted-foreground">Guests</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {booking.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Notes</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{booking.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Breakdown of costs and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
                <div className="font-medium text-blue-800">Payment Information</div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>Base Rate</div>
                  <div className="text-right font-medium">{formatCurrency(booking.base_rate)}</div>
                  <div>Nights</div>
                  <div className="text-right font-medium">{nights}</div>
                  <div>Total Amount</div>
                  <div className="text-right font-medium">{formatCurrency(booking.amount)}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(booking.amount_paid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Remaining Amount:</span>
                  <span>{formatCurrency(booking.remaining_amount)}</span>
                </div>
                {booking.security_deposit > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Security Deposit:</span>
                    <span>{formatCurrency(booking.security_deposit)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Commission:</span>
                  <span>{formatCurrency(booking.commission)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tourism Fee:</span>
                  <span>{formatCurrency(booking.tourism_fee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT:</span>
                  <span>{formatCurrency(booking.vat)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Net to Owner:</span>
                  <span>{formatCurrency(booking.net_to_owner)}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              Created: {format(new Date(booking.created_at), "MMM dd, yyyy")}
            </div>
            {booking.created_at !== booking.updated_at && (
              <div className="text-sm text-muted-foreground">
                Updated: {format(new Date(booking.updated_at), "MMM dd, yyyy")}
              </div>
            )}
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this booking. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
