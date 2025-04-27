"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, PlusCircle } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRooms } from "@/hooks/use-rooms"
import { createOwner } from "@/hooks/use-owners"

type OwnerFormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  accountingInfo: {
    paymentMethod: string
    accountNumber: string
    bankName: string
    iban: string
    swift: string
  }
  taxInfo: {
    taxId: string
    taxResidence: string
  }
  notes: string
  birthdate?: Date
  citizenship: string
  password: string
  confirmPassword: string
}

export default function OwnerAddPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: roomsData, isLoading: isLoadingRooms } = useRooms()

  const [formData, setFormData] = useState<OwnerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    accountingInfo: {
      paymentMethod: "",
      accountNumber: "",
      bankName: "",
      iban: "",
      swift: "",
    },
    taxInfo: {
      taxId: "",
      taxResidence: "",
    },
    notes: "",
    citizenship: "",
    password: "",
    confirmPassword: "",
  })

  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [roomSearchQuery, setRoomSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Handle nested objects
    if (name.includes(".")) {
      const [parentKey, childKey] = name.split(".")
      if (parentKey === "accountingInfo") {
        setFormData({
          ...formData,
          accountingInfo: {
            ...formData.accountingInfo,
            [childKey]: value,
          },
        })
      } else if (parentKey === "taxInfo") {
        setFormData({
          ...formData,
          taxInfo: {
            ...formData.taxInfo,
            [childKey]: value,
          },
        })
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    // Handle nested objects
    if (name.includes(".")) {
      const [parentKey, childKey] = name.split(".")
      if (parentKey === "accountingInfo") {
        setFormData({
          ...formData,
          accountingInfo: {
            ...formData.accountingInfo,
            [childKey]: value,
          },
        })
      } else if (parentKey === "taxInfo") {
        setFormData({
          ...formData,
          taxInfo: {
            ...formData.taxInfo,
            [childKey]: value,
          },
        })
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData({
        ...formData,
        birthdate: date,
      })
    }
  }

  const getInitials = () => {
    return (formData.firstName.charAt(0) + formData.lastName.charAt(0)).toUpperCase() || "OW"
  }

  const fetchAvailableRooms = useCallback(() => {
    try {
      console.log("Fetching rooms from database...")

      if (!roomsData) {
        console.log("No rooms data available yet")
        setAvailableRooms([])
        return
      }

      // Filter rooms that don't have an owner assigned
      const unassignedRooms = roomsData.filter((room) => !room.owner_id)

      console.log("Unassigned rooms:", unassignedRooms)

      // Transform the data to match the expected format
      const transformedRooms = unassignedRooms.map((room) => ({
        id: room.id,
        number: room.number || "No Number",
        name: room.name || "Unnamed Room",
        property: room.property_name || "Unknown Property",
        property_id: room.property_id,
        type: room.type || "Standard",
        status: room.status || "available",
        rate: room.base_rate || 0,
      }))

      console.log("Transformed rooms:", transformedRooms)
      setAvailableRooms(transformedRooms)
    } catch (error) {
      console.error("Error fetching rooms:", error)
      toast({
        title: "Error",
        description: `Failed to load rooms: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    }
  }, [roomsData, toast])

  // Function to toggle room selection
  const toggleRoomSelection = (roomId: string) => {
    setSelectedRooms((prev) => (prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]))
  }

  useEffect(() => {
    // Fetch rooms when component mounts or roomsData changes
    fetchAvailableRooms()

    // Fix the selector to match our actual tab value
    const tabsElement = document.querySelector('[value="properties"]')
    if (tabsElement) {
      tabsElement.addEventListener("click", fetchAvailableRooms)
      return () => {
        tabsElement.removeEventListener("click", fetchAvailableRooms)
      }
    }
  }, [fetchAvailableRooms])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Create the owner in the database
      const result = await createOwner({
        ...formData,
        rooms: selectedRooms,
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to create owner")
      }

      toast({
        title: "Owner Added",
        description: `${formData.firstName} ${formData.lastName} has been added successfully with ${selectedRooms.length} room(s).`,
      })

      // Add an artificial delay for better UX
      setTimeout(() => {
        router.push("/owners")
      }, 1000)
    } catch (error) {
      console.error("Error creating owner:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create owner. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Owner</h1>
        <p className="text-muted-foreground mt-1">Create a new property owner profile</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="financial">Financial Info</TabsTrigger>
            <TabsTrigger value="properties">Rooms</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Enter the owner's personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name*</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name*</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address*</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="owner@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number*</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Birthdate</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.birthdate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.birthdate ? format(formData.birthdate, "PPP") : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.birthdate}
                            onSelect={handleDateChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="citizenship">Citizenship</Label>
                      <Select onValueChange={(value) => handleSelectChange("citizenship", value)}>
                        <SelectTrigger id="citizenship">
                          <SelectValue placeholder="Select citizenship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address*</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="city">City*</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province*</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip/Postal Code*</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="Zip code"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country*</Label>
                    <Select onValueChange={(value) => handleSelectChange("country", value)} required>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Additional notes about this owner"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password*</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password*</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Owner Preview</CardTitle>
                  <CardDescription>Preview of the owner profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-4">
                    <Avatar className="w-20 h-20 mb-4">
                      <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium text-lg">
                      {formData.firstName || "First"} {formData.lastName || "Last"}
                    </h3>
                    <p className="text-muted-foreground">{formData.email || "email@example.com"}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rooms:</span>
                      <span className="font-medium">{selectedRooms.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Revenue:</span>
                      <span className="font-medium">$0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Occupancy:</span>
                      <span className="font-medium">0%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-md">
                    <h4 className="font-medium text-blue-800 mb-2">Getting Started</h4>
                    <p className="text-sm text-blue-700">
                      After creating the owner, you'll be able to add rooms and manage their financial details.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Financial Information</CardTitle>
                  <CardDescription>Enter the owner's payment and tax details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountingInfo.paymentMethod">Payment Method*</Label>
                    <Select onValueChange={(value) => handleSelectChange("accountingInfo.paymentMethod", value)}>
                      <SelectTrigger id="accountingInfo.paymentMethod">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountingInfo.bankName">Bank Name</Label>
                    <Input
                      id="accountingInfo.bankName"
                      name="accountingInfo.bankName"
                      value={formData.accountingInfo.bankName}
                      onChange={handleInputChange}
                      placeholder="Enter bank name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountingInfo.accountNumber">Account Number</Label>
                      <Input
                        id="accountingInfo.accountNumber"
                        name="accountingInfo.accountNumber"
                        value={formData.accountingInfo.accountNumber}
                        onChange={handleInputChange}
                        placeholder="Enter account number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountingInfo.iban">IBAN</Label>
                      <Input
                        id="accountingInfo.iban"
                        name="accountingInfo.iban"
                        value={formData.accountingInfo.iban}
                        onChange={handleInputChange}
                        placeholder="Enter IBAN"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountingInfo.swift">SWIFT/BIC Code</Label>
                    <Input
                      id="accountingInfo.swift"
                      name="accountingInfo.swift"
                      value={formData.accountingInfo.swift}
                      onChange={handleInputChange}
                      placeholder="Enter SWIFT/BIC code"
                    />
                  </div>

                  <div className="pt-4 border-t mt-4">
                    <h3 className="font-medium mb-4">Tax Information</h3>

                    <div className="space-y-2">
                      <Label htmlFor="taxInfo.taxId">Tax ID / VAT Number</Label>
                      <Input
                        id="taxInfo.taxId"
                        name="taxInfo.taxId"
                        value={formData.taxInfo.taxId}
                        onChange={handleInputChange}
                        placeholder="Enter tax ID"
                      />
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="taxInfo.taxResidence">Tax Residence</Label>
                      <Select onValueChange={(value) => handleSelectChange("taxInfo.taxResidence", value)}>
                        <SelectTrigger id="taxInfo.taxResidence">
                          <SelectValue placeholder="Select tax residence" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-4">
                      <Label>Tax Documents</Label>
                      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center mt-2">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Drag and drop tax documents here, or click to browse
                          </p>
                        </div>
                        <Button type="button" variant="outline" className="mt-4">
                          Upload Documents
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Schedule</CardTitle>
                  <CardDescription>Set up how and when the owner gets paid</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-md">
                    <h4 className="font-medium text-blue-800 mb-2">Payment Information</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• All payments are processed on the 1st of each month</li>
                      <li>• Bank transfers typically take 2-3 business days</li>
                      <li>• Payment receipts are automatically emailed</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-md">
                    <h4 className="font-medium mb-2">Commission Structure</h4>
                    <p className="text-sm text-muted-foreground">
                      Our standard commission rate is 10% of booking revenue. Custom commission rates can be negotiated
                      for owners with multiple properties.
                    </p>
                  </div>

                  <div className="p-4 border rounded-md">
                    <h4 className="font-medium mb-2">Tax Withholding</h4>
                    <p className="text-sm text-muted-foreground">
                      Depending on the owner's tax residence, we may be required to withhold taxes on payments. Please
                      ensure all tax documents are uploaded.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Rooms</CardTitle>
                  <CardDescription>Assign rooms to this owner</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={fetchAvailableRooms}>
                  Refresh Rooms
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search rooms by name, number or property..."
                      value={roomSearchQuery}
                      onChange={(e) => setRoomSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                  </div>

                  {isLoadingRooms ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading available rooms...</p>
                    </div>
                  ) : availableRooms.length > 0 ? (
                    <div className="border rounded-md">
                      <div className="grid grid-cols-12 gap-2 p-3 border-b bg-muted/50 text-sm font-medium">
                        <div className="col-span-1"></div>
                        <div className="col-span-2">Room #</div>
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Property</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-1">Rate</div>
                      </div>
                      <div className="divide-y max-h-[400px] overflow-y-auto">
                        {availableRooms
                          .filter(
                            (room) =>
                              roomSearchQuery === "" ||
                              room.number.toLowerCase().includes(roomSearchQuery.toLowerCase()) ||
                              (room.name && room.name.toLowerCase().includes(roomSearchQuery.toLowerCase())) ||
                              room.property.toLowerCase().includes(roomSearchQuery.toLowerCase()),
                          )
                          .map((room) => (
                            <div key={room.id} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-muted/30">
                              <div className="col-span-1">
                                <input
                                  type="checkbox"
                                  id={`room-${room.id}`}
                                  checked={selectedRooms.includes(room.id)}
                                  onChange={() => toggleRoomSelection(room.id)}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                              </div>
                              <div className="col-span-2">{room.number}</div>
                              <div className="col-span-3">{room.name}</div>
                              <div className="col-span-3">{room.property}</div>
                              <div className="col-span-2">{room.type}</div>
                              <div className="col-span-1">${room.rate}/night</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="font-medium text-lg mb-2">No Rooms Available</h3>
                      <p className="text-muted-foreground mb-6">
                        We couldn't find any rooms in the database that can be assigned to this owner. This could be
                        because:
                      </p>
                      <ul className="list-disc text-left max-w-md mx-auto mb-6 text-muted-foreground">
                        <li className="mb-2">No rooms have been created yet</li>
                        <li className="mb-2">All existing rooms are already assigned to other owners</li>
                        <li className="mb-2">There might be a connection issue with the database</li>
                      </ul>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button type="button" variant="outline" onClick={fetchAvailableRooms}>
                          Try Again
                        </Button>
                        <Button type="button" variant="outline" asChild>
                          <Link href="/rooms/add">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add New Room
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedRooms.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-md mt-4">
                      <h4 className="font-medium text-blue-800 mb-2">Selected Rooms</h4>
                      <p className="text-sm text-blue-700">
                        {selectedRooms.length} room{selectedRooms.length > 1 ? "s" : ""} selected for this owner. These
                        rooms will appear in the owner's portal when they log in.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" asChild>
              <Link href="/owners">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="mr-2">Adding Owner...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                </>
              ) : (
                "Add Owner"
              )}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}
