"use client"

import type React from "react"

import { useState, type FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { DateRange } from "react-day-picker"
import { format, addDays } from "date-fns"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase"
import { useProperties } from "@/hooks/use-properties"
import { useRooms } from "@/hooks/use-rooms"
import { useFormat } from "@/hooks/use-format"
import { DateRangePicker } from "@/components/bookings/date-range-picker"

interface BookingFormData {
  reference: string
  guestName: string
  guestEmail: string
  guestPhone: string
  property: string
  roomNumber: string
  checkIn: Date
  checkOut: Date
  adults: number
  children: number
  baseRate: number
  totalAmount: number
  amountPaid: number
  remainingAmount: number
  securityDeposit: number
  commission: number
  tourismFee: number
  vat: number
  netToOwner: number
  notes: string
  status: string
  paymentStatus: string
  sendConfirmation: boolean
  guestDocument?: File | null
}

interface AddEditBookingFormProps {
  mode: "add" | "edit"
  bookingData?: Partial<BookingFormData>
  bookingId?: string
}

export function AddEditBookingForm({ mode, bookingData, bookingId }: AddEditBookingFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { formatCurrency, getDefaultCheckInTime, getDefaultCheckOutTime, getTaxRate } = useFormat()

  // Create a default data object
  const emptyDefaultData: BookingFormData = {
    reference: `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    property: "",
    roomNumber: "",
    checkIn: new Date(),
    checkOut: addDays(new Date(), 3),
    adults: 2,
    children: 0,
    baseRate: 0,
    totalAmount: 0,
    amountPaid: 0,
    remainingAmount: 0,
    securityDeposit: 0,
    commission: 0,
    tourismFee: 0,
    vat: 0,
    netToOwner: 0,
    notes: "",
    status: "confirmed",
    paymentStatus: "pending",
    sendConfirmation: true,
    guestDocument: null,
  }

  // Initialize form data with empty values
  const [formData, setFormData] = useState<BookingFormData>(emptyDefaultData)

  // Initialize date range
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 3),
  })

  // Update form data when bookingData changes
  useEffect(() => {
    if (bookingData && mode === "edit") {
      console.log("Setting form data from bookingData:", bookingData)

      // Create a merged object with all required fields
      const mergedData = {
        ...emptyDefaultData,
        ...bookingData,
      }

      setFormData(mergedData)

      // Also update the date range
      if (bookingData.checkIn && bookingData.checkOut) {
        setDateRange({
          from: bookingData.checkIn,
          to: bookingData.checkOut,
        })
      }
    }
  }, [bookingData, mode])

  // Get properties and rooms data
  const { data: propertiesData, isLoading: propertiesLoading } = useProperties()
  const { data: roomsData, isLoading: roomsLoading } = useRooms()

  useEffect(() => {
    console.log("AddEditBookingForm mounted")
    console.log("Mode:", mode)
    console.log("BookingId:", bookingId)
    console.log("BookingData:", bookingData)
    console.log("Current formData:", formData)

    // Debug Supabase connection
    const checkSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from("bookings").select("count").limit(1)
        if (error) {
          console.error("Supabase connection error:", error)
        } else {
          console.log("Supabase connection successful")
        }
      } catch (err) {
        console.error("Error checking Supabase connection:", err)
      }
    }

    checkSupabaseConnection()

    return () => console.log("AddEditBookingForm unmounted")
  }, [])

  // Replace hardcoded check-in time
  const defaultCheckInTime = getDefaultCheckInTime()

  // Replace hardcoded check-out time
  const defaultCheckOutTime = getDefaultCheckOutTime()

  // Replace hardcoded tax rate
  const taxRate = getTaxRate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        guestDocument: e.target.files![0],
      }))
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      sendConfirmation: checked,
    })
  }

  const handleDateRangeChange = (range: DateRange) => {
    if (range.from) {
      setDateRange(range)
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          checkIn: range.from!,
          checkOut: range.to || range.from,
        }

        if (range.to) {
          const nights = Math.round((range.to.getTime() - range.from!.getTime()) / (1000 * 60 * 60 * 24))
          const totalAmount = prev.baseRate * nights
          const vat = totalAmount * taxRate
          const tourismFee = totalAmount * 0.03
          const commission = totalAmount * 0.1
          const netToOwner = totalAmount - vat - tourismFee - commission

          return {
            ...updatedData,
            totalAmount,
            vat,
            tourismFee,
            commission,
            netToOwner,
          }
        }

        return updatedData
      })
    }
  }

  const getNumberOfNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0
    const msPerDay = 1000 * 60 * 60 * 24
    return Math.round(Math.abs(formData.checkOut.getTime() - formData.checkIn.getTime()) / msPerDay)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Generate a new reference if we're adding a new booking
      let currentReference = formData.reference
      if (mode === "add") {
        currentReference = `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`
        setFormData((prev) => ({ ...prev, reference: currentReference }))
      }

      // Prepare the booking data for Supabase
      const bookingRecord = {
        booking_number: currentReference,
        guest_name: formData.guestName,
        guest_email: formData.guestEmail,
        guest_phone: formData.guestPhone,
        property: formData.property,
        room_number: formData.roomNumber,
        check_in: formData.checkIn.toISOString().split("T")[0],
        check_out: formData.checkOut.toISOString().split("T")[0],
        adults: formData.adults,
        children: formData.children,
        base_rate: formData.baseRate,
        amount: formData.totalAmount,
        amount_paid: formData.amountPaid,
        remaining_amount: formData.remainingAmount,
        security_deposit: formData.securityDeposit,
        commission: formData.commission,
        tourism_fee: formData.tourismFee,
        vat: formData.vat,
        net_to_owner: formData.netToOwner,
        notes: formData.notes,
        status: formData.status,
        payment_status: formData.paymentStatus,
      }

      console.log("Submitting booking data:", bookingRecord)

      let result
      if (mode === "add") {
        // Insert new booking
        result = await supabase.from("bookings").insert([bookingRecord]).select()
      } else if (mode === "edit" && bookingId) {
        // Update existing booking
        result = await supabase.from("bookings").update(bookingRecord).eq("id", bookingId).select()
      }

      if (result?.error) {
        throw result.error
      }

      // Handle file upload if there's a guest document
      if (formData.guestDocument && result?.data?.[0]?.id) {
        const fileExt = formData.guestDocument.name.split(".").pop()
        const fileName = `${result.data[0].id}-${Date.now()}.${fileExt}`
        const filePath = `guest-documents/${fileName}`

        const { error: uploadError } = await supabase.storage.from("bookings").upload(filePath, formData.guestDocument)

        if (uploadError) {
          console.error("Error uploading document:", uploadError)
          // Continue anyway, just log the error
        } else {
          // Update the booking with the document path
          await supabase.from("bookings").update({ guest_document: filePath }).eq("id", result.data[0].id)
        }
      }

      // Send confirmation email if requested
      if (formData.sendConfirmation && formData.guestEmail) {
        // This would be implemented with a server action or API route
        console.log("Sending confirmation email to:", formData.guestEmail)
      }

      toast({
        title: mode === "add" ? "Booking Created" : "Booking Updated",
        description: `The booking for ${formData.guestName} has been ${
          mode === "add" ? "created" : "updated"
        } successfully.`,
      })

      // Redirect to bookings list
      router.push("/bookings")
      router.refresh()
    } catch (error) {
      console.error("Error saving booking:", error)
      setError(`Failed to ${mode === "add" ? "create" : "update"} booking: ${(error as Error).message}`)
      toast({
        title: "Error",
        description: `Failed to ${mode === "add" ? "create" : "update"} booking. ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset date range when property or room changes
  useEffect(() => {
    if (mode === "add") {
      setDateRange({
        from: new Date(),
        to: addDays(new Date(), 3),
      })
    }
  }, [formData.property, formData.roomNumber, mode])

  const calculatedTotal = formData.totalAmount + formData.securityDeposit

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{mode === "add" ? "Add New Booking" : "Edit Booking"}</h1>
        <p className="text-muted-foreground mt-1">
          {mode === "add" ? "Create a new booking" : `Edit booking ${formData.reference}`}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
              <CardDescription>Enter the guest's details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reference">Booking Reference</Label>
                  <Input
                    id="reference"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Booking Status</Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="checked-in">Checked In</SelectItem>
                      <SelectItem value="checked-out">Checked Out</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestName">Guest Name*</Label>
                <Input
                  id="guestName"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleInputChange}
                  placeholder="Enter guest's full name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestEmail">Email Address</Label>
                  <Input
                    id="guestEmail"
                    name="guestEmail"
                    type="email"
                    value={formData.guestEmail}
                    onChange={handleInputChange}
                    placeholder="guest@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestPhone">Phone Number</Label>
                  <Input
                    id="guestPhone"
                    name="guestPhone"
                    value={formData.guestPhone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestDocument">Guest ID/Passport</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="guestDocument"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {formData.guestDocument && (
                    <p className="text-sm text-muted-foreground">{formData.guestDocument.name}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
              <CardDescription>Overview of the current booking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
                  <div className="font-medium text-blue-800">Stay Information</div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>Check-in</div>
                    <div className="text-right font-medium">
                      {formData.checkIn ? format(formData.checkIn, "MMM dd, yyyy") : "Not set"}
                    </div>
                    <div>Check-out</div>
                    <div className="text-right font-medium">
                      {formData.checkOut ? format(formData.checkOut, "MMM dd, yyyy") : "Not set"}
                    </div>
                    <div>Nights</div>
                    <div className="text-right font-medium">{getNumberOfNights()}</div>
                    <div>Guests</div>
                    <div className="text-right font-medium">
                      {formData.adults + formData.children} ({formData.adults} adults, {formData.children} children)
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Base Rate:</span>
                    <span>{formatCurrency(formData.baseRate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Nights:</span>
                    <span>× {getNumberOfNights()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(formData.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Security Deposit:</span>
                    <span>{formatCurrency(formData.securityDeposit)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Grand Total:</span>
                    <p className="text-lg font-semibold">{formatCurrency(calculatedTotal)}</p>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Payment Status:</span>
                    <Select
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}
                    >
                      <SelectTrigger className="h-7 w-24">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="sendConfirmation"
                  checked={formData.sendConfirmation}
                  onCheckedChange={handleCheckboxChange}
                />
                <label
                  htmlFor="sendConfirmation"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Send confirmation email to guest
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>Enter the booking details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property">Property*</Label>
                  <Select
                    name="property"
                    value={formData.property}
                    onValueChange={(value) => {
                      // Update the property and reset the room selection
                      setFormData((prev) => ({
                        ...prev,
                        property: value,
                        roomNumber: "", // Reset room selection when property changes
                      }))
                    }}
                    required
                  >
                    <SelectTrigger id="property" className={isSubmitting ? "opacity-50" : ""}>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Fetch properties from database with null check */}
                      {propertiesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading properties...
                        </SelectItem>
                      ) : propertiesData && propertiesData.length > 0 ? (
                        propertiesData.map((property) => (
                          <SelectItem key={property.id} value={property.name}>
                            {property.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No properties available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number*</Label>
                  <Select
                    name="roomNumber"
                    value={formData.roomNumber}
                    onValueChange={(value) => setFormData({ ...formData, roomNumber: value })}
                    required
                    disabled={!formData.property || isSubmitting}
                  >
                    <SelectTrigger id="roomNumber" className={!formData.property || isSubmitting ? "opacity-50" : ""}>
                      <SelectValue placeholder={!formData.property ? "Select property first" : "Select room"} />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Filter rooms by selected property with null check */}
                      {roomsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading rooms...
                        </SelectItem>
                      ) : !formData.property ? (
                        <SelectItem value="none" disabled>
                          Select a property first
                        </SelectItem>
                      ) : roomsData && roomsData.length > 0 ? (
                        roomsData
                          .filter((room) => room.property_name === formData.property)
                          .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
                          .map((room) => (
                            <SelectItem key={room.id} value={room.number}>
                              {room.number} - {room.type} {room.name ? `(${room.name})` : ""}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No rooms available for this property
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Booking Dates*</Label>
                <DateRangePicker
                  propertyName={formData.property}
                  roomNumber={formData.roomNumber}
                  currentBookingId={bookingId}
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adults">Adults*</Label>
                  <Input
                    id="adults"
                    name="adults"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.adults}
                    onChange={handleNumberChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="children">Children</Label>
                  <Input
                    id="children"
                    name="children"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.children}
                    onChange={handleNumberChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
              <CardDescription>Breakdown of costs and fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseRate">Base Rate (per night)*</Label>
                <Input
                  id="baseRate"
                  name="baseRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.baseRate}
                  onChange={handleNumberChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount*</Label>
                <Input
                  id="totalAmount"
                  name="totalAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={handleNumberChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amountPaid">Amount Paid*</Label>
                <Input
                  id="amountPaid"
                  name="amountPaid"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amountPaid}
                  onChange={handleNumberChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remainingAmount">Remaining Amount*</Label>
                <Input
                  id="remainingAmount"
                  name="remainingAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.remainingAmount}
                  onChange={handleNumberChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission">Commission*</Label>
                <Input
                  id="commission"
                  name="commission"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.commission}
                  onChange={handleNumberChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tourismFee">Tourism Fee*</Label>
                <Input
                  id="tourismFee"
                  name="tourismFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.tourismFee}
                  onChange={handleNumberChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vat">VAT*</Label>
                <Input
                  id="vat"
                  name="vat"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.vat}
                  onChange={handleNumberChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="netToOwner">Net To Owner*</Label>
                <Input
                  id="netToOwner"
                  name="netToOwner"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.netToOwner}
                  onChange={handleNumberChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="securityDeposit">Security Deposit</Label>
                <Input
                  id="securityDeposit"
                  name="securityDeposit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.securityDeposit}
                  onChange={handleNumberChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Add any additional notes or special requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter any special requests or notes about this booking"
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-3 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/bookings")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "add" ? "Creating..." : "Updating..."}
                </>
              ) : (
                <>{mode === "add" ? "Create Booking" : "Update Booking"}</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
