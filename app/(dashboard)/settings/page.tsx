"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProperties, saveProperty, type PropertyInput } from "@/hooks/use-properties"
import { useRoomTypes, saveRoomType, type RoomTypeInput } from "@/hooks/use-room-types"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, ArrowRight, Building2, Globe, Lock, Mail, Save, User, Users, Plus, Loader } from "lucide-react"
import Link from "next/link"
import { useRoles, deleteRole } from "@/hooks/use-roles"
import { useSettings } from "@/contexts/settings-context"
import { updateSettings } from "@/app/actions/settings-actions"

export default function SettingsPage() {
  const {
    data: properties,
    isLoading: propertiesLoading,
    error: propertiesError,
    refetch: refetchProperties,
  } = useProperties()
  const {
    data: roomTypes,
    isLoading: roomTypesLoading,
    error: roomTypesError,
    refetch: refetchRoomTypes,
  } = useRoomTypes()

  const [newProperty, setNewProperty] = useState<PropertyInput>({
    name: "",
    address: "",
    city: "",
    country: "",
  })

  const [newRoomType, setNewRoomType] = useState<RoomTypeInput>({
    name: "",
    baseRate: 0,
    maxOccupancy: 0,
    description: "",
  })

  const [isSavingProperty, setIsSavingProperty] = useState(false)
  const [isSavingRoomType, setIsSavingRoomType] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProperty(true)

    try {
      await saveProperty(newProperty)
      setNewProperty({
        name: "",
        address: "",
        city: "",
        country: "",
      })
      refetchProperties()
    } catch (error) {
      console.error("Error saving property:", error)
    } finally {
      setIsSavingProperty(false)
    }
  }

  const handleAddRoomType = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingRoomType(true)

    try {
      await saveRoomType(newRoomType)
      setNewRoomType({
        name: "",
        baseRate: 0,
        maxOccupancy: 0,
        description: "",
      })
      refetchRoomTypes()
    } catch (error) {
      console.error("Error saving room type:", error)
    } finally {
      setIsSavingRoomType(false)
    }
  }

  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")
  const { settings, isLoading: settingsLoading, error: settingsError, refreshSettings, setSettings } = useSettings()

  // Form states for general settings
  const [companyName, setCompanyName] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [dateFormat, setDateFormat] = useState("")
  const [currencyFormat, setCurrencyFormat] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [autoCheckout, setAutoCheckout] = useState(true)
  const [defaultCheckInTime, setDefaultCheckInTime] = useState("")
  const [defaultCheckOutTime, setDefaultCheckOutTime] = useState("")
  const [taxRate, setTaxRate] = useState("")
  const [reminderDays, setReminderDays] = useState("")

  // Form states for notification settings
  const [bookingConfirmation, setBookingConfirmation] = useState(true)
  const [checkInReminder, setCheckInReminder] = useState(true)
  const [checkOutReminder, setCheckOutReminder] = useState(true)
  const [postStayThankYou, setPostStayThankYou] = useState(true)
  const [cancellationNotice, setCancellationNotice] = useState(true)
  const [staffNotifications, setStaffNotifications] = useState(true)

  const { data: roles, isLoading: rolesLoading, error: rolesError, refetch: refetchRoles } = useRoles()

  const [selectedProperty, setSelectedProperty] = useState<any | null>(null)
  const [selectedRoomType, setSelectedRoomType] = useState<any | null>(null)
  const [showPropertyDialog, setShowPropertyDialog] = useState(false)
  const [showRoomTypeDialog, setShowRoomTypeDialog] = useState(false)
  const [propertyForm, setPropertyForm] = useState({ name: "", address: "" })
  const [roomTypeForm, setRoomTypeForm] = useState({ name: "", baseRate: "", maxOccupancy: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load settings into form state when they're fetched
  useEffect(() => {
    if (settings) {
      console.log("Settings loaded:", settings)
      setCompanyName(settings.company_name || "")
      setCompanyEmail(settings.company_email || "")
      setDateFormat(settings.date_format || "MM/DD/YYYY")
      setCurrencyFormat(settings.currency_format || "USD")
      setEmailNotifications(settings.email_notifications || false)
      setAutoCheckout(settings.auto_checkout || false)
      setDefaultCheckInTime(settings.default_check_in_time || "14:00")
      setDefaultCheckOutTime(settings.default_check_out_time || "11:00")
      setTaxRate(settings.tax_rate || "8.5")
      setReminderDays(settings.reminder_days || "2")

      setBookingConfirmation(settings.booking_confirmation || false)
      setCheckInReminder(settings.check_in_reminder || false)
      setCheckOutReminder(settings.check_out_reminder || false)
      setPostStayThankYou(settings.post_stay_thank_you || false)
      setCancellationNotice(settings.cancellation_notice || false)
      setStaffNotifications(settings.staff_notifications || false)
    }
  }, [settings])

  // Update the handleSaveGeneral function to handle refreshing server-side cache 
  const handleSaveGeneral = async () => {
    try {
      setIsSavingSettings(true)
      console.log("Saving general settings...")

      const settingsToUpdate = [
        { key: "company_name", value: companyName },
        { key: "company_email", value: companyEmail },
        { key: "date_format", value: dateFormat },
        { key: "currency_format", value: currencyFormat },
        { key: "email_notifications", value: emailNotifications.toString() },
        { key: "auto_checkout", value: autoCheckout.toString() },
        { key: "default_check_in_time", value: defaultCheckInTime },
        { key: "default_check_out_time", value: defaultCheckOutTime },
        { key: "tax_rate", value: taxRate },
        { key: "reminder_days", value: reminderDays },
      ]

      console.log("Settings to update:", settingsToUpdate)

      const result = await updateSettings(settingsToUpdate)
      console.log("Update result:", result)

      if (!result.success) {
        throw new Error(result.message)
      }

      // Refresh both client and server settings
      await refreshSettings()

      // Also refresh server-side settings cache 
      try {
        // Import dynamically to avoid circular dependencies
        const { refreshSettingsCache } = await import('@/lib/format-utils')
        await refreshSettingsCache()
      } catch (error) {
        console.error("Failed to refresh server settings cache:", error)
      }

      toast({
        title: "Settings Saved",
        description: "Your general settings have been updated successfully.",
      })
    } catch (error: any) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Similarly update the handleSaveNotifications function to refresh server-side cache
  const handleSaveNotifications = async () => {
    try {
      setIsSavingSettings(true)

      const settingsToUpdate = [
        { key: "booking_confirmation", value: bookingConfirmation.toString() },
        { key: "check_in_reminder", value: checkInReminder.toString() },
        { key: "check_out_reminder", value: checkOutReminder.toString() },
        { key: "post_stay_thank_you", value: postStayThankYou.toString() },
        { key: "cancellation_notice", value: cancellationNotice.toString() },
        { key: "staff_notifications", value: staffNotifications.toString() },
      ]

      const result = await updateSettings(settingsToUpdate)

      if (!result.success) {
        throw new Error(result.message)
      }

      // Refresh both client and server settings
      await refreshSettings()

      // Also refresh server-side settings cache
      try {
        // Import dynamically to avoid circular dependencies
        const { refreshSettingsCache } = await import('@/lib/format-utils')
        await refreshSettingsCache()
      } catch (error) {
        console.error("Failed to refresh server settings cache:", error)
      }

      toast({
        title: "Notification Settings Saved",
        description: "Your notification preferences have been updated.",
      })
    } catch (error: any) {
      console.error("Error saving notification settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save notification settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleSaveProperty = () => {
    toast({
      title: "Property Settings Saved",
      description: "Your property settings have been updated successfully.",
    })
  }

  const handleSaveUsers = () => {
    toast({
      title: "User Settings Saved",
      description: "User access settings have been updated successfully.",
    })
  }

  const handleAddPropertyOld = async () => {
    if (!propertyForm.name || !propertyForm.address) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      await saveProperty({
        name: propertyForm.name,
        address: propertyForm.address,
        roomCount: 0,
      })

      setPropertyForm({ name: "", address: "" })
      setShowPropertyDialog(false)
      refetchProperties()

      toast({
        title: "Property Added",
        description: `${propertyForm.name} has been added successfully.`,
      })
    } catch (error) {
      console.error("Error adding property:", error)
      toast({
        title: "Error",
        description: "Failed to add property. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProperty = (property: any) => {
    setSelectedProperty(property)
    setPropertyForm({ name: property.name, address: property.address })
    setShowPropertyDialog(true)
  }

  const handleUpdateProperty = async () => {
    if (!selectedProperty || !propertyForm.name || !propertyForm.address) {
      return
    }

    try {
      setIsSubmitting(true)

      await saveProperty(
        {
          id: selectedProperty.id,
          name: propertyForm.name,
          address: propertyForm.address,
          roomCount: selectedProperty.roomCount,
        },
        true,
      )

      setPropertyForm({ name: "", address: "" })
      setSelectedProperty(null)
      setShowPropertyDialog(false)
      refetchProperties()

      toast({
        title: "Property Updated",
        description: `${propertyForm.name} has been updated successfully.`,
      })
    } catch (error) {
      console.error("Error updating property:", error)
      toast({
        title: "Error",
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddRoomTypeOld = async () => {
    if (!roomTypeForm.name || !roomTypeForm.baseRate || !roomTypeForm.maxOccupancy) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      await saveRoomType({
        name: roomTypeForm.name,
        baseRate: Number.parseFloat(roomTypeForm.baseRate),
        maxOccupancy: Number.parseInt(roomTypeForm.maxOccupancy),
      })

      setRoomTypeForm({ name: "", baseRate: "", maxOccupancy: "" })
      setShowRoomTypeDialog(false)
      refetchRoomTypes()

      toast({
        title: "Room Type Added",
        description: `${roomTypeForm.name} has been added successfully.`,
      })
    } catch (error) {
      console.error("Error adding room type:", error)
      toast({
        title: "Error",
        description: "Failed to add room type. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditRoomType = (roomType: any) => {
    setSelectedRoomType(roomType)
    setRoomTypeForm({
      name: roomType.name,
      baseRate: roomType.baseRate.toString(),
      maxOccupancy: roomType.maxOccupancy.toString(),
    })
    setShowRoomTypeDialog(true)
  }

  const handleUpdateRoomType = async () => {
    if (!selectedRoomType || !roomTypeForm.name || !roomTypeForm.baseRate || !roomTypeForm.maxOccupancy) {
      return
    }

    try {
      setIsSubmitting(true)

      await saveRoomType(
        {
          id: selectedRoomType.id,
          name: roomTypeForm.name,
          baseRate: Number.parseFloat(roomTypeForm.baseRate),
          maxOccupancy: Number.parseInt(roomTypeForm.maxOccupancy),
        },
        true,
      )

      setRoomTypeForm({ name: "", baseRate: "", maxOccupancy: "" })
      setSelectedRoomType(null)
      setShowRoomTypeDialog(false)
      refetchRoomTypes()

      toast({
        title: "Room Type Updated",
        description: `${roomTypeForm.name} has been updated successfully.`,
      })
    } catch (error) {
      console.error("Error updating room type:", error)
      toast({
        title: "Error",
        description: "Failed to update room type. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (settingsLoading && !settings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-medium">Loading Settings</h3>
          <p className="text-muted-foreground">Please wait while we load your settings...</p>
        </div>
      </div>
    )
  }

  if (settingsError && !settings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-700">Error Loading Settings</h3>
          <p className="text-muted-foreground mb-4">{settingsError}</p>
          <Button onClick={refreshSettings}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="bg-card border rounded-md p-1 bg-background/95 mb-6">
          <TabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 h-auto w-full">
            <TabsTrigger value="general" className="flex justify-start px-3 py-2 h-auto">
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>General</span>
                </div>
                <span className="text-xs text-muted-foreground">Basic settings</span>
              </div>
            </TabsTrigger>

            <TabsTrigger value="properties" className="flex justify-start px-3 py-2 h-auto">
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Properties</span>
                </div>
                <span className="text-xs text-muted-foreground">Location settings</span>
              </div>
            </TabsTrigger>

            <TabsTrigger value="room-types" className="flex justify-start px-3 py-2 h-auto">
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Room Types</span>
                </div>
                <span className="text-xs text-muted-foreground">Room settings</span>
              </div>
            </TabsTrigger>

            <TabsTrigger value="notifications" className="flex justify-start px-3 py-2 h-auto">
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Notifications</span>
                </div>
                <span className="text-xs text-muted-foreground">Email, SMS</span>
              </div>
            </TabsTrigger>

            <TabsTrigger value="users" className="flex justify-start px-3 py-2 h-auto">
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </div>
                <span className="text-xs text-muted-foreground">Access control</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="properties">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Property</CardTitle>
                <CardDescription>Add a new property to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProperty} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="property-name">Name</Label>
                    <Input
                      id="property-name"
                      value={newProperty.name}
                      onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property-address">Address</Label>
                    <Input
                      id="property-address"
                      value={newProperty.address}
                      onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property-city">City</Label>
                    <Input
                      id="property-city"
                      value={newProperty.city}
                      onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property-country">Country</Label>
                    <Input
                      id="property-country"
                      value={newProperty.country}
                      onChange={(e) => setNewProperty({ ...newProperty, country: e.target.value })}
                    />
                  </div>
                  <Button type="submit" disabled={isSavingProperty}>
                    {isSavingProperty ? (
                      <>
                        <Spinner className="mr-2" /> Saving...
                      </>
                    ) : (
                      "Add Property"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>Manage existing properties</CardDescription>
              </CardHeader>
              <CardContent>
                {propertiesLoading ? (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                ) : propertiesError ? (
                  <div className="text-red-500">Error loading properties</div>
                ) : properties && properties.length > 0 ? (
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <div key={property.id} className="border rounded-md p-4">
                        <h3 className="font-medium">{property.name}</h3>
                        <p className="text-sm text-muted-foreground">{property.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {property.city}
                          {property.city && property.country ? ", " : ""}
                          {property.country}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">No properties found</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="room-types">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Room Type</CardTitle>
                <CardDescription>Add a new room type to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddRoomType} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-type-name">Name</Label>
                    <Input
                      id="room-type-name"
                      value={newRoomType.name}
                      onChange={(e) => setNewRoomType({ ...newRoomType, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-type-base-rate">Base Rate</Label>
                    <Input
                      id="room-type-base-rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newRoomType.baseRate}
                      onChange={(e) => setNewRoomType({ ...newRoomType, baseRate: Number.parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-type-max-occupancy">Max Occupancy</Label>
                    <Input
                      id="room-type-max-occupancy"
                      type="number"
                      min="1"
                      value={newRoomType.maxOccupancy}
                      onChange={(e) =>
                        setNewRoomType({ ...newRoomType, maxOccupancy: Number.parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-type-description">Description</Label>
                    <Input
                      id="room-type-description"
                      value={newRoomType.description}
                      onChange={(e) => setNewRoomType({ ...newRoomType, description: e.target.value })}
                    />
                  </div>
                  <Button type="submit" disabled={isSavingRoomType}>
                    {isSavingRoomType ? (
                      <>
                        <Spinner className="mr-2" /> Saving...
                      </>
                    ) : (
                      "Add Room Type"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Room Types</CardTitle>
                <CardDescription>Manage existing room types</CardDescription>
              </CardHeader>
              <CardContent>
                {roomTypesLoading ? (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                ) : roomTypesError ? (
                  <div className="text-red-500">Error loading room types</div>
                ) : roomTypes && roomTypes.length > 0 ? (
                  <div className="space-y-4">
                    {roomTypes.map((roomType) => (
                      <div key={roomType.id} className="border rounded-md p-4">
                        <h3 className="font-medium">{roomType.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Base Rate: ${roomType.baseRate.toFixed(2)} | Max Occupancy: {roomType.maxOccupancy}
                        </p>
                        {roomType.description && <p className="text-sm mt-2">{roomType.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">No room types found</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure the basic settings for your hotel management system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    <p className="text-sm text-muted-foreground">This will appear on all invoices and emails</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-email">Company Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">This email will be used for system notifications</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger id="date-format">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currencyFormat} onValueChange={setCurrencyFormat}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AED">AED (د.إ)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Behavior</h3>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically send email notifications for bookings and check-ins
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-checkout">Automatic Checkout</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically check out guests at the scheduled checkout time
                    </p>
                  </div>
                  <Switch id="auto-checkout" checked={autoCheckout} onCheckedChange={setAutoCheckout} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="default-checkin">Default Check-in Time</Label>
                    <Input
                      id="default-checkin"
                      type="time"
                      value={defaultCheckInTime}
                      onChange={(e) => setDefaultCheckInTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-checkout">Default Check-out Time</Label>
                    <Input
                      id="default-checkout"
                      type="time"
                      value={defaultCheckOutTime}
                      onChange={(e) => setDefaultCheckOutTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                    <Input id="tax-rate" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-days">Reminder Days</Label>
                    <Input
                      id="reminder-days"
                      type="number"
                      value={reminderDays}
                      onChange={(e) => setReminderDays(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">Days before check-in to send reminder emails</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="px-6 py-4 flex justify-end gap-4 border-t">
              <Button variant="outline" onClick={refreshSettings} disabled={settingsLoading || isSavingSettings}>
                {settingsLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  "Reset"
                )}
              </Button>
              <Button
                onClick={handleSaveGeneral}
                className="flex items-center gap-2"
                disabled={settingsLoading || isSavingSettings}
              >
                {isSavingSettings ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSavingSettings ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Configure backups and data export options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Automated Backups</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The system automatically backs up your data every day at midnight.
                  </p>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue placeholder="Backup frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Data Export</h3>
                  <p className="text-sm text-muted-foreground mb-4">Export your system data in various formats.</p>
                  <div className="flex gap-2">
                    <Button variant="outline">Export as CSV</Button>
                    <Button variant="outline">Export as JSON</Button>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-md bg-amber-50">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="font-medium text-amber-800">Data Retention Policy</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      By default, the system retains booking data for 7 years. Audit logs are kept for 2 years. You can
                      modify these settings in the security tab.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>Configure the email and SMS templates sent to guests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-medium">Email Templates</h3>
                  <div className="rounded-md border overflow-hidden divide-y">
                    <div className="p-3 flex items-center justify-between hover:bg-muted/50">
                      <div className="font-medium">Booking Confirmation</div>
                      <Button size="sm" variant="ghost" className="flex items-center gap-1">
                        Edit <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="p-3 flex items-center justify-between hover:bg-muted/50">
                      <div className="font-medium">Check-in Reminder</div>
                      <Button size="sm" variant="ghost" className="flex items-center gap-1">
                        Edit <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="p-3 flex items-center justify-between hover:bg-muted/50">
                      <div className="font-medium">Check-out Reminder</div>
                      <Button size="sm" variant="ghost" className="flex items-center gap-1">
                        Edit <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="p-3 flex items-center justify-between hover:bg-muted/50">
                      <div className="font-medium">Thank You</div>
                      <Button size="sm" variant="ghost" className="flex items-center gap-1">
                        Edit <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="p-3 flex items-center justify-between hover:bg-muted/50">
                      <div className="font-medium">Cancellation</div>
                      <Button size="sm" variant="ghost" className="flex items-center gap-1">
                        Edit <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-medium">SMS Templates</h3>
                  <div className="rounded-md border overflow-hidden divide-y">
                    <div className="p-3 flex items-center justify-between hover:bg-muted/50">
                      <div className="font-medium">Booking Confirmation</div>
                      <Button size="sm" variant="ghost" className="flex items-center gap-1">
                        Edit <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="p-3 flex items-center justify-between hover:bg-muted/50">
                      <div className="font-medium">Check-in Reminder</div>
                      <Button size="sm" variant="ghost" className="flex items-center gap-1">
                        Edit <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="p-3 flex items-center justify-between hover:bg-muted/50">
                      <div className="font-medium">Check-out Reminder</div>
                      <Button size="sm" variant="ghost" className="flex items-center gap-1">
                        Edit <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button variant="outline">Add SMS Template</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Template Variables</h3>
                <p className="text-sm text-muted-foreground">
                  Use these variables in your templates to insert dynamic content:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-md p-3">
                    <code className="text-sm font-mono">{"{{guest_name}}"}</code>
                    <p className="text-xs text-muted-foreground mt-1">Guest's full name</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <code className="text-sm font-mono">{"{{booking_ref}}"}</code>
                    <p className="text-xs text-muted-foreground mt-1">Booking reference</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <code className="text-sm font-mono">{"{{check_in_date}}"}</code>
                    <p className="text-xs text-muted-foreground mt-1">Check-in date</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <code className="text-sm font-mono">{"{{check_out_date}}"}</code>
                    <p className="text-xs text-muted-foreground mt-1">Check-out date</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <code className="text-sm font-mono">{"{{room_type}}"}</code>
                    <p className="text-xs text-muted-foreground mt-1">Room type name</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <code className="text-sm font-mono">{"{{room_number}}"}</code>
                    <p className="text-xs text-muted-foreground mt-1">Room number</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email-sender">Sender Email</Label>
                    <Input id="email-sender" defaultValue="bookings@hotelmanager.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-reply-to">Reply-to Email</Label>
                    <Input id="email-reply-to" defaultValue="support@hotelmanager.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-footer">Email Footer Text</Label>
                  <Textarea
                    id="email-footer"
                    defaultValue="HotelManager Inc. | 123 Hotel St, Miami, FL | (555) 123-4567"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
            <div className="px-6 py-4 flex justify-end gap-4 border-t">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveNotifications} className="flex items-center gap-2" disabled={isSavingSettings}>
                {isSavingSettings ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSavingSettings ? "Saving..." : "Save Notification Settings"}
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Events</CardTitle>
              <CardDescription>Configure when notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Booking Confirmation</Label>
                    <p className="text-sm text-muted-foreground">Send an email when a booking is created or modified</p>
                  </div>
                  <Switch checked={bookingConfirmation} onCheckedChange={setBookingConfirmation} />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Check-in Reminder</Label>
                    <p className="text-sm text-muted-foreground">Send a reminder before guest arrival</p>
                  </div>
                  <Switch checked={checkInReminder} onCheckedChange={setCheckInReminder} />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Check-out Reminder</Label>
                    <p className="text-sm text-muted-foreground">Send a reminder on the day of departure</p>
                  </div>
                  <Switch checked={checkOutReminder} onCheckedChange={setCheckOutReminder} />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Post-stay Thank You</Label>
                    <p className="text-sm text-muted-foreground">Send a thank you email after checkout</p>
                  </div>
                  <Switch checked={postStayThankYou} onCheckedChange={setPostStayThankYou} />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Cancellation Notice</Label>
                    <p className="text-sm text-muted-foreground">Send an email when a booking is cancelled</p>
                  </div>
                  <Switch checked={cancellationNotice} onCheckedChange={setCancellationNotice} />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Staff Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications to staff for new bookings and changes
                    </p>
                  </div>
                  <Switch checked={staffNotifications} onCheckedChange={setStaffNotifications} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Role Management</CardTitle>
              <CardDescription>Manage user roles and their permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left font-medium p-3">Role Name</th>
                      <th className="text-left font-medium p-3">Description</th>
                      <th className="text-left font-medium p-3">Users Count</th>
                      <th className="text-right font-medium p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rolesLoading ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center">
                          <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Loading roles...</p>
                        </td>
                      </tr>
                    ) : rolesError ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-red-500">
                          <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                          <p>Error loading roles. Please try again.</p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetchRoles()}>
                            Retry
                          </Button>
                        </td>
                      </tr>
                    ) : roles && roles.length > 0 ? (
                      roles.map((role) => (
                        <tr className="border-t" key={role.id}>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                {role.name === "Administrator" ? (
                                  <Lock className="h-4 w-4" />
                                ) : role.name === "Manager" ? (
                                  <Users className="h-4 w-4" />
                                ) : (
                                  <User className="h-4 w-4" />
                                )}
                              </div>
                              <span className="font-medium">{role.name}</span>
                            </div>
                          </td>
                          <td className="p-3">{role.description}</td>
                          <td className="p-3">{role.users_count || 0}</td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  // Handle edit role
                                  toast({
                                    title: "Edit Role",
                                    description: `Editing ${role.name} role`,
                                  })
                                }}
                              >
                                Edit
                              </Button>
                              {role.name !== "Administrator" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={async () => {
                                    try {
                                      await deleteRole(role.id)
                                      refetchRoles()
                                      toast({
                                        title: "Role Deleted",
                                        description: `${role.name} role has been deleted`,
                                      })
                                    } catch (error) {
                                      toast({
                                        title: "Error",
                                        description: "Failed to delete role. Please try again.",
                                        variant: "destructive",
                                      })
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          No roles found. Add your first role.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center">
                <Button asChild>
                  <Link href="/settings/roles/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Role
                  </Link>
                </Button>

                <Button variant="outline" onClick={refetchRoles}>
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default Role Settings</CardTitle>
              <CardDescription>Configure default settings for new user roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Auto-assign Basic Permissions</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically grant basic view permissions to new roles
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Role Approval Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Require administrator approval for new role creation
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
            <div className="px-6 py-4 flex justify-end gap-4 border-t">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveUsers} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Role Settings
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
