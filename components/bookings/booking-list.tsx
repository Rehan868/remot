"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar, CheckCircle, Clock, Edit, Eye, Loader2, MoreHorizontal, Trash2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ViewToggle } from "@/components/ui/view-toggle"
import { useFilteredBookings } from "@/hooks/use-bookings"
import { useToast } from "@/hooks/use-toast"
import { useFormat } from "@/hooks/use-format"
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
import { deleteBookingAction } from "@/app/actions/booking-actions"

interface BookingListProps {
  view: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
  searchQuery: string
  filterValue: string
  dateRange: any
}

export function BookingList({ view, onViewChange, searchQuery, filterValue, dateRange }: BookingListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { formatCurrency } = useFormat()
  const { data: bookings, isLoading, error, refetch } = useFilteredBookings(searchQuery, filterValue, dateRange)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    // Refetch bookings when search, filter, or date range changes
    refetch()
  }, [searchQuery, filterValue, dateRange, refetch])

  const handleDelete = async (id: string) => {
    setBookingToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!bookingToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteBookingAction(bookingToDelete)

      if (result.success) {
        toast({
          title: "Booking deleted",
          description: "The booking has been successfully deleted.",
        })
        refetch() // Refresh the list
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
      setBookingToDelete(null)
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
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "checked-in":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "checked-out":
        return <Calendar className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading bookings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6" role="alert">
        <p className="font-bold">Error</p>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No bookings found</h3>
        <p className="text-muted-foreground mt-1">
          {searchQuery || filterValue || (dateRange && dateRange.from)
            ? "Try adjusting your search or filters"
            : "Get started by creating a new booking"}
        </p>
        <Button className="mt-4" asChild>
          <Link href="/bookings/new">Create New Booking</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <ViewToggle view={view} onViewChange={onViewChange} />
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{booking.guest_name}</CardTitle>
                    <CardDescription>{booking.booking_number}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/bookings/${booking.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/bookings/edit/${booking.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Booking
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(booking.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Booking
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Property:</div>
                  <div className="font-medium text-right">{booking.property}</div>
                  <div className="text-muted-foreground">Room:</div>
                  <div className="font-medium text-right">{booking.room_number}</div>
                  <div className="text-muted-foreground">Check-in:</div>
                  <div className="font-medium text-right">{format(new Date(booking.check_in), "MMM dd, yyyy")}</div>
                  <div className="text-muted-foreground">Check-out:</div>
                  <div className="font-medium text-right">{format(new Date(booking.check_out), "MMM dd, yyyy")}</div>
                  <div className="text-muted-foreground">Amount:</div>
                  <div className="font-medium text-right">{formatCurrency(booking.amount)}</div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                  <div className="flex items-center">
                    {getStatusIcon(booking.status)}
                    <span className="ml-1 capitalize">{booking.status}</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(booking.payment_status)}`}>
                  <span className="capitalize">{booking.payment_status}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Guest</th>
                <th className="text-left py-3 px-4">Booking #</th>
                <th className="text-left py-3 px-4">Room</th>
                <th className="text-left py-3 px-4">Check-in</th>
                <th className="text-left py-3 px-4">Check-out</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Payment</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                >
                  <td className="py-3 px-4">{booking.guest_name}</td>
                  <td className="py-3 px-4">{booking.booking_number}</td>
                  <td className="py-3 px-4">
                    {booking.property} - {booking.room_number}
                  </td>
                  <td className="py-3 px-4">{format(new Date(booking.check_in), "MMM dd, yyyy")}</td>
                  <td className="py-3 px-4">{format(new Date(booking.check_out), "MMM dd, yyyy")}</td>
                  <td className="py-3 px-4">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(
                        booking.status,
                      )}`}
                    >
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 capitalize">{booking.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(
                        booking.payment_status,
                      )}`}
                    >
                      <span className="capitalize">{booking.payment_status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{formatCurrency(booking.amount)}</td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/bookings/${booking.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/bookings/edit/${booking.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Booking
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(booking.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
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
    </>
  )
}
